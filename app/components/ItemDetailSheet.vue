<script setup lang="ts">
import type { EntityTable } from '~/types'
import { getQualitySoftPillClass } from '~/utils/colors'
import { rawStarsToJsonbObject } from '~/utils/stars'
import {
  getAllChipQualityRows,
  getChipQualityValues,
  resolveChipDescriptionParts,
  formatQualityValueForDb,
  QUALITY_KEYS,
  useChips
} from '~/composables/useChips'

const props = withDefaults(
  defineProps<{
    item: Record<string, unknown> | null
    tableName: EntityTable
    hasPending: boolean
    readOnly?: boolean
  }>(),
  { readOnly: false }
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edited: []
}>()

const { role } = useProfile()
const toast = useToast()
const { updateItem } = useSkills()
const { submitEdit } = useRevisions()
const { gearTypes } = useChips()

const editOpen = ref(false)
const editMode = ref(false)

const othersTables: EntityTable[] = ['frames', 'guardians', 'liveries']
const isOthersTable = computed(() => othersTables.includes(props.tableName))
const hasJsonbStars = computed(
  () => props.item && props.item.stars != null && isOthersTable.value
)

const editName = ref('')
const editDescription = ref('')
const editQuality = ref('')
const editStars = ref<Record<string, Record<string, string | null>> | null>(null)
const saving = ref(false)

const chipEditMode = ref(false)
const editChipValues = ref<{ quality: string; value0: number; value1: number | null }[]>([])
const editChipBoostType = ref('')
const editChipValuable = ref(false)
const editChipEmberOnly = ref(false)
const editChipGears = ref<string[]>([])
const savingChip = ref(false)

function parseChipGears(val: string | string[] | null | undefined): string[] {
  if (val == null) return []
  if (Array.isArray(val)) return val.filter((s) => s != null && String(s).trim() !== '').map((s) => String(s).trim())
  if (typeof val !== 'string') return []
  return val.split(',').map((s) => s.trim()).filter(Boolean)
}

function enterEditMode() {
  if (!props.item) return
  editName.value = (props.item.name as string) ?? ''
  editDescription.value = (props.item.description as string) ?? ''
  editQuality.value = (props.item.quality as string) ?? ''
  editStars.value = rawStarsToJsonbObject(props.item.stars)
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
}

async function saveEdit() {
  if (!props.item?.id || !isOthersTable.value) return
  const tableName = props.tableName as 'frames' | 'guardians' | 'liveries'
  saving.value = true
  const { error } = await updateItem(tableName, String(props.item.id), {
    name: editName.value || null,
    description: editDescription.value || null,
    quality: editQuality.value || null,
    stars: editStars.value
  })
  saving.value = false
  if (error) {
    toast.add({ title: `Update failed: ${(error as Error)?.message ?? error ?? 'Unknown error'}`, color: 'error' })
    return
  }
  toast.add({ title: 'Saved', color: 'success' })
  editMode.value = false
  emit('edited')
}

watch(open, (v) => {
  if (!v) {
    editMode.value = false
    chipEditMode.value = false
  }
})

const excludedKeys = new Set([
  'id',
  'submitted_by',
  'created_at',
  'updated_at',
  'image_url',
  'name',
  'description',
  'stars',
  'turret_id',
  'turret_name',
  'data_cooldown'
])

const chipValueKeys = new Set([
  'value_common',
  'value_fine',
  'value_rare',
  'value_epic',
  'value_legendary',
  'value_supreme',
  'value_ultimate'
])

const statFields = computed(() => {
  if (!props.item) return []
  const exclude = new Set(excludedKeys)
  if (props.tableName === 'chips') chipValueKeys.forEach((k) => exclude.add(k))
  return Object.entries(props.item)
    .filter(([key, val]) => !exclude.has(key) && val !== null && val !== undefined)
    .map(([key, val]) => ({ key, label: formatLabel(key), value: String(val) }))
})

const chipQualityValues = computed(() =>
  props.item && props.tableName === 'chips' ? getChipQualityValues(props.item as Record<string, unknown>) : []
)

const chipQualityTable = computed(() =>
  props.item && props.tableName === 'chips' ? getAllChipQualityRows(props.item as Record<string, unknown>) : []
)

const chipDescriptionParts = computed(() =>
  props.item && props.tableName === 'chips'
    ? resolveChipDescriptionParts(
        (props.item.description as string) ?? '',
        props.item as Record<string, unknown>
      )
    : []
)

const starTablesLegacy: EntityTable[] = ['rangers']
const isStarEntityLegacy = computed(() => starTablesLegacy.includes(props.tableName))

const starStats = computed(() => {
  if (!props.item || !isStarEntityLegacy.value) return []
  const prefixes = new Set<string>()
  for (const key of Object.keys(props.item)) {
    const match = key.match(/^(.+)_star\d$/)
    if (match && match[1]) prefixes.add(match[1])
  }
  return [...prefixes].map(prefix => ({
    label: formatLabel(prefix),
    values: [1, 2, 3, 4, 5].map(star => props.item?.[`${prefix}_star${star}`] ?? '—')
  }))
})

function formatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function onEdited() {
  editOpen.value = false
  emit('edited')
}

function enterChipEditMode() {
  if (!props.item || props.tableName !== 'chips') return
  editChipValues.value = getAllChipQualityRows(props.item as Record<string, unknown>)
  editChipBoostType.value = (props.item.boost_type as string) ?? ''
  editChipValuable.value = props.item.valuable === true
  editChipEmberOnly.value = props.item.ember_only === true
  editChipGears.value = parseChipGears(props.item.compatible_gears)
  chipEditMode.value = true
}

function cancelChipEdit() {
  chipEditMode.value = false
}

async function saveChipEdit() {
  if (!props.item?.id || props.tableName !== 'chips') return
  savingChip.value = true
  const payload: Record<string, unknown> = {
    boost_type: editChipBoostType.value?.trim() || null,
    valuable: editChipValuable.value,
    ember_only: editChipEmberOnly.value,
    compatible_gears: editChipGears.value.length > 0 ? editChipGears.value : null
  }
  for (const row of editChipValues.value) {
    const key = QUALITY_KEYS[row.quality]
    if (!key) continue
    const v0 = Number(row.value0)
    const v1 = row.value1 != null && !Number.isNaN(Number(row.value1)) ? Number(row.value1) : null
    payload[key] = formatQualityValueForDb(Number.isNaN(v0) ? 0 : v0, v1)
  }
  const { error } = await submitEdit('chips', props.item as Record<string, unknown>, payload)
  savingChip.value = false
  if (error) {
    toast.add({ title: `Update failed: ${error ?? 'Unknown error'}`, color: 'error' })
    return
  }
  chipEditMode.value = false
  emit('edited')
}

