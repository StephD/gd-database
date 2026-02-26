<script setup lang="ts">
import type { EntityTable } from '~/types'

const props = defineProps<{
  item: Record<string, any> | null
  tableName: EntityTable
  hasPending: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edited: []
}>()

const { role } = useProfile()

const editOpen = ref(false)

const starTables: EntityTable[] = ['frames', 'guardians', 'rangers']
const isStarEntity = computed(() => starTables.includes(props.tableName))

const excludedKeys = new Set(['id', 'parent_id', 'submitted_by', 'created_at', 'updated_at', 'image_url', 'name', 'description'])

const statFields = computed(() => {
  if (!props.item) return []
  return Object.entries(props.item)
    .filter(([key, val]) => !excludedKeys.has(key) && val !== null)
    .map(([key, val]) => ({ key, label: formatLabel(key), value: val }))
})

const starStats = computed(() => {
  if (!props.item || !isStarEntity.value) return []
  const prefixes = new Set<string>()
  for (const key of Object.keys(props.item)) {
    const match = key.match(/^(.+)_star\d$/)
    if (match) prefixes.add(match[1])
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
</script>

<template>
  <USlideover v-model:open="open" title="Item Details" side="bottom" class="sm:max-w-lg sm:mx-auto">
    <template #body>
      <div v-if="item" class="space-y-4 pb-4">
        <div class="flex items-start gap-4">
          <div class="shrink-0 size-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <NuxtImg
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              width="80"
              height="80"
              format="webp"
              quality="80"
              class="w-full h-full object-cover"
            />
            <UIcon v-else name="i-lucide-image" class="size-8 text-muted" />
          </div>
          <div>
            <h2 class="text-lg font-semibold">
              {{ item.name }}
            </h2>
            <p v-if="item.description" class="text-sm text-muted mt-1">
              {{ item.description }}
            </p>
          </div>
        </div>

        <template v-if="isStarEntity && starStats.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-3 font-medium">
                    Stat
                  </th>
                  <th v-for="star in 5" :key="star" class="text-center py-2 px-2 font-medium">
                    {{ star }}★
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in starStats" :key="stat.label" class="border-b border-default/50">
                  <td class="py-2 pr-3 font-medium">
                    {{ stat.label }}
                  </td>
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
            <div v-for="field in statFields" :key="field.key" class="flex justify-between py-2 text-sm">
              <span class="font-medium">{{ field.label }}</span>
              <span class="text-muted">{{ field.value }}</span>
            </div>
          </div>
        </template>

        <div v-if="role !== 'guest'" class="pt-2">
          <UButton
            label="Edit"
            icon="i-lucide-pencil"
            :disabled="hasPending"
            block
            variant="soft"
            @click="editOpen = true"
          />
          <p v-if="hasPending" class="text-xs text-orange-500 mt-1 text-center">
            A pending edit is awaiting review
          </p>
        </div>
      </div>
    </template>
  </USlideover>

  <EditItemForm
    v-if="item"
    v-model:open="editOpen"
    :item="item"
    :table-name="tableName"
    @edited="onEdited"
  />
</template>
