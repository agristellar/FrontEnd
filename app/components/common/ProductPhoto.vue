<template>
  <div
    class="bg-white flex items-center justify-center overflow-hidden"
    :class="photoClass"
  >
    <img
      v-if="photo && !failed"
      :src="photo.url"
      :alt="name || (locale === 'en' ? photo.nameEn : photo.name)"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      width="640"
      height="640"
      class="w-full h-full object-contain"
      @error="failed = true"
    />
    <div
      v-else
      class="flex flex-col items-center justify-center gap-2 text-slate-400 p-4"
    >
      <TablerIcon name="IconPhoto" :size="32" /><span class="text-xs">{{
        locale === "en" ? "Product image" : "Ảnh sản phẩm"
      }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { findProductImage } from "~/lib/product-images";
const props = withDefaults(
  defineProps<{
    imageId?: string;
    name?: string;
    photoClass?: string;
    eager?: boolean;
  }>(),
  { name: "", photoClass: "aspect-[4/3] rounded-lg", eager: false },
);
const { locale } = useI18n();
const failed = ref(false);
const photo = computed(() => findProductImage(props.imageId, props.name));
watch(
  () => photo.value?.url,
  () => (failed.value = false),
);
</script>
