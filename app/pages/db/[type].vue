<script setup lang="ts">
import type { EntityTable } from '~/types'

definePageMeta({ layout: 'default' })

const localePath = useLocalePath()

const route = useRoute()
const client = useSupabaseClient()
const { fetchPendingIds } = useRevisions()

const allowedTypes: EntityTable[] = ['turrets', 'chips']
const type = computed(() => route.params.type as string)

if (!allowedTypes.includes(type.value as EntityTable)) {
  await navigateTo(localePath('/db/turrets'), { replace: true })
}

const { data: items, refresh } = await useAsyncData(
  `items-${type.value}`,
  async () => {
    const { data } = await client.from(type.value).select('*')
    return data as unknown as Record<string, any>[]
  }
)

const pendingIds = ref(new Set<string>())

async function loadPendingIds() {
  pendingIds.value = await fetchPendingIds(type.value as EntityTable)
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
  const t = type.value
  return t.charAt(0).toUpperCase() + t.slice(1)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
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
      No {{ type }} found.
    </div>

    <ItemDetailSheet
      v-model:open="sheetOpen"
      :item="selectedItem"
      :table-name="(type as EntityTable)"
      :has-pending="!!(selectedItem && pendingIds.has(selectedItem.id))"
      @edited="onEdited"
    />
  </div>
</template>
