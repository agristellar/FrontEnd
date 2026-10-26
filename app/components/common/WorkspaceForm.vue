<template>
  <form class="space-y-4" @submit.prevent="$emit('submit', { ...model })">
    <div v-for="field in fields" :key="field.key">
      <label
        :for="`field-${field.key}`"
        class="block text-sm font-medium mb-1.5"
        >{{ ui(field.label)
        }}<span v-if="field.required" class="text-red-600"> *</span></label
      >
      <textarea
        v-if="field.type === 'textarea'"
        :id="`field-${field.key}`"
        v-model="model[field.key]"
        :required="field.required"
        rows="5"
        class="w-full rounded-lg border-slate-300 text-sm"
      />
      <select
        v-else-if="field.options"
        :id="`field-${field.key}`"
        v-model="model[field.key]"
        :required="field.required"
        class="w-full rounded-lg border-slate-300 text-sm"
      >
        <option value="">
          {{ ui("Chọn") }} {{ ui(field.label) }}
        </option>
        <option
          v-for="o in field.options"
          :key="typeof o === 'string' ? o : o.value"
          :value="typeof o === 'string' ? o : o.value"
        >
          {{ ui(typeof o === "string" ? o : o.label) }}
        </option>
      </select>
      <input
        v-else-if="field.type === 'checkbox'"
        :id="`field-${field.key}`"
        v-model="model[field.key]"
        type="checkbox"
        :required="field.required"
        class="rounded border-slate-300 text-emerald-600"
      />
      <input
        v-else
        :id="`field-${field.key}`"
        v-model="model[field.key]"
        :type="field.type || 'text'"
        :required="field.required"
        :placeholder="ui(field.placeholder)"
        :step="field.type === 'number' ? 'any' : undefined"
        class="w-full rounded-lg border-slate-300 text-sm"
      />
      <p v-if="field.help" class="text-xs text-slate-500 mt-1">
        {{ ui(field.help) }}
      </p>
    </div>
    <slot name="before-submit" />
    <button
      :disabled="busy"
      class="px-5 py-2.5 bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
    >
      {{ ui(busy ? "Đang lưu…" : submitLabel) }}
    </button>
  </form>
</template>
<script setup lang="ts">
const { ui } = useWorkspaceText();

const props = withDefaults(
  defineProps<{
    fields: {
      key: string;
      label: string;
      type?: string;
      options?: any[];
      required?: boolean;
      placeholder?: string;
      help?: string;
    }[];
    initial?: Record<string, any>;
    busy?: boolean;
    submitLabel?: string;
  }>(),
  { submitLabel: "Lưu", initial: () => ({}) },
);
defineEmits(["submit"]);
const model = reactive<Record<string, any>>({ ...props.initial });
let initialSnapshot = JSON.stringify(props.initial);
watch(
  () => props.initial,
  (value) => {
    const snapshot=JSON.stringify(value);
    if(snapshot===initialSnapshot)return;
    initialSnapshot=snapshot;
    for(const key of Object.keys(model))delete model[key];
    Object.assign(model,value);
  },
  { deep: true },
);
</script>
