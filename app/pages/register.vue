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
        <h2 class="mt-4 text-xl font-semibold text-gray-900">{{ $t('auth.createAccountTitle') }}</h2>
      </div>

      <div class="card">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <BaseInput
            v-model="form.fullName"
            :label="$t('auth.fullName')"
            :placeholder="$t('auth.fullNamePlaceholder')"
            required
            :error="errors.fullName"
          />
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
            :placeholder="$t('auth.passwordMinHint')"
            required
            :error="errors.password"
          />
          <BaseSelect
            v-model="form.role"
            :label="$t('auth.registerAs')"
            :options="roleOptions"
            :placeholder="$t('auth.selectRole')"
            required
            :error="errors.role"
          />

          <p v-if="errorMsg" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="loading" class="w-full">
            {{ $t('auth.createAccountTitle') }}
          </BaseButton>
        </form>

        <p class="mt-6 text-center text-sm text-gray-600">
          {{ $t('auth.hasAccount') }}
          <NuxtLink to="/login" class="text-primary-600 font-medium hover:text-primary-700">{{ $t('common.signIn') }}</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { t } = useI18n();
useSeoMeta({
  title: 'Create Account',
  description: 'Join AgriStellar as a supplier to access trade financing, or as an investor to earn returns from verified agricultural export campaigns.',
});
const { register } = useAuth();
const loading = ref(false);
const errorMsg = ref('');
const form = reactive({ fullName: '', email: '', password: '', role: '' });
const errors = reactive({ fullName: '', email: '', password: '', role: '' });

const roleOptions = computed(() => [
  { value: 'Supplier', label: t('auth.roleSupplier') },
  { value: 'Investor', label: t('auth.roleInvestor') },
  { value: 'Buyer', label: t('auth.roleBuyer') },
]);

const handleRegister = async () => {
  Object.keys(errors).forEach((k) => (errors as any)[k] = '');
  errorMsg.value = '';

  if (!form.fullName) { errors.fullName = t('auth.nameRequired'); return; }
  if (!form.email) { errors.email = t('auth.emailRequired'); return; }
  if (!form.password || form.password.length < 8) { errors.password = t('auth.passwordMin'); return; }
  if (!form.role) { errors.role = t('auth.roleRequired'); return; }

  loading.value = true;
  try {
    await register({ fullName: form.fullName, email: form.email, password: form.password, role: form.role });
  } catch (err: any) {
    errorMsg.value = err?.data?.error?.message || t('auth.registerFailed');
  } finally {
    loading.value = false;
  }
};
</script>
