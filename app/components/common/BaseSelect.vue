<template>
  <div>
    <label v-if="label" :for="fieldId" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :id="fieldId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="['input-field', error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '']"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineEmits(['update:modelValue']);
const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}>();
const generatedId = useId();
const fieldId = computed(() => props.id || generatedId);
</script>
