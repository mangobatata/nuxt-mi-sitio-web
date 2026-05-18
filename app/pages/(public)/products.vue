<script setup lang="ts">
// throw new Error('Auxilio, esto no se puede hacer.');
// throw createError({
//   statusCode: 500,
//   statusMessage: 'No se puede dividir entre 0',
//   data: {
//     myCustomField: true,
//     myOtherField: 'Hola mundo',
//   },
// });
const publicStatus = ref("active");
const { products, total, currentPage, perPage, error, pending } =
  await usePaginatedProducts({
    status: publicStatus,
  });
</script>

<template>
  <UPageCTA
    orientation="horizontal"
    title="Productos"
    description="Descubre nuestros productos y servicios."
  >
    <template #default>
      <div class="flex items-center justify-center">
        <UIcon name="i-lucide-box" :size="150" />
      </div>
    </template>
  </UPageCTA>

  <div class="mt-10" />

  <UAlert
    v-if="error"
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    title="No se pudieron cargar los productos"
    description="Revisá la conexión a la base de datos y volvé a intentar."
  />

  <div
    v-else-if="pending"
    class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <USkeleton v-for="item in 8" :key="item" class="h-80 w-full rounded-lg" />
  </div>

  <UAlert
    v-else-if="products.length === 0"
    color="neutral"
    variant="soft"
    icon="i-lucide-package-open"
    title="No hay productos activos"
    description="Publicá productos desde el dashboard o volvé a correr el seed actualizado."
  />

  <ProductsGrid v-else :products="products" />

  <SharedPagination
    v-if="total > 0"
    :total="total"
    :model-value="currentPage"
    :per-page="perPage"
  />
</template>

<style scoped></style>
