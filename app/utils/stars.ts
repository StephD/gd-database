import type { StarLevel } from '~/types'

/** Placeholder in descriptions replaced with the first "skill" value from stars. Do not change when editing descriptions. */
export const DESCRIPTION_SKILL_PLACEHOLDER = '{{skill}}'

const SKILL_KEYS = ['skill', 'skill data']

function getFirstSkillValue(stars: StarLevel[] | null): string {
  if (!stars || !Array.isArray(stars)) return ''
  for (const s of stars) {
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
  stars: StarLevel[] | null
): string {
  if (!description) return ''
  const value = getFirstSkillValue(stars)
  return description.replace(new RegExp(DESCRIPTION_SKILL_PLACEHOLDER.replace(/[{}]/g, '\\$&'), 'g'), value)
}

/** Keys to hide from the stars table. Empty = show all (including skill) in table for now. */
export const STAR_TABLE_HIDDEN_KEYS = new Set<string>()

export function starTableStatKeys(stars: StarLevel[] | null): string[] {
  if (!stars || !Array.isArray(stars)) return []
  const keys = new Set<string>()
  for (const s of stars) {
    if (s && typeof s === 'object') {
      for (const k of Object.keys(s)) {
        if (!STAR_TABLE_HIDDEN_KEYS.has(k)) keys.add(k)
      }
    }
  }
  return [...keys]
}

export function starDataAt(stars: StarLevel[] | null, index: number): Record<string, string> | null {
  if (!stars || !Array.isArray(stars)) return null
  const s = stars[index]
  return s && typeof s === 'object' && Object.keys(s).length ? s : null
}
