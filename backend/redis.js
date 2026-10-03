import { createClient } from "redis";

const queueKey = "anonymous-chat:matchmaking:queue";
const queueMembersKey = "anonymous-chat:matchmaking:members";

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "coast-spotted-ink-90698.db.redis.io",
    port: 12321,
  },
});

redisClient
  .connect()
  .then(() => {
    console.log("connected to redis");
  })
  .catch((err) => {
    console.log("reddis connection error: ", err);
  });

const startMatchmakingScript = `
  if redis.call("SISMEMBER", KEYS[2], ARGV[1]) == 1 then
    return {0, ""}
  end

  local waitingUserId = redis.call("LPOP", KEYS[1])
  if waitingUserId then
    redis.call("SREM", KEYS[2], waitingUserId)
    return {1, waitingUserId}
  end

  redis.call("SADD", KEYS[2], ARGV[1])
  redis.call("RPUSH", KEYS[1], ARGV[1])
  return {2, ""}
`;

const cancelMatchmakingScript = `
  redis.call("LREM", KEYS[1], 0, ARGV[1])
  redis.call("SREM", KEYS[2], ARGV[1])
  return 1
`;

export async function connectRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
}

export async function startMatchmaking(userId) {
  const [status, waitingUserId] = await redisClient.eval(
    startMatchmakingScript,
    {
      keys: [queueKey, queueMembersKey],
      arguments: [userId],
    },
  );

  return {
    alreadyQueued: status === 0,
    waitingUserId: status === 1 ? waitingUserId : null,
  };
}

export async function cancelMatchmaking(userId) {
  await redisClient.eval(cancelMatchmakingScript, {
    keys: [queueKey, queueMembersKey],
    arguments: [userId],
  });
}
