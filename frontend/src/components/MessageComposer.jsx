import PixelButton from "./PixelButton";

export default function MessageComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  inputClassName = "py-3",
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`pixel-input flex-1 px-3 text-white outline-none bg-slate-950 border-2 border-black disabled:cursor-not-allowed ${inputClassName}`}
        placeholder="Message..."
      />
      <PixelButton
        type="submit"
        disabled={disabled || !value.trim()}
        className="bg-green-600 text-black font-bold px-5 disabled:opacity-50 py-4 border-2 cursor-pointer"
      >
        SEND
      </PixelButton>
    </form>
  );
}
