<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'role-guard', requiredRole: 'guest' })

const client = useSupabaseClient()
const toast = useToast()

const mode = ref<'login' | 'signup' | 'reset'>('login')
const email = ref('')
const password = ref('')
const submitting = ref(false)

const title = computed(() => {
  if (mode.value === 'login') return $t('login.title')
  if (mode.value === 'signup') return $t('login.signupTitle')
  return $t('login.resetTitle')
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
    toast.add({ title: $t('login.resetEmailSent'), color: 'success' })
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
    toast.add({ title: $t('login.confirmEmail'), color: 'success' })
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
        <UFormField :label="$t('login.email')">
          <UInput
            v-model="email"
            type="email"
            :placeholder="$t('login.emailPlaceholder')"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="mode !== 'reset'" :label="$t('login.password')">
          <UInput
            v-model="password"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
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
          <UButton variant="link" size="sm" :label="$t('login.forgotPassword')" @click="mode = 'reset'" />
        </p>
      </form>

      <template #footer>
        <p class="text-sm text-center text-muted">
          <template v-if="mode === 'login'">
            {{ $t('login.noAccount') }}
            <UButton variant="link" size="sm" :label="$t('login.signupTitle')" @click="mode = 'signup'" />
          </template>
          <template v-else-if="mode === 'signup'">
            {{ $t('login.alreadyHaveAccount') }}
            <UButton variant="link" size="sm" :label="$t('login.title')" @click="mode = 'login'" />
          </template>
          <template v-else>
            {{ $t('login.rememberPassword') }}
            <UButton variant="link" size="sm" :label="$t('login.title')" @click="mode = 'login'" />
          </template>
        </p>
      </template>
    </UCard>
  </div>
</template>
