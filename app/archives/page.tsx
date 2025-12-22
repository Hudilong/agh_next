import { HeroSection } from "@/app/components/archives/HeroSection";
import { FiltersSheet } from "@/app/components/archives/FiltersSheet";
import { ResultsSection } from "@/app/components/archives/ResultsSection";
import { Navbar } from "@/app/components/common/Navbar";
import { msg } from "@/app/i18n";
import { canAccessArchives, getCurrentUser, isMember } from "@/lib/auth";
import { getPageContext, type SearchParamsInput } from "@/lib/page-params";
import {
  loadLookups,
  runQuery,
  type SearchParams,
} from "@/lib/search";
import {
  buildCommuneLabelMap,
  buildRoleLabelMap,
  buildTypeacteLabelMap,
} from "@/lib/labels";

export default async function ArchivesPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const { params: resolvedParams, lang, preserved } = await getPageContext(searchParams);
  const params = resolvedParams as SearchParams;
  const user = await getCurrentUser();
  const member = isMember(user);
  const canViewArchives = canAccessArchives(user);
  const [lookups, results] = await Promise.all([
    loadLookups(),
    runQuery(params),
  ]);
  const typeLabels = buildTypeacteLabelMap(lookups.typeacte);
  const roleLabels = buildRoleLabelMap(lookups.roles);
  const communeLabels = buildCommuneLabelMap(lookups.communes);

  return (
    <div className="min-h-screen text-haiti-ink">
      <Navbar
        lang={lang}
        preserved={preserved}
        msg={msg}
        isMember={member}
        username={user?.usager}
        pathname="/archives"
      />
      <main className="page-shell py-12 space-y-10 2xl:space-y-12">
        <HeroSection lang={lang} msg={msg} />
        <div className="grid gap-6 lg:grid-cols-[360px,1fr] 2xl:grid-cols-[400px,1fr] items-start">
          <div className="space-y-4 lg:sticky lg:top-24">
            <FiltersSheet lang={lang} params={params} lookups={lookups} />
          </div>
          <ResultsSection
            lang={lang}
            params={params}
            results={results}
            preserved={preserved}
            msg={msg}
            typeLabels={typeLabels}
            roleLabels={roleLabels}
            communeLabels={communeLabels}
            canViewDetails={canViewArchives}
          />
        </div>
      </main>
    </div>
  );
}
