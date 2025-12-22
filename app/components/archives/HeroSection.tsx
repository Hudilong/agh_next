import { PageHero } from "@/app/components/common/PageHero";
import type { Locale, MsgFn } from "@/app/i18n";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";

const ARCHIVES_COPY: LocalizedCopy<{
  tagline: string;
  copy: string;
}> = {
  fr: {
    tagline: "Haïti vivante",
    copy:
      "Explorez les actes, personnes et lieux des archives nationales. Chaque recherche rapproche votre famille de ses racines.",
  },
  en: {
    tagline: "Haiti alive",
    copy:
      "Explore acts, people, and places from the national archives. Each search brings your family closer to its roots.",
  },
  es: {
    tagline: "Haití viva",
    copy:
      "Explora actos, personas y lugares de los archivos nacionales. Cada búsqueda acerca a tu familia a sus raíces.",
  },
  ht: {
    tagline: "Ayiti vivan",
    copy:
      "Eksplore zak, moun ak kote ki soti nan achiv nasyonal yo. Chak rechèch rapwoche fanmi ou ak rasin li.",
  },
};

export function HeroSection({
  lang,
  msg,
}: {
  lang: Locale;
  msg: MsgFn;
}) {
  const { tagline, copy } = selectCopy(ARCHIVES_COPY, lang);

  return (
    <PageHero
      eyebrow={tagline}
      title={msg(lang, "heroTitle")}
      description={msg(lang, "heroSubtitle")}
      backgroundImage={{ src: "/archives_hero.jpg", alt: "Coastal view of Haiti" }}
      aside={
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-haiti-coral to-haiti-sky text-white flex items-center justify-center font-semibold shadow-card">
              AGH
            </div>
            <div>
              <div className="text-lg font-semibold text-haiti-navy">
                {tagline}
              </div>
            </div>
          </div>
          <p className="text-sm text-haiti-ink/80">{copy}</p>
        </div>
      }
    />
  );
}
