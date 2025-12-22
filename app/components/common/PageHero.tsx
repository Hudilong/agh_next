import Image from "next/image";
import type { ReactNode } from "react";

type HeroImage = {
  src: string;
  alt: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  backgroundImage?: HeroImage;
  tone?: "light" | "dark";
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  backgroundImage,
  tone = "dark",
  primaryCta,
  secondaryCta,
}: PageHeroProps) {
  const textClass =
    tone === "light" ? "text-haiti-ink" : "text-white";
  const descriptionClass =
    tone === "light" ? "text-haiti-ink/80" : "text-white/85";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/60 shadow-card">
      <div className="absolute inset-0">
        {backgroundImage ? (
          <>
            <Image
              src={backgroundImage.src}
              alt={backgroundImage.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1152px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-haiti-navy/80 via-haiti-navy/60 to-haiti-navy/35" />
          </>
        ) : (
          <div
            className={
              tone === "light"
                ? "absolute inset-0 bg-gradient-to-br from-white via-haiti-foam/70 to-white"
                : "absolute inset-0 bg-haiti-gradient"
            }
          />
        )}
      </div>

      <div
        className={`relative grid gap-6 md:grid-cols-[1.05fr_0.95fr] p-8 md:p-12 ${textClass}`}
      >
        <div className="space-y-3">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl leading-tight font-black drop-shadow">
            {title}
          </h1>
          {description && (
            <p className={`text-base md:text-lg max-w-2xl leading-relaxed ${descriptionClass}`}>
              {description}
            </p>
          )}
          {(actions || primaryCta || secondaryCta) && (
            <div className="flex flex-wrap gap-3 items-center">
              {primaryCta}
              {secondaryCta}
              {actions}
            </div>
          )}
        </div>

        {aside && (
          <div className="glass-panel rounded-2xl p-6 md:p-7 space-y-3 text-haiti-ink">
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
