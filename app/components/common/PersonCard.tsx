import Link from "next/link";

export type PersonCardProps = {
  id: number;
  name: string;
  dates: string;
  href: string;
  footer?: string;
};

export function PersonCard({ id, name, dates, href, footer }: PersonCardProps) {
  return (
    <Link
      key={id}
      href={href}
      className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-card hover:-translate-y-[2px] transition"
    >
      <div className="text-lg font-semibold text-haiti-navy">{name}</div>
      <div className="text-sm text-haiti-ink/70">{dates}</div>
      {footer && (
        <div className="mt-2 text-xs uppercase tracking-[0.12em] text-haiti-ink/60">
          {footer}
        </div>
      )}
    </Link>
  );
}
