<script setup lang="ts">
import type { EntityTable } from '~/types'

const props = defineProps<{
  item: Record<string, any>
  tableName: EntityTable
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edited: []
}>()

const { submitEdit } = useRevisions()
const submitting = ref(false)

const excludedKeys = new Set(['id', 'submitted_by', 'created_at', 'updated_at'])

const editableFields = computed(() =>
  Object.entries(props.item)
    .filter(([key]) => !excludedKeys.has(key))
    .map(([key, val]) => ({ key, value: val }))
)

const formData = ref<Record<string, any>>({})

watch(open, (isOpen) => {
  if (isOpen) {
    formData.value = {}
    for (const field of editableFields.value) {
      formData.value[field.key] = field.value
    }
  }
})

function formatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function fieldType(key: string, value: any): string {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'checkbox'
  if (key.includes('url')) return 'url'
  if (key === 'description') return 'textarea'
  return 'text'
}

async function handleSubmit() {
  submitting.value = true
  const changedFields: Record<string, any> = {}

  for (const [key, val] of Object.entries(formData.value)) {
    if (val !== props.item[key]) {
      changedFields[key] = val
    }
  }

  if (Object.keys(changedFields).length === 0) {
    submitting.value = false
    open.value = false
    return
  }

  const { error } = await submitEdit(props.tableName, props.item, changedFields)
  submitting.value = false

  if (!error) {
    open.value = false
    emit('edited')
  }
}
</script>

<template>
  <USlideover v-model:open="open" title="Propose Edit" side="bottom" class="sm:max-w-lg sm:mx-auto">
    <template #body>
      <form class="space-y-3 pb-4" @submit.prevent="handleSubmit">
        <template v-for="field in editableFields" :key="field.key">
          <UFormField :label="formatLabel(field.key)">
            <template v-if="fieldType(field.key, field.value) === 'textarea'">
              <UTextarea
                v-model="formData[field.key]"
                class="w-full"
                :rows="3"
              />
            </template>
            <template v-else-if="fieldType(field.key, field.value) === 'number'">
              <UInput
                v-model.number="formData[field.key]"
                type="number"
                step="any"
                class="w-full"
              />
            </template>
            <template v-else>
              <UInput
                v-model="formData[field.key]"
                :type="fieldType(field.key, field.value)"
                class="w-full"
              />
            </template>
          </UFormField>
        </template>

        <UButton
          type="submit"
          label="Submit Edit"
          icon="i-lucide-send"
          :loading="submitting"
          block
        />
      </form>
    </template>
  </USlideover>
</template>
