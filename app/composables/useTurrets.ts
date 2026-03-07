import type { Turret, TurretType } from '~/types'

export function useTurrets() {
  const client = useSupabaseClient()

  const {
    data: turretsData,
    pending: turretsPending,
  } = useAsyncData('turrets', async () => {
    const { data } = await client
      .from('turrets')
      .select('*')
      .order('name')

    return (data ?? []) as Turret[]
  })

  const {
    data: turretTypesData,
    pending: turretTypesPending,
  } = useAsyncData('turret-types', async () => {
    const { data } = await client
      .from('turret_types')
      .select('*')
      .order('name')

    return (data ?? []) as TurretType[]
  })

  const turrets = computed<Turret[]>(() => (turretsData.value ?? []) as Turret[])
  const turretTypes = computed<TurretType[]>(() => (turretTypesData.value ?? []) as TurretType[])
  const isLoading = computed<boolean>(() => turretsPending.value || turretTypesPending.value)

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
    isLoading,
  }
}
