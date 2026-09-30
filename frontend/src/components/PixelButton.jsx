export default function PixelButton({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button type={type} className={`pixel-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
