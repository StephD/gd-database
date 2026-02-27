import type { Turret, TurretType } from '~/types'

export function useTurrets() {
  const client = useSupabaseClient()

  const fetchTurrets = async () => {
    const { data } = await client.from('turrets').select('*').is('parent_id', null).order('name')
    return data ?? []
  }

  const fetchTurretTypes = async () => {
    const { data } = await client.from('turret_types').select('*').order('name')
    return data ?? []
  }

  const turrets = ref<Turret[]>([])
  const turretTypes = ref<TurretType[]>([])

  onMounted(async () => {
    turrets.value = await fetchTurrets()
    turretTypes.value = await fetchTurretTypes()
  })

  const selectedType = ref<string | null>(null)

  const filteredTurrets = computed<Turret[]>(() => {
    const all = (turrets.value ?? []) as Turret[]
    if (!selectedType.value) return all
    return all.filter(t => t.type?.toLowerCase() === selectedType.value?.toLowerCase())
  })

  function toggleType(name: string) {
    selectedType.value = selectedType.value === name ? null : name
  }

  return {
    turrets,
    turretTypes,
    selectedType,
    filteredTurrets,
    toggleType,
  }
}
