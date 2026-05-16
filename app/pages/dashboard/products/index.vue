<script setup lang="ts">
// Importamos `h` y `resolveComponent` desde Vue.
//
// h:
// Sirve para crear elementos o componentes de forma programática.
// En este caso lo usamos dentro de las columnas de la tabla.
//
// resolveComponent:
// Sirve para obtener un componente registrado globalmente.
// Acá lo usamos para poder usar UBadge dentro de una función `cell`.
import { h, resolveComponent } from "vue";

// Importamos el tipo TableColumn desde Nuxt UI.
// Esto ayuda a TypeScript a saber cómo debe ser la estructura de las columnas.
import type { TableColumn } from "#ui/components/Table.vue";

// Importamos una función utilitaria para formatear fechas.
// Por ejemplo: convertir una fecha ISO en formato día/mes/año.
import { dayMonthYearFormat } from "@@/shared/utils/date-formats";

// Obtenemos el componente UBadge para poder renderizarlo dentro de la tabla.
// Como estamos dentro de una función `cell`, no podemos usar <UBadge> directamente,
// entonces lo resolvemos con resolveComponent.
const UBadge = resolveComponent("UBadge");

const NuxtLink = resolveComponent("NuxtLink");

// Usamos nuestro composable personalizado para traer productos paginados.
//
// products:
// Lista de productos que viene desde la API.
//
// currentPage:
// Página actual.
//
// perPage:
// Cantidad de productos por página.
//
// total:
// Total de productos disponibles.
const { products, currentPage, perPage, total } = await usePaginatedProducts();

// Definimos las columnas que tendrá la tabla.
// `TableColumn<Product>[]` significa que estas columnas pertenecen
// a una tabla donde cada fila representa un producto.
const columns: TableColumn<Product>[] = [
  {
    // accessorKey indica qué propiedad del producto se va a mostrar.
    // En este caso, usamos el campo `id`.
    accessorKey: "id",

    // Texto que aparece en el encabezado de la columna.
    header: "#",

    // Función que define cómo se muestra el valor dentro de cada celda.
    // row.getValue("id") obtiene el id del producto actual.
    cell: ({ row }) => `#${row.getValue("id")}`,
  },

  // Columna de imagen del producto
  {
    // Esta columna usa el campo `images`, que normalmente es un array de URLs.
    accessorKey: "images",

    // Título de la columna.
    header: "Imagen",

    // Render personalizado para la celda.
    cell: ({ row }) => {
      // Obtenemos el valor de images desde la fila actual.
      // Lo convertimos a string[] porque esperamos un array de imágenes.
      const images = row.getValue("images") as string[];

      // Si images es un array y tiene al menos una imagen,
      // usamos la primera imagen como imagen principal.
      const url = Array.isArray(images) && images.length > 0 ? images[0] : "";

      // Si no hay imagen, mostramos un texto simple.
      if (!url)
        return h(
          "span",
          {
            class: "text-gray-500",
          },
          "Sin imagen",
        );

      // Si hay imagen, renderizamos una etiqueta <img>.
      // Usamos `h` porque estamos generando el contenido desde JavaScript.
      return h("img", {
        src: url,
        alt: "Imagen del producto",
        style:
          "width: 48px; height: 48px; object-fit: cover; border-radius: 0.5rem",
      });
    },
  },

  {
    // Columna para mostrar el nombre del producto.
    accessorKey: "name",
    header: "Nombre",

    // Obtenemos el valor del campo `name` y lo mostramos.
    cell: ({ row }) => {
      const productName = row.getValue("name");
      const productId = row.getValue("id");

      return h(
        NuxtLink,
        {
          to: `/dashboard/product/${productId}`,

          class:
            "inline-flex items-center rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur transition hover:bg-indigo-100",
        },
        () => productName,
      );
    },
  },

  {
    // Columna para mostrar la descripción del producto.
    accessorKey: "description",
    header: "Descripción",

    cell: ({ row }) => {
      // Creamos un div para mostrar la descripción.
      // Se limita visualmente para que no ocupe demasiado espacio en la tabla.
      return h(
        "div",
        {
          style:
            "white-space: normal; word-break: break-word; max-width: 300px;",
          class: "truncate-text",
        },

        // Convertimos la descripción a string,
        // cortamos los primeros 50 caracteres
        // y agregamos "..." al final.
        String(row.getValue("description")).slice(0, 50) + "...",
      );
    },
  },

  {
    // Columna para mostrar el precio.
    accessorKey: "price",
    header: "Precio",

    // Obtenemos el precio y lo formateamos con formatCurrency.
    // Ejemplo: 100 => $100.00 o Gs. 100, según tu configuración.
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },

  {
    // Columna para mostrar las etiquetas del producto.
    accessorKey: "tags",
    header: "Etiquetas",

    cell: ({ row }) => {
      // Obtenemos el array de tags desde la fila actual.
      const tags = row.getValue("tags") as string[];

      // Si tags no es un array, no mostramos nada.
      if (!Array.isArray(tags)) return "";

      // Creamos un contenedor div para mostrar varios badges.
      return h(
        "div",
        { class: "flex flex-wrap gap-1" },

        // Recorremos cada tag y creamos un UBadge para cada uno.
        tags.map((tag) =>
          h(
            UBadge,
            {
              size: "xs",
              color: "primary",
              variant: "subtle",
              class: "mr-0.5",
            },

            // Contenido del badge.
            () => tag,
          ),
        ),
      );
    },
  },

  {
    // Columna para mostrar la fecha de creación del producto.
    accessorKey: "createdAt",
    header: "Creado",

    cell: ({ row }) => {
      // Obtenemos el valor de createdAt.
      const value = row.getValue("createdAt");

      // Si existe una fecha, la convertimos a Date
      // y luego la formateamos con dayMonthYearFormat.
      //
      // Si no existe, mostramos un string vacío.
      return value ? dayMonthYearFormat(new Date(value as string)) : "";
    },
  },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Action Button -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Productos
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona y organiza tu catálogo de productos
        </p>
      </div>
      <UButton
        to="/dashboard/product/new"
        icon="i-lucide-plus"
        label="Agregar Producto"
        color="primary"
        size="lg"
      />
    </div>

    <UTable :data="products" :columns="columns" class="flex-1" />

    <SharedPagination
      :total="total"
      :model-value="currentPage"
      :per-page="perPage"
    />
  </div>
</template>
