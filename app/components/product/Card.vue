<script setup lang="ts">
import security from "@comark/nuxt/plugins/security";

defineProps<{
  product: Product;
}>();

const markdownPlugins = [
  security({
    blockedTags: ["script", "style", "iframe", "object", "embed"],
  }),
];
</script>

<template>
  <UCard class="w-full" :ui="{ body: 'px-20' }">
    <img
      :src="product.images[0]"
      alt="Product Image"
      class="w-full h-52 object-cover rounded-md"
    />

    <div class="mt-4">
      <h3 class="text-lg font-bold">{{ product.name }}</h3>
      <div class="markdown-content markdown-content-compact text-sm text-gray-500">
        <Comark :markdown="product.description" :plugins="markdownPlugins" />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">{{ formatCurrency(product.price) }}</p>
        <UButton
          :to="`/product/${product.slug}`"
          color="primary"
          variant="ghost"
          label="Saber más"
        />
      </div>
    </template>
  </UCard>
</template>
