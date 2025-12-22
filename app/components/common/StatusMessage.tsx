type Tone = "info" | "error";

export function StatusMessage({
  children,
  tone = "info",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const base = "rounded-2xl border p-4 text-sm";
  const toneClass =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-white/70 bg-white/80 text-haiti-ink/80";
  return <div className={`${base} ${toneClass} ${className}`.trim()}>{children}</div>;
}
