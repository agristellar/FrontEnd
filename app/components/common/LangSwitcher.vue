<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click.stop="open = !open"
      class="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      :class="buttonClass"
    >
      <span class="text-base leading-none">{{ currentFlag }}</span>
      <span class="hidden sm:inline">{{ currentLabel }}</span>
      <svg class="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
    </button>
    <Transition name="dropdown">
      <div v-if="open" class="absolute right-0 mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
        <button
          v-for="lang in langs"
          :key="lang.code"
          @click="switchLang(lang.code)"
          :class="['w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors', locale === lang.code ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50']"
        >
          <span class="text-base leading-none">{{ lang.flag }}</span>
          {{ lang.name }}
          <svg v-if="locale === lang.code" class="w-4 h-4 ml-auto text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  buttonClass?: string;
}>();

const { locale, setLocale } = useI18n();
const open = ref(false);
const dropdownRef = ref<HTMLElement>();

const langs = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const currentFlag = computed(() => langs.find((l) => l.code === locale.value)?.flag || '🌐');
const currentLabel = computed(() => langs.find((l) => l.code === locale.value)?.name || '');

const switchLang = (code: string) => {
  setLocale(code);
  open.value = false;
};

const onClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false;
  }
};

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from { opacity: 0; transform: translateY(-4px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
