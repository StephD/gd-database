import type { Chip, Turret } from '~/types'
import { CHIP_RARITY_ORDER } from '~/utils/colors'

export interface GearType {
  id: string
  name: string
}

export const QUALITY_KEYS: Record<string, keyof Chip> = {
  Common: 'value_common',
  Fine: 'value_fine',
  Rare: 'value_rare',
  Epic: 'value_epic',
  Legendary: 'value_legendary',
  Supreme: 'value_supreme',
  Ultimate: 'value_ultimate'
}

/** Gear type name → ref/gear filename (no extension) */
export const GEAR_ICON_SLUG: Record<string, string> = {
  Armor: 'armor',
  Helmet: 'helmet',
  'Energy Core': 'energyCore',
  Boots: 'boots',
  Shield: 'shield',
  Weapon: 'weapon'
}

export function getChipQualities(chip: Record<string, unknown>): string[] {
  return CHIP_RARITY_ORDER.filter((q) => {
    const key = QUALITY_KEYS[q]
    return key != null && chip[key] != null && chip[key] !== ''
  })
}

/** Parse DB value: number or string "2" or "2|4" → { value0, value1 }. Always coerce to string so "4|2" is parsed correctly. */
export function parseQualityValue(val: unknown): { value0: number; value1: number | null } {
  if (val == null || val === '') return { value0: 0, value1: null }
  const str = String(val).trim()
  if (str.includes('|')) {
    const parts = str.split('|').map((s) => Number(s.trim()))
    const a = parts[0]
    const b = parts[1]
    const v0 = (a != null && !Number.isNaN(a)) ? a : 0
    const v1 = (b != null && !Number.isNaN(b)) ? b : null
    return { value0: v0, value1: v1 }
  }
  const num = typeof val === 'number' ? val : Number(val)
  return { value0: Number.isNaN(num) ? 0 : num, value1: null }
}

/** Format for DB: "2" or "2|4". */
export function formatQualityValueForDb(value0: number, value1: number | null): string {
  if (value1 != null) return `${value0}|${value1}`
  return String(value0)
}

/** Returns { quality, value0, value1 } for each tier that has a value (for pills/filter). */
export function getChipQualityValues(chip: Record<string, unknown>): { quality: string; value0: number; value1: number | null }[] {
  return CHIP_RARITY_ORDER.filter((q) => {
    const key = QUALITY_KEYS[q]
    return key != null && chip[key] != null && chip[key] !== ''
  }).map((q) => {
    const key = QUALITY_KEYS[q]
    if (!key) return { quality: q, value0: 0, value1: null }
    const parsed = parseQualityValue(chip[key])
    return { quality: q, value0: parsed.value0, value1: parsed.value1 }
  })
}

/** Returns all 7 quality rows (value0, value1) for table/edit; missing values as 0 / null. */
export function getAllChipQualityRows(chip: Record<string, unknown>): { quality: string; value0: number; value1: number | null }[] {
  return CHIP_RARITY_ORDER.map((q) => {
    const key = QUALITY_KEYS[q]
    if (!key) return { quality: q, value0: 0, value1: null }
    const parsed = parseQualityValue(chip[key])
    return { quality: q, value0: parsed.value0, value1: parsed.value1 }
  })
}

export type ChipDescriptionPart =
  | { type: 'text'; value: string }
  | { type: 'pill'; quality: string; value: number }