const showEdit = computed(
  () =>
    role.value === 'admin' &&
    !props.readOnly &&
    !props.hasPending &&
    (isOthersTable.value || props.tableName === 'chips')
)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="editMode ? 'Edit item' : 'Item Details'"
    :ui="{ content: 'w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[80vh] overflow-y-auto' }"
  >
    <template #body>
      <div v-if="item" class="space-y-4 pb-4">
        <!-- Edit mode (admin, others only) -->
        <template v-if="editMode && isOthersTable">
          <UFormField label="Name">
            <UInput v-model="editName" class="w-full" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="editDescription" class="w-full" :rows="3" />
          </UFormField>
          <UFormField label="Quality">
            <UInput v-model="editQuality" class="w-full" placeholder="e.g. Elite, Supreme" />
          </UFormField>
          <div>
            <p class="text-sm font-medium text-muted mb-2">Stars (JSONB)</p>
            <StarsEditTable v-model="editStars" :quality="editQuality" />
          </div>
          <div class="flex gap-2 pt-2">
            <UButton label="Cancel" variant="outline" color="neutral" block @click="cancelEdit" />
            <UButton label="Save" icon="i-lucide-check" block :loading="saving" @click="saveEdit" />
          </div>
        </template>

        <!-- View mode -->
        <template v-else>
        <div class="flex items-start gap-4">
          <div class="shrink-0 size-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <NuxtImg
              v-if="item.image_url"
              :src="item.image_url as string"
              :alt="(item.name as string) ?? ''"
              width="80"
              height="80"
              format="webp"
              quality="80"
              class="w-full h-full object-cover"
            />
            <UIcon v-else name="i-lucide-image" class="size-8 text-muted" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-semibold">
              {{ item.name ?? '—' }}
            </h2>
            <p v-if="item.description" class="text-sm text-muted mt-1">
              <template v-if="tableName === 'chips' && chipDescriptionParts.length">
                <span class="wrap-break-word whitespace-normal">
                  <template v-for="(part, i) in chipDescriptionParts" :key="i">
                    <template v-if="part.type === 'text'">{{ part.value }}</template>
                    <span
                      v-else
                    :class="['inline-block px-2 py-0.5 rounded-md border border-default text-xs font-medium align-baseline mx-0.5', getQualitySoftPillClass(part.quality)]"
                    >
                      {{ part.value }}
                    </span>
                  </template>
                </span>
              </template>
              <DescriptionWithSkill
                v-else
                :description="item.description as string"
                :stars="(item.stars ?? null) as any"
              />
            </p>
            <UBadge
              v-if="tableName === 'frames' && item.data_cooldown != null"
              size="xs"
              variant="soft"
              color="primary"
              class="mt-1.5"
            >
              Data cooldown: {{ item.data_cooldown }}s
            </UBadge>
            <div v-if="item.quality || item.turret_name" class="flex flex-wrap gap-2 mt-2">
              <UBadge v-if="item.quality" size="xs" :class="getQualitySoftPillClass(item.quality as string)">
                {{ item.quality }}
              </UBadge>
              <span v-if="item.turret_name" class="text-xs text-muted">
                Turret: {{ item.turret_name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Frames / Guardians / Liveries: JSONB stars (table, skill in description) -->
        <template v-if="hasJsonbStars">
          <StarsTable :stars="(item.stars as any) ?? null" :quality="(item?.quality as string) ?? undefined" />
        </template>

        <!-- Chips: quality table (7 columns, icon header, value under) -->
        <template v-else-if="tableName === 'chips' && chipQualityTable.length">
          <div class="space-y-2 pt-2">
            <!-- Chip edit: boost, gears, valuable, ember -->
            <template v-if="chipEditMode">
              <div class="space-y-3 pb-2">
                <UFormField label="Boost type">
                  <UInput
                    v-model="editChipBoostType"
                    class="w-full"
                    placeholder="e.g. HP, DMG, CRIT"
                  />
                </UFormField>
                <UFormField label="Compatible gears">
                  <USelectMenu
                    v-model="editChipGears"
                    :items="gearTypes.map((g) => ({ label: g.name, value: g.name }))"
                    value-key="value"
                    placeholder="Select gears"
                    multiple
                    class="w-full"
                  />
                </UFormField>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <UCheckbox v-model="editChipValuable" />
                    <span class="text-sm">Valuable</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <UCheckbox v-model="editChipEmberOnly" />
                    <span class="text-sm">Ember only</span>
                  </label>
                </div>
              </div>
            </template>
            <p class="text-sm font-medium text-muted">
              Quality values
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border border-default rounded-lg overflow-hidden">
                <thead>
                  <tr class="bg-muted/50 border-b border-default">
                    <th
                      v-for="row in chipQualityTable"
                      :key="row.quality"
                      class="py-2 px-1 text-center font-medium min-w-10"
                    >
                      <img
                        :src="`/ref/chips/${row.quality.toLowerCase()}.webp`"
                        :alt="row.quality"
                        class="size-6 object-contain mx-auto"
                        @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                      >
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="chipEditMode" class="border-b border-default/50">
                    <td
                      v-for="(row, idx) in editChipValues"
                      :key="row.quality"
                      class="py-1.5 px-1 align-top"
                    >
                      <div class="flex flex-col gap-1">
                        <UInput
                          v-model.number="editChipValues[idx].value0"
                          type="number"
                          size="xs"
                          class="text-center chip-quality-number"
                          placeholder="0"
                        />
                        <UInput
                          :model-value="editChipValues[idx].value1 != null && !Number.isNaN(editChipValues[idx].value1) ? editChipValues[idx].value1 : ''"
                          type="number"
                          size="xs"
                          class="text-center chip-quality-number"
                          placeholder="—"
                          @update:model-value="(v: string | number) => { editChipValues[idx].value1 = (v === '' || v == null) ? null : Number(v) }"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-else class="border-b border-default/50">
                    <td
                      v-for="row in chipQualityTable"
                      :key="row.quality"
                      class="py-2 px-1 text-center"
                    >
                      <div class="flex flex-col items-center gap-0.5">
                        <span
                          :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', getQualitySoftPillClass(row.quality)]"
                        >
                          {{ row.value0 }}
                        </span>
                        <span
                          v-if="row.value1 != null"
                          :class="['inline-block px-2 py-0.5 rounded-full text-xs font-medium', getQualitySoftPillClass(row.quality)]"
                        >
                          {{ row.value1 }}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="chipEditMode" class="flex gap-2 pt-2">
              <UButton label="Cancel" variant="outline" color="neutral" block @click="cancelChipEdit" />
              <UButton label="Save" icon="i-lucide-check" block :loading="savingChip" @click="saveChipEdit" />
            </div>
          </div>
        </template>

        <!-- Legacy star tables (e.g. rangers) with _star1.._star5 columns -->
        <template v-else-if="isStarEntityLegacy && starStats.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-3 font-medium">Stat</th>
                  <th v-for="star in 5" :key="star" class="text-center py-2 px-2 font-medium">
                    {{ star }}★
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in starStats" :key="stat.label" class="border-b border-default/50">
                  <td class="py-2 pr-3 font-medium">{{ stat.label }}</td>
                  <td v-for="(val, i) in stat.values" :key="i" class="text-center py-2 px-2">
                    {{ val }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-else-if="statFields.length">
          <div class="divide-y divide-default/50">
            <div
              v-for="field in statFields"
              :key="field.key"
              class="flex justify-between py-2 text-sm"
            >
              <span class="font-medium">{{ field.label }}</span>
              <span class="text-muted">{{ field.value }}</span>
            </div>
          </div>
        </template>

        <div v-if="showEdit && !chipEditMode" class="pt-2">
          <UButton
            label="Edit"
            icon="i-lucide-pencil"
            block
            variant="soft"
            @click="tableName === 'chips' ? enterChipEditMode() : enterEditMode()"
          />
        </div>
        <p v-if="!readOnly && hasPending" class="text-xs text-orange-500 mt-1 text-center">
          A pending edit is awaiting review
        </p>
        </template>
      </div>
    </template>
  </UModal>

  <EditItemForm
    v-if="item && !readOnly && !isOthersTable"
    v-model:open="editOpen"
    :item="item"
    :table-name="tableName"
    @edited="onEdited"
  />
</template>

<style scoped>
.chip-quality-number :deep(input[type="number"]) {
  -moz-appearance: textfield;
}
.chip-quality-number :deep(input[type="number"]::-webkit-inner-spin-button),
.chip-quality-number :deep(input[type="number"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
