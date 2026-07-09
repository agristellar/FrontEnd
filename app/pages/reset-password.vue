<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <img src="~/assets/images/logo.png" alt="AgriStellar" class="h-9 mx-auto" />
        </NuxtLink>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">{{ $t('auth.resetPasswordTitle') }}</h2>
        <p class="mt-2 text-sm text-gray-500">{{ $t('auth.resetPasswordDesc') }}</p>
      </div>

      <div class="card">
        <!-- Success State -->
        <div v-if="success" class="text-center py-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('auth.passwordResetDone') }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ $t('auth.passwordResetDoneDesc') }}</p>
          <NuxtLink to="/login" class="inline-flex px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition text-sm">
            {{ $t('common.signIn') }}
          </NuxtLink>
        </div>

        <!-- Invalid Token State -->
        <div v-else-if="!token || !email" class="text-center py-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('auth.invalidResetLink') }}</h3>
          <p class="text-sm text-gray-500 mb-6">{{ $t('auth.invalidResetLinkDesc') }}</p>
          <NuxtLink to="/forgot-password" class="text-primary-600 font-medium text-sm hover:text-primary-700">
            {{ $t('auth.requestNewLink') }}
          </NuxtLink>
        </div>

        <!-- Form State -->
        <form v-else @submit.prevent="handleReset" class="space-y-5">
          <BaseInput
            v-model="password"
            :label="$t('auth.newPassword')"
            type="password"
            :placeholder="$t('auth.newPasswordPlaceholder')"
            required
          />
          <BaseInput
            v-model="confirmPassword"
            :label="$t('auth.confirmPassword')"
            type="password"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
            required
            :error="mismatchError"
          />

          <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="loading" class="w-full">
            {{ $t('auth.resetPassword') }}
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
const route = useRoute();
const api = useApi();

useSeoMeta({ title: 'Reset Password', robots: 'noindex' });

const token = computed(() => route.query.token as string);
const email = computed(() => route.query.email as string);

const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const success = ref(false);
const errorMsg = ref('');

const mismatchError = computed(() => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    return t('auth.passwordMismatch');
  }
  return '';
});

const handleReset = async () => {
  errorMsg.value = '';
  if (password.value.length < 8) { errorMsg.value = t('auth.passwordTooShort'); return; }
  if (password.value !== confirmPassword.value) { return; }

  loading.value = true;
  try {
    await api.post('/auth/reset-password', {
      email: email.value,
      token: token.value,
      password: password.value,
    });
    success.value = true;
  } catch (err: any) {
    errorMsg.value = err?.data?.error?.message || t('auth.resetFailed');
  }
  loading.value = false;
};
</script>
