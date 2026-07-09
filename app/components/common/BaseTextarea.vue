<template>
  <div>
    <label v-if="label" :for="id" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="['input-field', error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '']"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineEmits(['update:modelValue']);
defineProps<{
  modelValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  rows?: number;
  id?: string;
}>();
</script>
