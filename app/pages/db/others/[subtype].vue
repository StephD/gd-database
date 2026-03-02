<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { EntityTable, OthersSubtype } from '~/types'
import type { TableColumn } from '@nuxt/ui'
import { getQualityBorderClass, getQualitySoftPillClass } from '~/utils/colors'
import { resolveDescriptionWithSkill } from '~/utils/stars'

definePageMeta({ layout: 'default' })

const localePath = useLocalePath()
const { t: $t } = useI18n()
const route = useRoute()
const { fetchBySubtype } = useOthers()
const { role } = useProfile()

const allowedSubtypes: OthersSubtype[] = ['frames', 'guardians', 'liveries']
const subtype = computed(() => (route.params.subtype as string) || 'frames')

if (!allowedSubtypes.includes(subtype.value as OthersSubtype)) {
  await navigateTo(localePath('/db/others/frames'), { replace: true })
}

const tabs = [
  { label: $t('nav.frame'), to: '/db/others/frames' },
  { label: $t('nav.guardian'), to: '/db/others/guardians' },
  { label: $t('nav.livery'), to: '/db/others/liveries' }
]

type OthersRow = Record<string, unknown>

const { data: itemsData, refresh: refreshItems } = await useAsyncData(
  `others-${subtype.value}`,
  () => fetchBySubtype(subtype.value as OthersSubtype),
  { watch: [subtype] }
)

const rawItems = computed(() => (itemsData.value ?? []) as unknown as OthersRow[])

const items = computed(() => rawItems.value)

const selectedItem = ref<Record<string, unknown> | null>(null)
const sheetOpen = ref(false)

function openSheet(item: Record<string, unknown>) {
  selectedItem.value = item
  sheetOpen.value = true
}

async function onEdited() {
  await refreshItems()
  const id = selectedItem.value?.id
  if (id && itemsData.value) {
    const found = (itemsData.value as OthersRow[]).find((r) => r.id === id)
    if (found) selectedItem.value = found
  }
}

const showTurretColumn = computed(() => subtype.value === 'guardians' || subtype.value === 'liveries')

function turretDisplay(item: Record<string, unknown>) {
  return (item.turret_name as string) ?? '—'
}

const pageTitle = computed(() => {
  const s = subtype.value
  if (s === 'liveries') return $t('nav.livery')
  if (s === 'guardians') return $t('nav.guardian')
  return $t('nav.frame')
})

const StarsTableComponent = resolveComponent('StarsTable')

const tableColumns = computed<TableColumn<OthersRow>[]>(() => {
  const cols: TableColumn<OthersRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.original.name ?? '—'
        const pillClass = `inline-block px-2.5 py-1 rounded-full text-sm font-medium ${getQualitySoftPillClass(row.original.quality as string)}`
        return h('span', { class: pillClass }, String(name))
      },
      meta: { class: { th: 'w-[180px]', td: 'w-[180px]' } }
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const text = resolveDescriptionWithSkill(row.original.description as string, (row.original.stars ?? null) as any)
        const isFrame = subtype.value === 'frames'
        const dataCooldown = isFrame ? (row.original.data_cooldown as number | null | undefined) : null
        const hasCooldown = dataCooldown != null && !Number.isNaN(dataCooldown)
        return h('div', { class: 'max-w-[220px] space-y-1.5' }, [
          h('span', { class: 'block text-muted break-words whitespace-normal' }, text),
          ...(hasCooldown
            ? [
                h(
                  'span',
                  {
                    class:
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary'
                  },
                  `Data cooldown: ${dataCooldown}s`
                )
              ]
            : [])
        ])
      },
      meta: { class: { th: 'max-w-[220px]', td: 'max-w-[220px]' } }
    }
  ]
  if (showTurretColumn.value) {
    cols.push({
      accessorKey: 'turret_name',
      header: 'Turret',
      cell: ({ row }) => turretDisplay(row.original),
      meta: { class: { th: 'w-[140px]', td: 'w-[140px] text-muted' } }
    })
  }
  cols.push({
    accessorKey: 'stars',
    header: 'Stars',
    cell: ({ row }) => h(StarsTableComponent, { stars: (row.original.stars ?? null) as any, quality: row.original.quality as string }),
    meta: { class: { th: 'min-w-[320px]', td: 'min-w-[320px]' } }
  })
  return cols
})

const tableMeta = computed(() => ({
  class: {
    tr: (row: { original: OthersRow }) =>
      `border-l-4 mb-4 cursor-pointer hover:bg-muted/30`
  }
}))
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

    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold">
        {{ pageTitle }}
      </h1>
      <p v-if="items?.length" class="text-sm text-muted">
        {{ items.length }} {{ subtype }}
      </p>
    </div>

    <template v-if="items?.length">
      <!-- Desktop: table for all -->
      <div class="hidden md:block overflow-x-auto">
        <UTable
          :data="items"
          :columns="tableColumns"
          :meta="tableMeta"
          empty="No rows."
          @select="(e: Event, row: { original: OthersRow }) => openSheet(row.original)"
        />
      </div>

      <!-- Mobile: single column cards -->
      <div class="grid grid-cols-1 gap-4 md:hidden">
        <OthersCard
          v-for="item in items"
          :key="String(item.id)"
          :item="item"
          :show-turret="showTurretColumn"
          :turret-display="turretDisplay"
          @click="openSheet(item)"
        />
      </div>
    </template>

    <div v-else class="text-center text-muted py-20">
      No {{ subtype }} found.
    </div>

    <ItemDetailSheet
      v-model:open="sheetOpen"
      :item="selectedItem"
      :table-name="(subtype as EntityTable)"
      :has-pending="false"
      :read-only="role !== 'admin'"
      @edited="onEdited"
    />
  </div>
</template>
