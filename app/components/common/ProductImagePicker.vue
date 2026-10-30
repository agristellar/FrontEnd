<template>
  <fieldset :disabled="disabled" class="min-w-0">
    <legend class="font-medium text-sm mb-2">
      {{ en ? "White background image library" : "Thư viện ảnh nền trắng" }}
    </legend>
    <p class="text-xs text-slate-500 mb-3">
      {{
        en
          ? "Choose an illustrative product photo. Images are generated with AI."
          : "Chọn ảnh minh họa phù hợp với sản phẩm. Ảnh được tạo bằng AI."
      }}
    </p>
    <input
      v-model="query"
      type="search"
      :aria-label="en ? 'Search product images' : 'Tìm ảnh sản phẩm'"
      :placeholder="en ? 'Search product images…' : 'Tìm cà phê, gạo, xoài…'"
      class="w-full rounded-lg border-slate-300 text-sm mb-3"
    />
    <div
      class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto p-1"
    >
      <label
        v-for="photo in filtered"
        :key="photo.key"
        class="relative cursor-pointer border-2 rounded-xl p-2 bg-white"
        :class="
          modelValue === photo.key
            ? 'border-emerald-600 ring-2 ring-emerald-100'
            : 'border-slate-100 hover:border-emerald-300'
        "
      >
        <input
          type="radio"
          :name="groupId"
          :value="photo.key"
          :checked="modelValue === photo.key"
          class="absolute top-2 left-2 text-emerald-600"
          @change="$emit('update:modelValue', photo.key)"
        />
        <img
          :src="photo.url"
          :alt="en ? photo.nameEn : photo.name"
          loading="lazy"
          width="160"
          height="160"
          class="aspect-square object-contain w-full"
        />
        <span class="block text-xs text-center mt-1">{{
          en ? photo.nameEn : photo.name
        }}</span>
      </label>
    </div>
    <p
      v-if="status === 'pending'"
      role="status"
      class="text-sm text-slate-500 py-4"
    >
      {{ en ? "Loading images…" : "Đang tải thư viện ảnh…" }}
    </p>
    <p v-else-if="error" role="status" class="text-sm text-amber-800 py-4">
      {{
        en ? "Unable to load the image library." : "Chưa tải được thư viện ảnh."
      }}
      <button type="button" class="underline" @click="refresh()">
        {{ en ? "Retry" : "Thử lại" }}
      </button>
    </p>
    <p
      v-else-if="!filtered.length"
      role="status"
      class="text-sm text-slate-500 py-4"
    >
      {{ en ? "No matching images." : "Không tìm thấy ảnh phù hợp." }}
    </p>
    <p v-if="selected" class="text-xs text-emerald-700 mt-3">
      {{ en ? "Selected:" : "Đã chọn:" }}
      {{ en ? selected.nameEn : selected.name }}
    </p>
    <button
      type="button"
      class="text-xs underline text-slate-500 mt-2"
      @click="$emit('update:modelValue', '')"
    >
      {{ en ? "Use no image" : "Không dùng ảnh" }}
    </button>
  </fieldset>
</template>
<script setup lang="ts">
import { productImages, normalizeProduct } from "~/lib/product-images";
const props = defineProps<{ modelValue?: string; disabled?: boolean }>();
defineEmits(["update:modelValue"]);
const { locale } = useI18n(),
  groupId = useId(),
  query = ref("");
const { request } = usePlatform();
const {
  data: library,
  status,
  error,
  refresh,
} = useAsyncData(
  "public-product-image-library",
  () => request<{ key: string }[]>("/platform/product-images/public"),
  { server: false, default: () => [] },
);
const en = computed(() => locale.value === "en");
const selected = computed(() =>
  productImages.find((image) => image.key === props.modelValue),
);
const filtered = computed(() =>
  productImages.filter(
    (image) =>
      library.value.some((record) => record.key === image.key) &&
      normalizeProduct(
        [image.name, image.nameEn, image.category, ...image.tags].join(" "),
      ).includes(normalizeProduct(query.value)),
  ),
);
</script>
