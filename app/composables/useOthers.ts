import type { Frame, Guardian, Livery } from '~/types'

export type OthersItem = Frame | (Guardian & { turret_name?: string }) | Livery

export function useOthers() {
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

  return { fetchFrames, fetchGuardians, fetchLiveries, fetchBySubtype }
}