/** Splits chip description: {0} = first value pills (value0), {1} = second value pills (value1). {2},{3},... = single tier. */
export function resolveChipDescriptionParts(
  description: string | null | undefined,
  chip: Record<string, unknown>
): ChipDescriptionPart[] {
  if (!description || typeof description !== 'string') return []
  const re = /\{(\d+)\}/g
  const parts: ChipDescriptionPart[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  const qualityValues = getChipQualityValues(chip)
  while ((m = re.exec(description)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', value: description.slice(lastIndex, m.index) })
    }
    const indexStr = m[1] ?? '0'
    const index = parseInt(indexStr, 10)
    if (index === 0) {
      qualityValues.forEach(({ quality, value0 }) => parts.push({ type: 'pill', quality, value: value0 }))
    } else if (index === 1) {
      qualityValues.forEach(({ quality, value1 }) => {
        if (value1 != null) parts.push({ type: 'pill', quality, value: value1 })
      })
    } else {
      const qualityVal = CHIP_RARITY_ORDER[index]
      if (qualityVal == null || typeof qualityVal !== 'string') {
        parts.push({ type: 'pill', quality: 'Other', value: 0 })
      } else {
        const row = qualityValues.find((r) => r.quality === qualityVal)
        const val = row ? row.value0 : 0
        parts.push({ type: 'pill', quality: qualityVal, value: val })
      }
    }
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

function parseList(value: string | string[] | null | undefined): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter((s) => s != null && String(s).trim() !== '').map((s) => String(s).trim())
  if (typeof value !== 'string') return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

export function useChips() {
  const client = useSupabaseClient()

  const { data: chipsData, pending: chipsPending, refresh: refreshChips } = useAsyncData('chips-list', async () => {
    const { data, error } = await client
      .from('chips')
      .select('*')
      .order('name')
    if (error) return [] as Chip[]
    return (data ?? []) as Chip[]
  })

  const { data: gearTypesData, pending: gearPending, refresh: refreshGear } = useAsyncData('gear-types', async () => {
    const { data } = await client.from('gear_types').select('*').order('name')
    return (data ?? []) as GearType[]
  })

  const { data: turretsData, pending: turretsPending, refresh: refreshTurrets } = useAsyncData('chips-turrets', async () => {
    const { data } = await client
      .from('turrets')
      .select('id, name')
      .order('name')
    return (data ?? []) as Pick<Turret, 'id' | 'name'>[]
  })

  const chips = computed<Chip[]>(() => (chipsData.value ?? []) as Chip[])
  const gearTypes = computed<GearType[]>(() => (gearTypesData.value ?? []) as GearType[])
  const turrets = computed<Pick<Turret, 'id' | 'name'>[]>(() => (turretsData.value ?? []) as Pick<Turret, 'id' | 'name'>[])

  const boostTypes = computed<string[]>(() => {
    const set = new Set<string>()
    chips.value.forEach((c) => {
      if (c.boost_type?.trim()) set.add(c.boost_type.trim())
    })
    return Array.from(set).sort()
  })

  /** Multi-select: empty = "all" (no filter). Default all. */
  const selectedGears = ref<string[]>([])
  const selectedTurrets = ref<string[]>([])
  const valuableOnly = ref(false)
  const selectedQualities = ref<string[]>(['Legendary', 'Supreme', 'Ultimate'])
  const selectedBoostTypes = ref<string[]>([])

  const filteredChips = computed<Chip[]>(() => {
    let list = chips.value

    if (selectedGears.value.length > 0) {
      const gearSet = new Set(selectedGears.value)
      const gearNames = new Set(gearTypes.value.filter((g) => gearSet.has(g.id) || gearSet.has(g.name)).map((g) => g.name))
      list = list.filter((c) => {
        const gears = parseList(c.compatible_gears)
        return gears.some((g) => gearNames.has(g) || gearSet.has(g))
      })
    }

    if (selectedTurrets.value.length > 0) {
      const turretSet = new Set(selectedTurrets.value)
      const turretNames = new Set(turrets.value.filter((t) => turretSet.has(t.id) || turretSet.has(t.name)).map((t) => t.name))
      list = list.filter((c) => {
        const turretsList = parseList(c.affected_turrets)
        return turretsList.some((t) => turretNames.has(t) || turretSet.has(t))
      })
    }

    if (valuableOnly.value) {
      list = list.filter((c) => c.valuable === true)
    }

    if (selectedQualities.value.length > 0) {
      const qualitySet = new Set(selectedQualities.value)
      list = list.filter((c) =>
        selectedQualities.value.some((q) => {
          const key = QUALITY_KEYS[q]
          return key && c[key] != null && c[key] !== ''
        })
      )
    }

    if (selectedBoostTypes.value.length > 0) {
      const boostSet = new Set(selectedBoostTypes.value)
      list = list.filter((c) => c.boost_type?.trim() && boostSet.has(c.boost_type.trim()))
    }

    return list
  })

  const isLoading = computed(() => chipsPending.value || gearPending.value || turretsPending.value)

  async function refresh() {
    await Promise.all([
      refreshChips(),
      refreshGear(),
      refreshTurrets()
    ])
  }

  function toggleGear(idOrName: string) {
    const i = selectedGears.value.indexOf(idOrName)
    if (i === -1) selectedGears.value = [...selectedGears.value, idOrName]
    else selectedGears.value = selectedGears.value.filter((_, j) => j !== i)
  }

  function toggleTurret(idOrName: string) {
    const i = selectedTurrets.value.indexOf(idOrName)
    if (i === -1) selectedTurrets.value = [...selectedTurrets.value, idOrName]
    else selectedTurrets.value = selectedTurrets.value.filter((_, j) => j !== i)
  }

  function toggleQuality(q: string) {
    const i = selectedQualities.value.indexOf(q)
    if (i === -1) selectedQualities.value = [...selectedQualities.value, q]
    else selectedQualities.value = selectedQualities.value.filter((_, j) => j !== i)
  }

  function toggleBoostType(b: string) {
    const i = selectedBoostTypes.value.indexOf(b)
    if (i === -1) selectedBoostTypes.value = [...selectedBoostTypes.value, b]
    else selectedBoostTypes.value = selectedBoostTypes.value.filter((_, j) => j !== i)
  }

  function clearGears() {
    selectedGears.value = []
  }

  function clearTurrets() {
    selectedTurrets.value = []
  }

  function clearQualities() {
    selectedQualities.value = []
  }

  function clearBoostTypes() {
    selectedBoostTypes.value = []
  }

  return {
    chips,
    gearTypes,
    turrets,
    boostTypes,
    selectedGears,
    selectedTurrets,
    valuableOnly,
    selectedQualities,
    selectedBoostTypes,
    filteredChips,
    isLoading,
    refresh,
    toggleGear,
    toggleTurret,
    toggleQuality,
    toggleBoostType,
    clearGears,
    clearTurrets,
    clearQualities,
    clearBoostTypes,
    getChipQualities,
    QUALITY_OPTIONS: CHIP_RARITY_ORDER
  }
}
