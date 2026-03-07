import type { EntityTable } from '~/types'

export function useRevisions() {
  const client = useSupabaseClient()
  const toast = useToast()

  async function fetchPendingIds(tableName: EntityTable): Promise<Set<string>> {
    const { data } = await client
      .from(tableName)
      .select('parent_id')
      .not('parent_id', 'is', null)

    const ids = new Set<string>()
    data?.forEach((row: any) => {
      if (row.parent_id) ids.add(row.parent_id)
    })
    return ids
  }

  async function submitEdit(tableName: EntityTable, liveRecord: Record<string, any>, editedData: Record<string, any>) {
    const user = useSupabaseUser()
    const userId = user.value?.id ?? user.value?.sub
    if (!userId) return { error: 'Not authenticated' }

    const { error } = await client
      .from(tableName)
      .update(editedData)
      .eq('id', liveRecord.id)

    if (error) {
      toast.add({ title: `Failed to submit edit: ${error.message}`, color: 'error' })
      return { error: error.message }
    }

    toast.add({ title: 'Saved', color: 'success' })
    return { error: null }
  }

  async function fetchPendingRevisions(tableName: EntityTable) {
    const { data } = await client
      .from(tableName)
      .select('*')
      .not('parent_id', 'is', null)

    return data ?? []
  }

  async function fetchLiveRecord(tableName: EntityTable, id: string) {
    const { data } = await client
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    return data
  }

  async function approveEdit(tableName: EntityTable, revisionRow: Record<string, any>) {
    const { id: revisionId, parent_id: parentId, submitted_by: _sb, created_at: _ca, updated_at: _ua, ...updateFields } = revisionRow

    const { error: updateError } = await client
      .from(tableName)
      .update(updateFields)
      .eq('id', parentId)

    if (updateError) {
      toast.add({ title: `Approve failed: ${updateError.message}`, color: 'error' })
      return false
    }

    const { error: deleteError } = await client
      .from(tableName)
      .delete()
      .eq('id', revisionId)

    if (deleteError) {
      toast.add({ title: `Cleanup failed: ${deleteError.message}`, color: 'error' })
      return false
    }

    toast.add({ title: 'Edit approved and applied', color: 'success' })
    return true
  }

  async function rejectEdit(tableName: EntityTable, revisionId: string) {
    const { error } = await client
      .from(tableName)
      .delete()
      .eq('id', revisionId)

    if (error) {
      toast.add({ title: `Reject failed: ${error.message}`, color: 'error' })
      return false
    }

    toast.add({ title: 'Edit rejected', color: 'success' })
    return true
  }

  return { fetchPendingIds, submitEdit, fetchPendingRevisions, fetchLiveRecord, approveEdit, rejectEdit }
}
