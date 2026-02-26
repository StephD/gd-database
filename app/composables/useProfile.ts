import type { UserProfile, UserRole } from '~/types'

export function useProfile() {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  const profile = useState<UserProfile | null>('profile', () => null)
  const loading = useState('profile-loading', () => false)
  const authReady = useState('auth-ready', () => false)
  const loggingOut = useState('logging-out', () => false)

  const isAdmin = computed(() => profile.value?.is_admin ?? false)
  const isLoggedIn = computed(() => !!user.value)

  /** One of: guest, user, admin */
  const role = computed<UserRole>(() => {
    if (!user.value) return 'guest'
    if (!authReady.value) return 'user'
    return profile.value?.is_admin ? 'admin' : 'user'
  })

  async function fetchProfile() {
    const userId = user.value?.sub ?? user.value?.id
    if (!userId) {
      profile.value = null
      loading.value = false
      authReady.value = true
      return
    }

    loading.value = true
    const { data } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    profile.value = data as UserProfile | null
    loading.value = false
    authReady.value = true
  }

  async function logout() {
    loggingOut.value = true
    try {
      await client.auth.signOut()
      // user ref is owned by useSupabaseUser() — don't mutate it directly.
      // signOut() triggers the auth state change which clears it automatically.
      profile.value = null
      await navigateTo('/', { replace: true })
    } finally {
      loggingOut.value = false
    }
  }

  watch(user, () => {
    fetchProfile()
  }, { immediate: true })

  return { profile, loading, authReady, loggingOut, role, isAdmin, isLoggedIn, logout, fetchProfile }
}
