<script setup lang="ts">
import { CHIP_RARITY_ORDER } from '~/utils/colors'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  created: []
}>()

const toast = useToast()
const client = useSupabaseClient()
const { gearTypes, turrets, boostTypes, refresh } = useChips()

const name = ref('')
const description = ref('')
const compatibleGears = ref<string[]>([])
const affectedTurrets = ref<string[]>([])
const boostType = ref('')
const valuable = ref(false)
const emberOnly = ref(false)
const imageUrl = ref('')
const saving = ref(false)

const valueByQuality = ref<Record<string, number | ''>>({
  Common: '',
  Fine: '',
  Rare: '',
  Epic: '',
  Legendary: '',
  Supreme: '',
  Ultimate: ''
})

function num(v: number | ''): number | null {
  return v === '' || v == null ? null : Number(v)
}

function resetForm() {
  name.value = ''
  description.value = ''
  compatibleGears.value = []
  affectedTurrets.value = []
  boostType.value = ''
  valuable.value = false
  emberOnly.value = false
  imageUrl.value = ''
  valueByQuality.value = {
    Common: '',
    Fine: '',
    Rare: '',
    Epic: '',
    Legendary: '',
    Supreme: '',
    Ultimate: ''
  }
}

function cancel() {
  resetForm()
  open.value = false
}

async function createChip() {
  if (!name.value?.trim()) {
    toast.add({ title: 'Name is required', color: 'error' })
    return
  }
  saving.value = true
  const v = valueByQuality.value
  const row: Record<string, unknown> = {
    name: name.value.trim(),
    description: description.value?.trim() || null,
    compatible_gears: compatibleGears.value.length ? compatibleGears.value : null,
    affected_turrets: affectedTurrets.value.length ? affectedTurrets.value : null,
    boost_type: boostType.value?.trim() || null,
    value_common: num(v.Common),
    value_fine: num(v.Fine),
    value_rare: num(v.Rare),
    value_epic: num(v.Epic),
    value_legendary: num(v.Legendary),
    value_supreme: num(v.Supreme),
    value_ultimate: num(v.Ultimate),
    valuable: valuable.value,
    ember_only: emberOnly.value,
    image_url: imageUrl.value?.trim() || null
  }
  const { error } = await client.from('chips').insert(row)
  saving.value = false
  if (error) {
    const msg = error?.message ?? String(error) ?? 'Unknown error'
    toast.add({ title: `Create failed: ${msg}`, color: 'error' })
    return
  }
  toast.add({ title: 'Chip created', color: 'success' })
  resetForm()
  open.value = false
  await refresh()
  emit('created')
}

watch(open, (v) => {
  if (!v) resetForm()
})

const qualityOptions = CHIP_RARITY_ORDER
const gearOptions = computed(() => gearTypes.value.map((g) => ({ label: g.name, value: g.name })))
const turretOptions = computed(() => turrets.value.map((t) => ({ label: t.name, value: t.name })))
</script>

<template>
  <UModal
    v-model:open="open"
    title="New chip"
    :ui="{ content: 'w-[calc(100%-1.5rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto' }"
  >
    <template #body>
      <form class="space-y-3 pb-4" @submit.prevent="createChip">
        <UFormField label="Name" required>
          <UInput v-model="name" class="w-full" placeholder="Chip name" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="description" class="w-full" :rows="2" placeholder="Description" />
        </UFormField>
        <UFormField label="Compatible gears">
          <USelectMenu
            v-model="compatibleGears"
            :items="gearOptions"
            value-key="value"
            placeholder="Select gears"
            multiple
            class="w-full"
          />
        </UFormField>
        <UFormField label="Affected turrets">
          <USelectMenu
            v-model="affectedTurrets"
            :items="turretOptions"
            value-key="value"
            placeholder="Select turrets"
            multiple
            class="w-full"
          />
        </UFormField>
        <UFormField label="Boost type">
          <UInput v-model="boostType" class="w-full" placeholder="e.g. HP, DMG, CRIT" />
        </UFormField>
        <div class="grid grid-cols-2 gap-2">
          <UFormField v-for="q in qualityOptions" :key="q" :label="q">
            <UInput
              v-model="valueByQuality[q]"
              type="number"
              step="any"
              class="w-full"
              placeholder="—"
            />
          </UFormField>
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="valuable" />
            <span class="text-sm">Valuable</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <UCheckbox v-model="emberOnly" />
            <span class="text-sm">Ember only</span>
          </label>
        </div>
        <UFormField label="Image URL">
          <UInput v-model="imageUrl" type="url" class="w-full" placeholder="https://…" />
        </UFormField>
        <div class="flex gap-2 pt-2">
          <UButton label="Cancel" variant="outline" color="neutral" block @click="cancel" />
          <UButton type="submit" label="Create" icon="i-lucide-plus" block :loading="saving" />
        </div>
      </form>
    </template>
  </UModal>
</template>
