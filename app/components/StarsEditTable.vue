<script setup lang="ts">
import { normalizeStars, starTableStatKeys } from '~/utils/stars'
import { getQualitySoftBgClass } from '~/utils/colors'

const STAR_KEYS = ['1', '2', '3', '4', '5'] as const
const DEFAULT_STAT_KEYS = ['skill', 'crit_dmg', 'turret_final_dmg']

const props = defineProps<{
  modelValue: Record<string, Record<string, string | null>> | null | unknown
  quality?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, Record<string, string | null>>]
}>()

/** Editable state: "1".."5" -> statKey -> string (empty string = null in DB). */
const editable = ref<Record<string, Record<string, string>>>({})

function initEditable() {
  const raw = props.modelValue
  const normalized = normalizeStars(raw)
  const keys = normalized ? starTableStatKeys(normalized) : [...DEFAULT_STAT_KEYS]
  if (keys.length === 0) keys.push(...DEFAULT_STAT_KEYS)

  const next: Record<string, Record<string, string>> = {}
  for (const star of STAR_KEYS) {
    next[star] = {}
    const idx = STAR_KEYS.indexOf(star)
    const row = normalized?.[idx] && typeof normalized[idx] === 'object' ? normalized[idx]! : null
    for (const key of keys) {
      next[star][key] = (row && key in row && row[key] != null ? String(row[key]) : '') ?? ''
    }
  }
  editable.value = next
}

/** Stat keys present in editable (row labels). */
const statKeys = computed(() => {
  const first = editable.value['1']
  return first ? Object.keys(first) : DEFAULT_STAT_KEYS
})

/** Emit JSONB-safe object: "1".."5" -> { [statKey]: string | null }. */
function emitValue() {
  const out: Record<string, Record<string, string | null>> = {}
  for (const star of STAR_KEYS) {
    out[star] = {}
    const row = editable.value[star]
    if (!row) continue
    for (const k of Object.keys(row)) {
      const v = row[k]?.trim()
      out[star][k] = v === '' ? null : v
    }
  }
  emit('update:modelValue', out)
}

watch(() => props.modelValue, initEditable, { immediate: true })

const headerRowClass = computed(() =>
  `border-b border-default ${props.quality ? getQualitySoftBgClass(props.quality) : 'bg-muted/50'}`
)

function setCell(star: string, key: string, v: string) {
  if (editable.value[star]) {
    editable.value[star][key] = v ?? ''
    emitValue()
  }
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-default">
    <table class="w-full text-sm">
      <thead>
        <tr :class="headerRowClass">
          <th class="text-left py-2 px-3 font-medium w-28">Stat</th>
          <th
            v-for="star in STAR_KEYS"
            :key="star"
            class="text-center py-2 px-2 font-medium"
          >
            {{ star }}★
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="key in statKeys"
          :key="key"
          class="border-b border-default/50"
        >
          <td class="py-1.5 px-3 font-medium text-muted align-middle">{{ key }}</td>
          <td
            v-for="star in STAR_KEYS"
            :key="star"
            class="py-1 px-2 align-middle"
          >
            <UInput
              :model-value="editable[star]?.[key] ?? ''"
              class="min-w-0 text-center text-sm"
              size="xs"
              @update:model-value="(v) => setCell(star, key, v ?? '')"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
