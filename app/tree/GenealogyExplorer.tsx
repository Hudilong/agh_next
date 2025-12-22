'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  GenealogyFlow,
  type GenealogyGraph,
} from '@/app/components/tree/GenealogyFlow';
import { StatusMessage } from '@/app/components/common/StatusMessage';
import type { Locale } from '@/app/i18n';

export type TreeCopy = {
  quickSearch: string;
  searchPlaceholder: string;
  letterJump: string;
  allLabel: string;
  peopleLabel: string;
  noResults: string;
  tipsTitle: string;
  tips: string[];
  focusedPerson: string;
  ascendancy: string;
  descendancy: string;
  depth: string;
  choosePerson: string;
  loading: string;
  errorPrefix: string;
};

export function GenealogyExplorer({
  lang,
  initialPersonId,
  copy,
}: {
  lang: Locale;
  initialPersonId?: number | null;
  copy: TreeCopy;
}) {
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [maxDepth, setMaxDepth] = useState(3);
  const [focusId, setFocusId] = useState<string>(
    initialPersonId != null ? `${initialPersonId}` : '',
  );
  const [letterFilter, setLetterFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [graph, setGraph] = useState<GenealogyGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;
    const controller = new AbortController();
    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/tree?id=${focusId}&direction=${direction}&depth=${maxDepth}`,
          { signal: controller.signal },
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.error || !body?.data) {
          throw new Error(body?.error ?? res.statusText);
        }
        const data = body.data as GenealogyGraph & { focusId: string };
        setGraph({ nodes: data.nodes, edges: data.edges });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Failed to load tree';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
    return () => controller.abort();
  }, [focusId, direction, maxDepth]);

  const people = useMemo(() => graph?.nodes ?? [], [graph]);

  const availableLetters = useMemo(() => {
    const set = new Set(
      people
        .map((p) => p.familyName?.[0]?.toUpperCase())
        .filter((c): c is string => Boolean(c)),
    );
    return Array.from(set).sort();
  }, [people]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .filter((p) => {
        const matchesQuery =
          q.length === 0 ||
          p.name.toLowerCase().includes(q) ||
          p.familyName?.toLowerCase().includes(q);
        const matchesLetter =
          letterFilter === 'all' ||
          p.familyName?.toUpperCase().startsWith(letterFilter);
        return matchesQuery && matchesLetter;
      })
      .sort((a, b) => (a.familyName ?? a.name).localeCompare(b.familyName ?? b.name));
  }, [people, query, letterFilter]);

  const focus = people.find((p) => p.id === focusId) ?? people[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="glass-panel rounded-2xl p-5 space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-haiti-navy">
              {copy.quickSearch}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-haiti-coral focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-haiti-navy">
              {copy.letterJump}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLetterFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  letterFilter === 'all'
                    ? 'border-haiti-coral bg-haiti-coral text-white shadow-sm'
                    : 'border-white/60 bg-white/70 text-haiti-ink/80 hover:border-haiti-coral/60'
                }`}
              >
                {copy.allLabel}
              </button>
              {availableLetters.map((l) => (
                <button
                  key={l}
                  onClick={() => setLetterFilter(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    letterFilter === l
                      ? 'border-haiti-coral bg-haiti-coral text-white shadow-sm'
                      : 'border-white/60 bg-white/70 text-haiti-ink/80 hover:border-haiti-coral/60'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-haiti-navy">
              {copy.peopleLabel}
            </div>
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFocusId(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                    focusId === p.id
                      ? 'border-haiti-coral bg-white shadow-sm'
                      : 'border-white/60 bg-white/60 hover:border-haiti-coral/60'
                  }`}
                  disabled={loading}
                >
                  <div className="text-sm font-semibold text-haiti-navy">{p.name}</div>
                  <div className="text-[11px] text-haiti-ink/70">
                    {p.birth ?? '…'} – {p.death ?? '…'}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <StatusMessage className="text-xs">
                  {copy.noResults}
                </StatusMessage>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/70 p-3 space-y-1 text-xs text-haiti-ink/80">
            <div className="font-semibold text-haiti-navy text-sm">
              {copy.tipsTitle}
            </div>
            <ul className="list-disc list-inside space-y-1">
              {copy.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-haiti-ink/60">
                {copy.focusedPerson}
              </div>
              <div className="text-lg font-semibold text-haiti-navy">
                {focus?.name ?? '—'}
              </div>
              <div className="text-sm text-haiti-ink/70">
                {(focus?.birth ?? '…') + ' – ' + (focus?.death ?? '…')}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="inline-flex rounded-full bg-white/70 border border-white/60">
                <button
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                    direction === 'asc'
                      ? 'bg-haiti-coral text-white shadow-sm'
                      : 'text-haiti-ink/80 hover:text-haiti-ink'
                  }`}
                  onClick={() => setDirection('asc')}
                >
                  {copy.ascendancy}
                </button>
                <button
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                    direction === 'desc'
                      ? 'bg-haiti-coral text-white shadow-sm'
                      : 'text-haiti-ink/80 hover:text-haiti-ink'
                  }`}
                  onClick={() => setDirection('desc')}
                >
                  {copy.descendancy}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs uppercase tracking-[0.1em] text-haiti-ink/60">
                  {copy.depth}
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  step={1}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-32 accent-haiti-coral"
                />
                <span className="text-sm font-semibold text-haiti-navy">{maxDepth}</span>
              </div>
            </div>
          </div>

          <div className="h-[560px]">
            {error && (
              <StatusMessage tone="error">
                {copy.errorPrefix} {error}
              </StatusMessage>
            )}
            {!focusId && (
              <StatusMessage className="p-6">
                {copy.choosePerson}
              </StatusMessage>
            )}
            {focusId && !graph && !error && (
              <StatusMessage className="p-6">
                {copy.loading}
              </StatusMessage>
            )}
            {graph && (
              <GenealogyFlow
                graph={graph}
                focusId={focusId}
                direction={direction}
                maxDepth={maxDepth}
                lang={lang}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
