// ─────────────────────────────────────────────
// BuRegDes Next — useSearch hook (Session 5)
// Filter baris tabel + highlight match
// ─────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react'
import type { BookRow, ColDef } from '@/types'

export interface SearchResult {
  row: BookRow
  matchedKeys: Set<string>   // kolom mana yang match
}

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  clearQuery: () => void
  filteredResults: SearchResult[]
  totalRows: number
  isFiltering: boolean       // true jika query tidak kosong
  highlightText: (text: string) => HighlightPart[]
}

export interface HighlightPart {
  text: string
  highlight: boolean
}

// ── Normalize untuk case-insensitive + strip spasi ekstra ──
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

// ── Cek apakah value mengandung query ──────────
function matchValue(value: string | number | undefined, q: string): boolean {
  if (value === undefined || value === null || value === '') return false
  return normalize(String(value)).includes(q)
}

// ─────────────────────────────────────────────
export function useSearch(rows: BookRow[], cols: ColDef[]): UseSearchReturn {
  const [query, setQueryRaw] = useState('')

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q)
  }, [])

  const clearQuery = useCallback(() => {
    setQueryRaw('')
  }, [])

  const normalizedQuery = useMemo(() => normalize(query), [query])
  const isFiltering = normalizedQuery.length > 0

  // ── Filter rows ────────────────────────────
  const filteredResults = useMemo<SearchResult[]>(() => {
    if (!isFiltering) {
      // Tanpa filter: return semua row tanpa matchedKeys
      return rows.map(row => ({ row, matchedKeys: new Set<string>() }))
    }

    const results: SearchResult[] = []
    for (const row of rows) {
      const matchedKeys = new Set<string>()
      for (const col of cols) {
        if (matchValue(row[col.k], normalizedQuery)) {
          matchedKeys.add(col.k)
        }
      }
      if (matchedKeys.size > 0) {
        results.push({ row, matchedKeys })
      }
    }
    return results
  }, [rows, cols, normalizedQuery, isFiltering])

  // ── Highlight helper ───────────────────────
  // Memecah teks menjadi bagian yang match dan tidak match
  const highlightText = useCallback((text: string): HighlightPart[] => {
    if (!isFiltering || !normalizedQuery) {
      return [{ text, highlight: false }]
    }

    const lowerText = normalize(text)
    const parts: HighlightPart[] = []
    let lastIndex = 0

    let idx = lowerText.indexOf(normalizedQuery)
    while (idx !== -1) {
      if (idx > lastIndex) {
        parts.push({ text: text.slice(lastIndex, idx), highlight: false })
      }
      parts.push({
        text: text.slice(idx, idx + normalizedQuery.length),
        highlight: true,
      })
      lastIndex = idx + normalizedQuery.length
      idx = lowerText.indexOf(normalizedQuery, lastIndex)
    }

    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), highlight: false })
    }

    return parts.length > 0 ? parts : [{ text, highlight: false }]
  }, [isFiltering, normalizedQuery])

  return {
    query,
    setQuery,
    clearQuery,
    filteredResults,
    totalRows: rows.length,
    isFiltering,
    highlightText,
  }
}
