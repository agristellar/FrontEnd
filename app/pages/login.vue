<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2">
          <NuxtLink to="/" class="inline-flex items-center gap-1">
            <span class="text-2xl font-bold text-primary-700">{{ $t('common.brandStellar') }}</span>
            <span class="text-2xl font-bold text-gold-600">{{ $t('common.brandHarvest') }}</span>
          </NuxtLink>
          <LangSwitcher button-class="border-0" />
        </div>
        <h2 class="mt-4 text-xl font-semibold text-gray-900">{{ $t('auth.signInTitle') }}</h2>
      </div>

      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <BaseInput
            v-model="form.email"
            :label="$t('auth.email')"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
            :error="errors.email"
          />
          <BaseInput
            v-model="form.password"
            :label="$t('auth.password')"
            type="password"
            :placeholder="$t('auth.passwordPlaceholder')"
            required
            :error="errors.password"
          />

          <div class="flex justify-end">
            <NuxtLink to="/forgot-password" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {{ $t('auth.forgotPassword') }}
            </NuxtLink>
          </div>

          <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="loading" class="w-full">
            {{ $t('common.signIn') }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          {{ $t('auth.noAccount') }}
          <NuxtLink to="/register" class="text-primary-600 font-medium hover:text-primary-700">{{ $t('auth.signUp') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
useSeoMeta({
  title: 'Sign In',
  description: 'Sign in to AgriStellar to manage your agricultural export campaigns or investment portfolio.',
  robots: 'noindex',
});
const { login } = useAuth();
const loading = ref(false);
const errorMsg = ref('');
const form = reactive({ email: '', password: '' });
const errors = reactive({ email: '', password: '' });

const handleLogin = async () => {
  errors.email = '';
  errors.password = '';
  errorMsg.value = '';

  if (!form.email) { errors.email = t('auth.emailRequired'); return; }
  if (!form.password) { errors.password = t('auth.passwordRequired'); return; }

  loading.value = true;
  try {
    await login(form.email, form.password);
  } catch (err: any) {
    errorMsg.value = err?.data?.error?.message || t('auth.loginFailed');
  } finally {
    loading.value = false;
  }
};
</script>
