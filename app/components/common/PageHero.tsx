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
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, (max-width: 1680px) 1200px, 1500px"
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
        className={`relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] p-6 sm:p-8 md:p-10 lg:p-12 2xl:p-14 3xl:p-16 ${textClass}`}
      >
        <div className="space-y-3">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.2em] opacity-80">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight font-black drop-shadow max-w-4xl">
            {title}
          </h1>
          {description && (
            <p className={`text-base md:text-lg 2xl:text-xl max-w-2xl leading-relaxed ${descriptionClass}`}>
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
          <div className="glass-panel rounded-2xl p-5 sm:p-6 md:p-7 space-y-3 text-haiti-ink">
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
