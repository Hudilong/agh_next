type ChipProps = {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md";
};

export function Chip({ label, active = false, href, onClick, size = "sm" }: ChipProps) {
  const base =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-4 py-2 text-sm";
  const common =
    "rounded-full font-semibold border transition inline-flex items-center justify-center";
  const activeClass = "border-haiti-coral bg-haiti-coral text-white shadow-sm";
  const inactiveClass =
    "border-white/60 bg-white/70 text-haiti-ink/80 hover:border-haiti-coral/60";
  const className = `${base} ${common} ${active ? activeClass : inactiveClass}`;

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
