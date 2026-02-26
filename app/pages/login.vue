<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'guest' })

const client = useSupabaseClient()
const toast = useToast()

const mode = ref<'login' | 'signup' | 'reset'>('login')
const email = ref('admin@admin.com')
const password = ref('admin321')
const submitting = ref(false)

const title = computed(() => {
  if (mode.value === 'login') return 'Log in'
  if (mode.value === 'signup') return 'Sign up'
  return 'Reset password'
})

async function handleSubmit() {
  submitting.value = true

  if (mode.value === 'reset') {
    const { error } = await client.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/login`
    })
    submitting.value = false
    if (error) {
      toast.add({ title: error.message, color: 'error' })
      return
    }
    toast.add({ title: 'Check your email for the reset link', color: 'success' })
    mode.value = 'login'
    return
  }

  const { error } = mode.value === 'login'
    ? await client.auth.signInWithPassword({ email: email.value, password: password.value })
    : await client.auth.signUp({ email: email.value, password: password.value })

  submitting.value = false

  if (error) {
    toast.add({ title: error.message, color: 'error' })
    return
  }

  if (mode.value === 'signup') {
    toast.add({ title: 'Check your email to confirm your account', color: 'success' })
    return
  }

  await navigateTo('/', { replace: true })
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh] px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold text-center">
          {{ title }}
        </h2>
      </template>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="mode !== 'reset'" label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          :label="title"
          :loading="submitting"
          block
        />

        <p v-if="mode === 'login'" class="text-sm text-center">
          <UButton variant="link" size="sm" label="Forgot password?" @click="mode = 'reset'" />
        </p>
      </form>

      <template #footer>
        <p class="text-sm text-center text-muted">
          <template v-if="mode === 'login'">
            No account?
            <UButton variant="link" size="sm" label="Sign up" @click="mode = 'signup'" />
          </template>
          <template v-else-if="mode === 'signup'">
            Already have an account?
            <UButton variant="link" size="sm" label="Log in" @click="mode = 'login'" />
          </template>
          <template v-else>
            Remember your password?
            <UButton variant="link" size="sm" label="Log in" @click="mode = 'login'" />
          </template>
        </p>
      </template>
    </UCard>
  </div>
</template>
