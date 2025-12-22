type CtaButtonsProps = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CtaButtons({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaButtonsProps) {
  return (
    <>
      <a
        href={primaryHref}
        className="px-5 py-3 rounded-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white text-sm font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
      >
        {primaryLabel}
      </a>
      {secondaryLabel && secondaryHref && (
        <a
          href={secondaryHref}
          className="px-5 py-3 rounded-full text-haiti-navy text-sm font-semibold bg-white/90 backdrop-blur border border-white/70 shadow-sm hover:border-haiti-ink/30 transition"
        >
          {secondaryLabel}
        </a>
      )}
    </>
  );
}
