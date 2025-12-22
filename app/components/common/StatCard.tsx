export function StatCard({
  label,
  value,
  accent = "from-haiti-coral to-haiti-sky",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-card">
      <div className="text-xs uppercase tracking-[0.15em] text-haiti-ink/65">
        {label}
      </div>
      <div className="text-3xl font-bold text-haiti-navy">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className={`h-[3px] mt-3 rounded-full bg-gradient-to-r ${accent}`} />
    </div>
  );
}
