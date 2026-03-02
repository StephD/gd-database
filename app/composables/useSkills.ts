import type { Frame, Guardian, Livery } from '~/types'

export type OthersItem = Frame | (Guardian & { turret_name?: string }) | Livery

export function useSkills() {
  const client = useSupabaseClient()

  async function fetchFrames() {
    const { data } = await client.from('frames').select('*').order('name')
    return (data ?? []) as Frame[]
  }

  async function fetchGuardians() {
    const { data } = await client.from('guardians_with_turret').select('*').order('name')
    return (data ?? []) as Guardian[]
  }

  async function fetchLiveries() {
    const { data } = await client.from('liveries_with_turret').select('*').order('name')
    return (data ?? []) as Livery[]
  }

  async function fetchBySubtype(subtype: 'frames' | 'guardians' | 'liveries') {
    if (subtype === 'frames') return fetchFrames()
    if (subtype === 'guardians') return fetchGuardians()
    return fetchLiveries()
  }

  /** Admin only: update a row in frames, guardians, or liveries. */
  async function updateItem(
    tableName: 'frames' | 'guardians' | 'liveries',
    id: string,
    payload: { name?: string | null; description?: string | null; quality?: string | null; stars?: Record<string, Record<string, string | null>> | null }
  ) {
    const { error } = await client
      .from(tableName)
      .update(payload)
      .eq('id', id)
    return { error }
  }

  return { fetchFrames, fetchGuardians, fetchLiveries, fetchBySubtype, updateItem }
}

