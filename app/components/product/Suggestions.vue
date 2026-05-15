<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const suggestionsUrl = computed(() => `/api/product/${props.slug}/suggestions`);

const { data: productSuggestions, status } = await useFetch<Product[]>(
  suggestionsUrl,
  {
    default: () => [],
    watch: [suggestionsUrl],
     lazy: true,
    server: false,
    cache: 'force-cache',
  },
);
</script>

<template>
  <div>
    <div
      v-if="status === 'pending'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <USkeleton class="w-full h-52 rounded-md mb-4" />
      <USkeleton class="w-full h-52 rounded-md mb-4" />
      <USkeleton class="w-full h-52 rounded-md mb-4" />
    </div>

    <ProductsGrid v-else :products="productSuggestions" />
  </div>
</template>
