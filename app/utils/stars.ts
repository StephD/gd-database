import type { StarLevel } from '~/types'

/** Placeholder in descriptions replaced with the first "skill" value from stars. Do not change when editing descriptions. */
export const DESCRIPTION_SKILL_PLACEHOLDER = '{{skill}}'

/** Normalize stars from DB: object format {"1": {...}|null, "2": null, ...} (always keys "1"-"5") → array [star1, star2, ...] for UI. */
export function normalizeStars(raw: unknown): StarLevel[] | null {
  if (raw == null) return null
  if (Array.isArray(raw)) {
    const arr: StarLevel[] = []
    for (let i = 0; i < 5; i++) {
      const data = raw[i]
      arr.push(data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length ? data : null)
    }
    return arr.some(Boolean) ? arr : null
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, Record<string, string> | null>
    const arr: StarLevel[] = []
    for (let i = 1; i <= 5; i++) {
      const data = obj[String(i)]
      arr.push(data && typeof data === 'object' && Object.keys(data).length ? data : null)
    }
    return arr.some(Boolean) ? arr : null
  }
  return null
}

const SKILL_KEYS = ['skill', 'skill data']

function getFirstSkillValue(stars: StarLevel[] | null | unknown): string {
  const normalized = Array.isArray(stars) ? stars : normalizeStars(stars)
  if (!normalized) return ''
  for (const s of normalized) {
    if (!s || typeof s !== 'object') continue
    for (const key of SKILL_KEYS) {
      if (key in s && s[key]) return String(s[key])
    }
  }
  return ''
}

/**
 * Replaces {{skill}} in description with the first "skill" (or "skill data") value from stars.
 * The placeholder is fixed so player edits cannot change it.
 */
export function resolveDescriptionWithSkill(
  description: string | null | undefined,
  stars: StarLevel[] | null | unknown
): string {
  if (!description) return ''
  const value = getFirstSkillValue(stars)
  return description.replace(new RegExp(DESCRIPTION_SKILL_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), value)
}

export type DescriptionSkillPart =
  | { type: 'text'; value: string }
  | { type: 'skill'; value: string }

/**
 * Splits description by {{skill}} and returns segments so the skill value can be rendered with custom styling (e.g. pill).
 */
export function resolveDescriptionWithSkillParts(
  description: string | null | undefined,
  stars: StarLevel[] | null | unknown
): DescriptionSkillPart[] {
  if (!description) return []
  const value = getFirstSkillValue(stars)
  const re = new RegExp(DESCRIPTION_SKILL_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g')
  const parts: DescriptionSkillPart[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(description)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: description.slice(lastIndex, m.index) })
    }
    parts.push({ type: 'skill', value })
    lastIndex = re.lastIndex
  }
  if (lastIndex < description.length) {
    parts.push({ type: 'text', value: description.slice(lastIndex) })
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', value: description })
  }
  return parts
}

/** Keys to hide from the stars table. Empty = show all (including skill) in table for now. */
export const STAR_TABLE_HIDDEN_KEYS = new Set<string>()

export function starTableStatKeys(stars: StarLevel[] | null | unknown): string[] {
  const normalized = Array.isArray(stars) ? stars : normalizeStars(stars)
  if (!normalized) return []
  const keys = new Set<string>()
  for (const s of normalized) {
    if (s && typeof s === 'object') {
      for (const k of Object.keys(s)) {
        if (!STAR_TABLE_HIDDEN_KEYS.has(k)) keys.add(k)
      }
    }
  }
  return [...keys]
}

export function starDataAt(stars: StarLevel[] | null | unknown, index: number): Record<string, string> | null {
  const normalized = Array.isArray(stars) ? stars : normalizeStars(stars)
  if (!normalized) return null
  const s = normalized[index]
  return s && typeof s === 'object' && Object.keys(s).length ? s : null
}

/** Build JSONB-safe object {"1": {...}, "2": {...}, ...} from raw stars for DB update. */
export function rawStarsToJsonbObject(raw: unknown): Record<string, Record<string, string | null>> {
  const normalized = normalizeStars(raw)
  const result: Record<string, Record<string, string | null>> = { '1': {}, '2': {}, '3': {}, '4': {}, '5': {} }
  const keys = normalized ? starTableStatKeys(normalized) : ['skill', 'crit_dmg', 'turret_final_dmg']
  if (keys.length === 0) keys.push('skill', 'crit_dmg', 'turret_final_dmg')
  for (let i = 0; i < 5; i++) {
    const star = String(i + 1)
    const row = normalized?.[i]
    for (const k of keys) {
      const v = row && typeof row === 'object' && k in row && row[k] != null ? String(row[k]) : null
      result[star][k] = v
    }
  }
  return result
}
