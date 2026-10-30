<template>
  <div>
    <label v-if="label" :for="fieldId" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="fieldId"
        :type="type === 'password' && showPassword ? 'text' : type"
        :autocomplete="autocomplete"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="['input-field', type === 'password' ? 'pr-12' : '', error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '']"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
      />
      <button v-if="type === 'password'" type="button" :disabled="disabled" :aria-label="passwordLabel" :aria-pressed="showPassword" :aria-controls="fieldId" class="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-r-lg" @click="showPassword = !showPassword"><IconEyeOff v-if="showPassword" :size="20" aria-hidden="true" /><IconEye v-else :size="20" aria-hidden="true" /></button>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { IconEye, IconEyeOff } from '@tabler/icons-vue';
const { locale } = useI18n();
const showPassword = ref(false);
const passwordLabel = computed(() => locale.value === 'en' ? (showPassword.value ? 'Hide password' : 'Show password') : (showPassword.value ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'));
defineEmits(['update:modelValue', 'blur']);
const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  type?: string;
  autocomplete?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
}>();
const generatedId = useId();
const fieldId = computed(() => props.id || generatedId);
</script>
