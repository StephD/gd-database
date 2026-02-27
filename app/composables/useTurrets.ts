import type { Turret, TurretType } from '~/types'

export function useTurrets() {
  const client = useSupabaseClient()

  const {
    data: turretsData,
  } = useAsyncData('turrets', async () => {
    const { data } = await client
      .from('turrets')
      .select('*')
      .is('parent_id', null)
      .order('name')

    return (data ?? []) as Turret[]
  })

  const {
    data: turretTypesData,
  } = useAsyncData('turret-types', async () => {
    const { data } = await client
      .from('turret_types')
      .select('*')
      .order('name')

    return (data ?? []) as TurretType[]
  })

  const turrets = computed<Turret[]>(() => (turretsData.value ?? []) as Turret[])
  const turretTypes = computed<TurretType[]>(() => (turretTypesData.value ?? []) as TurretType[])

  const selectedType = ref<string | null>(null)

  const filteredTurrets = computed<Turret[]>(() => {
    const all = turrets.value
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
