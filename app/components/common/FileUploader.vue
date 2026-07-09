<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>
    <div
      :class="['border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer', dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400']"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="handleDrop"
      @click="openPicker"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="hidden"
        @change="handleChange"
      />
      <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="mt-2 text-sm text-gray-600">
        <span class="text-primary-600 font-medium">{{ $t('common.clickToUpload') }}</span> {{ $t('common.orDragDrop') }}
      </p>
      <p class="mt-1 text-xs text-gray-500">{{ hint || $t('common.fileHint') }}</p>
    </div>

    <!-- File list -->
    <ul v-if="selectedFiles.length" class="mt-3 space-y-2">
      <li v-for="(file, idx) in selectedFiles" :key="idx" class="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
        <div class="flex items-center gap-2 text-sm text-gray-700 truncate">
          <svg class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="truncate">{{ file.name }}</span>
          <span class="text-gray-400">({{ formatSize(file.size) }})</span>
        </div>
        <button @click.stop="removeFile(idx)" class="text-gray-400 hover:text-red-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);
defineProps<{
  label?: string;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}>();

const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
const dragging = ref(false);

const openPicker = () => fileInput.value?.click();

const handleChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) addFiles(Array.from(input.files));
};

const handleDrop = (e: DragEvent) => {
  dragging.value = false;
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files));
};

const addFiles = (files: File[]) => {
  selectedFiles.value.push(...files);
  emit('update:modelValue', selectedFiles.value);
};

const removeFile = (idx: number) => {
  selectedFiles.value.splice(idx, 1);
  emit('update:modelValue', selectedFiles.value);
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};
</script>
