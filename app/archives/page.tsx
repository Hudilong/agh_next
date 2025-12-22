import { HeroSection } from "@/app/components/archives/HeroSection";
import { FiltersForm } from "@/app/components/archives/FiltersForm";
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
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <HeroSection lang={lang} msg={msg} />
        <FiltersForm lang={lang} params={params} lookups={lookups} msg={msg} />
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
      </main>
    </div>
  );
}
