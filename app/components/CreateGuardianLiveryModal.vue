<script setup lang="ts">
import { rawStarsToJsonbObject } from '~/utils/stars'

const props = defineProps<{
  tableName: 'guardians' | 'liveries'
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: []
}>()

const toast = useToast()
const { createItem } = useSkills()
const { turrets } = useTurrets()

const turretId = ref<string | null>(null)
const editName = ref('')
const editDescription = ref('')
const editQuality = ref('')
const editStars = ref<Record<string, Record<string, string | null>>>(rawStarsToJsonbObject(null))
const saving = ref(false)

const turretOptions = computed(() =>
  (turrets.value ?? []).map((t) => ({ label: t.name, value: t.id }))
)

function resetForm() {
  turretId.value = null
  editName.value = ''
  editDescription.value = ''
  editQuality.value = ''
  editStars.value = rawStarsToJsonbObject(null)
}

function cancel() {
  resetForm()
  open.value = false
}

async function create() {
  if (!turretId.value) {
    toast.add({ title: 'Please select a turret', color: 'error' })
    return
  }
  saving.value = true
  const { error } = await createItem(props.tableName, {
    turret_id: turretId.value,
    name: editName.value || null,
    description: editDescription.value || null,
    quality: editQuality.value || null,
    stars: editStars.value
  })
  saving.value = false
  if (error) {
    toast.add({ title: `Create failed: ${error.message}`, color: 'error' })
    return
  }
  toast.add({ title: 'Created', color: 'success' })
  resetForm()
  open.value = false
  emit('created')
}

watch(open, (v) => {
  if (!v) resetForm()
})

const modalTitle = computed(() =>
  props.tableName === 'guardians' ? 'New Guardian' : 'New Livery'
)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="modalTitle"
    :ui="{ content: 'w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto' }"
  >
    <template #body>
      <div class="space-y-4 pb-4">
        <UFormField label="Turret" required>
          <USelect
            v-model="turretId"
            :items="turretOptions"
            value-key="value"
            placeholder="Select turret"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="editName" class="w-full" placeholder="e.g. Normal, Galaxy Sentinel" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="editDescription" class="w-full" :rows="3" placeholder="Use {{skill}} for skill text" />
        </UFormField>
        <UFormField label="Quality">
          <UInput v-model="editQuality" class="w-full" placeholder="e.g. Supreme, Ultimate" />
        </UFormField>
        <div>
          <p class="text-sm font-medium text-muted mb-2">Stars (JSONB)</p>
          <StarsEditTable v-model="editStars" :quality="editQuality" />
        </div>
        <div class="flex gap-2 pt-2">
          <UButton label="Cancel" variant="outline" color="neutral" block @click="cancel" />
          <UButton label="Create" icon="i-lucide-plus" block :loading="saving" @click="create" />
        </div>
      </div>
    </template>
  </UModal>
</template>
