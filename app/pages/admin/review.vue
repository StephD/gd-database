<script setup lang="ts">
import type { EntityTable } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: 'admin'
})

const { authReady } = useProfile()
const { fetchPendingRevisions, fetchLiveRecord } = useRevisions()

const entityTables: EntityTable[] = ['turrets', 'chips', 'frames', 'guardians', 'rangers']

interface RevisionEntry {
  tableName: EntityTable
  revision: Record<string, any>
  liveRecord: Record<string, any> | null
}

const entries = ref<RevisionEntry[]>([])
const loading = ref(true)

async function loadAll() {
  loading.value = true
  const all: RevisionEntry[] = []

  for (const table of entityTables) {
    const revisions = await fetchPendingRevisions(table)
    for (const rev of revisions) {
      const live = await fetchLiveRecord(table, rev.parent_id)
      all.push({ tableName: table, revision: rev, liveRecord: live })
    }
  }

  entries.value = all
  loading.value = false
}

onMounted(() => {
  loadAll()
})

async function onResolved() {
  await loadAll()
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">
      Edit Review
    </h1>

    <div v-if="!authReady || loading" class="text-center text-muted py-20">
      Loading...
    </div>

    <div v-else-if="entries.length === 0" class="text-center text-muted py-20">
      No pending edits to review.
    </div>

    <div v-else class="space-y-4">
      <RevisionCompare
        v-for="entry in entries"
        :key="entry.revision.id"
        :revision="entry.revision"
        :live-record="entry.liveRecord"
        :table-name="entry.tableName"
        @resolved="onResolved"
      />
    </div>
  </div>
</template>
