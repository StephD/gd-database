<script setup lang="ts">
import type { EntityTable } from '~/types'

const props = defineProps<{
  revision: Record<string, any>
  liveRecord: Record<string, any> | null
  tableName: EntityTable
}>()

const emit = defineEmits<{
  resolved: []
}>()

const { approveEdit, rejectEdit } = useRevisions()
const acting = ref(false)

const excludedKeys = new Set(['id', 'parent_id', 'submitted_by', 'created_at', 'updated_at'])

const comparedFields = computed(() => {
  if (!props.liveRecord) return []

  return Object.keys(props.revision)
    .filter(key => !excludedKeys.has(key))
    .map(key => ({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      liveValue: props.liveRecord?.[key] ?? '—',
      proposedValue: props.revision[key] ?? '—',
      changed: props.revision[key] !== props.liveRecord?.[key]
    }))
})

async function approve() {
  acting.value = true
  const ok = await approveEdit(props.tableName, props.revision)
  acting.value = false
  if (ok) emit('resolved')
}

async function reject() {
  acting.value = true
  const ok = await rejectEdit(props.tableName, props.revision.id)
  acting.value = false
  if (ok) emit('resolved')
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">
            {{ revision.name || 'Unnamed' }}
          </h3>
          <p class="text-xs text-muted">
            {{ tableName }}
          </p>
        </div>
        <UBadge color="warning" variant="subtle" label="Pending" />
      </div>
    </template>

    <div v-if="liveRecord" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-default">
            <th class="text-left py-2 pr-3 font-medium">
              Field
            </th>
            <th class="text-left py-2 px-3 font-medium">
              Current
            </th>
            <th class="text-left py-2 px-3 font-medium">
              Proposed
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="field in comparedFields"
            :key="field.key"
            :class="field.changed ? 'bg-warning/10' : ''"
            class="border-b border-default/50"
          >
            <td class="py-2 pr-3 font-medium">
              {{ field.label }}
            </td>
            <td class="py-2 px-3">
              {{ field.liveValue }}
            </td>
            <td class="py-2 px-3" :class="field.changed ? 'font-semibold text-warning' : ''">
              {{ field.proposedValue }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-muted py-4">
      Original record not found
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          label="Reject"
          color="error"
          variant="soft"
          icon="i-lucide-x"
          :loading="acting"
          @click="reject"
        />
        <UButton
          label="Approve"
          color="success"
          variant="soft"
          icon="i-lucide-check"
          :loading="acting"
          @click="approve"
        />
      </div>
    </template>
  </UCard>
</template>
