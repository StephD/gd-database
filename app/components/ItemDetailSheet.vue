<script setup lang="ts">
import type { EntityTable } from '~/types'
import { getQualitySoftPillClass } from '~/utils/colors'
import { resolveDescriptionWithSkill, rawStarsToJsonbObject } from '~/utils/stars'

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
const { updateItem } = useOthers()

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
    toast.add({ title: `Update failed: ${error.message}`, color: 'error' })
    return
  }
  toast.add({ title: 'Saved', color: 'success' })
  editMode.value = false
  emit('edited')
}

watch(open, (v) => {
  if (!v) editMode.value = false
})

const excludedKeys = new Set([
  'id',
  'parent_id',
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

const statFields = computed(() => {
  if (!props.item) return []
  return Object.entries(props.item)
    .filter(([key, val]) => !excludedKeys.has(key) && val !== null && val !== undefined)
    .map(([key, val]) => ({ key, label: formatLabel(key), value: String(val) }))
})

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

const showEdit = computed(
  () =>
    isOthersTable.value &&
    role.value === 'admin' &&
    !props.readOnly &&
    !props.hasPending
)
</script>

<template>
  <UModal v-model:open="open" :title="editMode ? 'Edit item' : 'Item Details'" :ui="{ content: 'sm:max-w-lg' }">
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
              {{ resolveDescriptionWithSkill(item.description as string, (item.stars ?? null) as any) }}
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

        <div v-if="showEdit" class="pt-2">
          <UButton
            label="Edit"
            icon="i-lucide-pencil"
            block
            variant="soft"
            @click="enterEditMode"
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
