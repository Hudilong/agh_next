import type { Locale } from "@/app/i18n";
import { selectCopy, type LocalizedCopy } from "@/lib/copy";

export type GeneseCopy = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  intro: string[];
  emptySections: string;
  sectionIntro: (count: number) => string;
  articleCountBadge: (count: number) => string;
  noArticles: string;
  byAuthor: (author: string) => string;
  publishedOn: (date: string) => string;
  featured: string;
};

const GENESE_COPY: LocalizedCopy<GeneseCopy> = {
  fr: {
    eyebrow: "Genèse",
    heroTitle: "Genèse",
    heroSubtitle: "Journal généalogique et historique de l'AGH.",
    intro: [
      "L'Association vous propose une série d'articles qui alimenteront vos recherches ou votre curiosité, par le biais de Genèse, son journal généalogique et historique.",
      "Les articles sont publiés dans la langue de composition par leurs auteurs.",
      "L'Association tient à souligner le travail énorme réalisé par André-Luce Fourcand et Bob de Vastey qui n'ont pas ménagé leurs efforts pour faire de ce journal une œuvre vivante et chaleureuse.",
    ],
    emptySections: "Aucune rubrique disponible pour le moment.",
    sectionIntro: (count: number) =>
      `${count} article${count === 1 ? "" : "s"} dans cette rubrique.`,
    articleCountBadge: (count: number) =>
      `${count} article${count === 1 ? "" : "s"}`,
    noArticles: "Aucun article dans cette rubrique pour le moment.",
    byAuthor: (author: string) => `Par ${author}`,
    publishedOn: (date: string) => `Publié le ${date}`,
    featured: "Mise en avant",
  },
  en: {
    eyebrow: "Genese",
    heroTitle: "Genese",
    heroSubtitle: "AGH's genealogical and historical journal.",
    intro: [
      "The Association offers a series of articles to fuel your research and curiosity through Genese, its genealogical and historical journal.",
      "Articles are published in the language chosen by their authors.",
      "We acknowledge the tremendous work by André-Luce Fourcand and Bob de Vastey, whose dedication has made this journal vibrant and welcoming.",
    ],
    emptySections: "No sections available yet.",
    sectionIntro: (count: number) =>
      `${count} article${count === 1 ? "" : "s"} in this section.`,
    articleCountBadge: (count: number) =>
      `${count} article${count === 1 ? "" : "s"}`,
    noArticles: "No articles in this section yet.",
    byAuthor: (author: string) => `By ${author}`,
    publishedOn: (date: string) => `Published on ${date}`,
    featured: "Featured",
  },
  es: {
    eyebrow: "Genese",
    heroTitle: "Genese",
    heroSubtitle: "Revista genealógica e histórica de la AGH.",
    intro: [
      "La Asociación ofrece una serie de artículos para alimentar tus investigaciones y curiosidad a través de Genese, su revista genealógica e histórica.",
      "Los artículos se publican en el idioma elegido por sus autores.",
      "La Asociación destaca el enorme trabajo de André-Luce Fourcand y Bob de Vastey, que hicieron de esta revista una obra viva y acogedora.",
    ],
    emptySections: "Ninguna sección disponible por ahora.",
    sectionIntro: (count: number) =>
      `${count} artículo${count === 1 ? "" : "s"} en esta sección.`,
    articleCountBadge: (count: number) =>
      `${count} artículo${count === 1 ? "" : "s"}`,
    noArticles: "No hay artículos en esta sección aún.",
    byAuthor: (author: string) => `Por ${author}`,
    publishedOn: (date: string) => `Publicado el ${date}`,
    featured: "Destacado",
  },
  ht: {
    eyebrow: "Jenèz",
    heroTitle: "Jenèz",
    heroSubtitle: "Jounal jeneyalojik ak istorik AGH la.",
    intro: [
      "Asosyasyon an ofri w yon seri atik pou alimante rechèch ou ak kiryozite ou atravè Jenèz, jounal jeneyalojik ak istorik li.",
      "Atik yo pibliye nan lang otè yo chwazi a.",
      "Asosyasyon an salye gwo travay André-Luce Fourcand ak Bob de Vastey ki fè jounal sa vivan ak akeyan.",
    ],
    emptySections: "Pa gen okenn ribrik disponib kounye a.",
    sectionIntro: (count: number) =>
      `${count} atik nan ribrik sa a.`,
    articleCountBadge: (count: number) =>
      `${count} atik`,
    noArticles: "Pa gen atik nan ribrik sa a pou kounye a.",
    byAuthor: (author: string) => `Pa ${author}`,
    publishedOn: (date: string) => `Pibliye le ${date}`,
    featured: "An avan",
  },
};

export function getGeneseCopy(lang: Locale): GeneseCopy {
  return selectCopy(GENESE_COPY, lang);
}
