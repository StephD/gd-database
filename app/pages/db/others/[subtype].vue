<script setup lang="ts">
import type { EntityTable, OthersSubtype } from '~/types'

definePageMeta({ layout: 'default' })

const localePath = useLocalePath()

const route = useRoute()
const client = useSupabaseClient()
const { fetchPendingIds } = useRevisions()

const allowedSubtypes: OthersSubtype[] = ['frames', 'guardians', 'rangers']
const subtype = computed(() => route.params.subtype as string)

if (!allowedSubtypes.includes(subtype.value as OthersSubtype)) {
  await navigateTo(localePath('/db/others/frames'), { replace: true })
}

const tabs = allowedSubtypes.map(s => ({
  label: s.charAt(0).toUpperCase() + s.slice(1),
  to: `/db/others/${s}`
}))

const { data: items, refresh } = await useAsyncData(
  `items-${subtype.value}`,
  () => client.from(subtype.value).select('*').is('parent_id', null).then(r => r.data ?? []),
  { watch: [subtype] }
)

const pendingIds = ref(new Set<string>())

async function loadPendingIds() {
  pendingIds.value = await fetchPendingIds(subtype.value as EntityTable)
}
await loadPendingIds()

const selectedItem = ref<Record<string, any> | null>(null)
const sheetOpen = ref(false)

function openSheet(item: Record<string, any>) {
  selectedItem.value = item
  sheetOpen.value = true
}

async function onEdited() {
  await refresh()
  await loadPendingIds()
}

const pageTitle = computed(() => {
  const s = subtype.value
  return s.charAt(0).toUpperCase() + s.slice(1)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex items-center gap-2 mb-6">
      <UButton
        v-for="tab in tabs"
        :key="tab.to"
        :to="localePath(tab.to)"
        :label="tab.label"
        :variant="localePath(tab.to) === route.path ? 'solid' : 'ghost'"
        :color="localePath(tab.to) === route.path ? 'primary' : 'neutral'"
        size="sm"
      />
    </div>

    <h1 class="text-2xl font-bold mb-6">
      {{ pageTitle }}
    </h1>

    <div v-if="items?.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :has-pending="pendingIds.has(item.id)"
        @click="openSheet(item)"
      />
    </div>
    <div v-else class="text-center text-muted py-20">
      No {{ subtype }} found.
    </div>

    <ItemDetailSheet
      v-model:open="sheetOpen"
      :item="selectedItem"
      :table-name="(subtype as EntityTable)"
      :has-pending="!!(selectedItem && pendingIds.has(selectedItem.id))"
      @edited="onEdited"
    />
  </div>
</template>
