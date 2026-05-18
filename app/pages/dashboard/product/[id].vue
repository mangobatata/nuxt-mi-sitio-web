<script setup lang="ts">
import security from "@comark/nuxt/plugins/security";
import { z } from "zod";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const filesToUpload = ref<File[]>([]);
const filesToUploadPreviews = ref<string[]>([]);
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFilesToUpload = 5;
const isDraggingImages = ref(false);
const isPreviewVisible = ref(false);
const slugWasEdited = ref(false);
const markdownPlugins = [
  security({
    blockedTags: ["script", "style", "iframe", "object", "embed"],
  }),
];
const productStatusOptions = [
  { label: "Borrador", value: "draft" },
  { label: "Activo", value: "active" },
  { label: "Archivado", value: "archived" },
];

const messageQuery = route.query.message as string;
if (messageQuery) {
  toast.add({
    title: "Producto creado",
    description: messageQuery,
  });
  router.replace({ query: {} });
}

// Variables
const rawId = route.params.id as string;
const {
  data: product,
  error,
  pending,
  createOrUpdate,
} = await useAdminProduct(rawId);

if (error.value) {
  await navigateTo("/404");
}

// const newProduct = ref<Product | null>({ ...product.value } as Product);
const newProduct = ref<Product | null>(
  structuredClone(product.value) as Product,
);
const selectedImageIndex = ref(0);
const isSubmitting = ref(false);
const fieldErrors = ref<Record<string, string>>({});
const isCreating = computed(() => rawId === "new");

const pageTitle = computed(() =>
  isCreating.value ? "Crear producto" : "Editar producto",
);
const subtitle = computed(() =>
  isCreating.value
    ? "Completa el formulario para agregar un nuevo producto"
    : "Actualiza la in formación del producto seleccionado",
);

const productSchema = z.object({
  slug: z.string().nonempty("El Slug es requerido"),
  name: z.string().nonempty("El nombre es requerido"),
  description: z
    .string()
    .nonempty("La descripción es requerida")
    .refine(
      (description) => !/<\/?[a-z][\s\S]*>/i.test(description),
      "La descripción debe escribirse en Markdown, no en HTML",
    ),
  price: z.number().min(0, "El precio es requerido"),
  status: z.enum(["draft", "active", "archived"]),
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const handleSlugInput = () => {
  slugWasEdited.value = true;
};

const previewTags = computed(() => {
  if (!newProduct.value) return [];
  if (Array.isArray(newProduct.value.tags)) return newProduct.value.tags;

  return `${newProduct.value.tags}`
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
});

const selectedImage = computed(() => {
  if (!newProduct.value) return "";
  return (
    newProduct.value.images[selectedImageIndex.value] ??
    filesToUploadPreviews.value[0] ??
    ""
  );
});

const checkValidations = () => {
  fieldErrors.value = {};

  const result = productSchema.safeParse(newProduct.value);

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];

      if (typeof field === "string") {
        fieldErrors.value[field] = issue.message;
      }
    });

    return false;
  }

  // Si quieres, aquí puedes sobreescribir newProduct con los valores parseados
  // newProduct.value = result.data;

  return true;
};

const handleSubmit = async () => {
  const isFormValid = checkValidations();
  if (!isFormValid) return;
  if (!newProduct.value) return;

  isSubmitting.value = true;

  try {
    newProduct.value.description = newProduct.value.description
      .replace(/\r\n?/g, "\n")
      .trim();
    newProduct.value.tags = `${newProduct.value.tags}`
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const product = await createOrUpdate(newProduct.value, filesToUpload.value);

    if (isCreating.value) {
      router.replace(
        `/dashboard/product/${product.id}?message=Producto creado correctamente`,
      );
      return;
    }

    newProduct.value = structuredClone(product) as Product;
    clearSelectedFiles();

    toast.add({
      title: "Producto actualizado correctamente",
      description: `El producto ${product.name}, ha sido actualizado correctamente`,
    });
  } catch (error) {
    toast.add({
      title: "No se pudo guardar el producto",
      description:
        error instanceof Error
          ? error.message
          : "Revisa los datos e intenta nuevamente.",
      color: "error",
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  navigateTo("/dashboard/products");
};

const clearSelectedFiles = () => {
  filesToUploadPreviews.value.forEach((preview) => URL.revokeObjectURL(preview));
  filesToUpload.value = [];
  filesToUploadPreviews.value = [];
};

const removeFilePreview = (index: number) => {
  const [preview] = filesToUploadPreviews.value.splice(index, 1);
  if (preview) URL.revokeObjectURL(preview);
  filesToUpload.value.splice(index, 1);
};

const removeExistingImage = (index: number) => {
  if (!newProduct.value) return;
  newProduct.value.images.splice(index, 1);
  selectedImageIndex.value = Math.max(
    0,
    Math.min(selectedImageIndex.value, newProduct.value.images.length - 1),
  );
};

const moveExistingImage = (index: number, direction: -1 | 1) => {
  if (!newProduct.value) return;

  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= newProduct.value.images.length) return;

  const [image] = newProduct.value.images.splice(index, 1);
  if (!image) return;

  newProduct.value.images.splice(nextIndex, 0, image);
  selectedImageIndex.value = nextIndex;
};

const addFilesToUpload = (selectedFiles: File[]) => {
  fieldErrors.value.imagesInput = "";

  if (selectedFiles.length === 0) return;

  const validFiles = selectedFiles.filter((file) =>
    allowedImageTypes.has(file.type),
  );

  if (validFiles.length !== selectedFiles.length) {
    fieldErrors.value.imagesInput =
      "Solo se aceptan imágenes JPG, PNG o WebP.";
  }

  const availableSlots = maxFilesToUpload - filesToUpload.value.length;

  if (availableSlots <= 0) {
    fieldErrors.value.imagesInput = `Se pueden subir como máximo ${maxFilesToUpload} imágenes por vez.`;
    return;
  }

  const filesToAdd = validFiles.slice(0, availableSlots);

  if (filesToAdd.length < validFiles.length) {
    fieldErrors.value.imagesInput = `Se pueden subir como máximo ${maxFilesToUpload} imágenes por vez.`;
  }

  filesToUpload.value.push(...filesToAdd);
  filesToUploadPreviews.value.push(
    ...filesToAdd.map((file) => URL.createObjectURL(file)),
  );
};

const handleFilesChanged = (event: Event) => {
  const input = event.target as HTMLInputElement;
  addFilesToUpload(Array.from(input.files ?? []));
  input.value = "";
};

const handleImagesDrop = (event: DragEvent) => {
  isDraggingImages.value = false;
  addFilesToUpload(Array.from(event.dataTransfer?.files ?? []));
};

onBeforeUnmount(() => {
  clearSelectedFiles();
});

watch(
  newProduct,
  () => {
    checkValidations();
  },
  {
    deep: true,
  },
);

watch(
  () => newProduct.value?.name,
  (name) => {
    if (!newProduct.value || slugWasEdited.value || !isCreating.value) return;
    newProduct.value.slug = slugify(name ?? "");
  },
);
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8">
    <section class="space-y-1">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ pageTitle }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ subtitle }}
      </p>
    </section>

    <div
      v-if="pending"
      class="rounded-lg border border-gray-200 bg-white p-6 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
    >
      Cargando producto...
    </div>

    <div
      v-else-if="!isCreating && !newProduct"
      class="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      No encontramos el producto solicitado.
    </div>

    <div v-if="newProduct" class="space-y-6">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-200"
              for="product-slug"
            >
              Slug
            </label>
            <input
              id="product-slug"
              v-model="newProduct.slug"
              type="text"
              :class="[
                'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                fieldErrors.slug
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
              ]"
              placeholder="ejemplo-producto"
              autocomplete="off"
              @input="handleSlugInput"
            />
            <p v-if="fieldErrors.slug" class="text-sm text-red-600">
              {{ fieldErrors.slug }}
            </p>
          </div>

          <div class="space-y-2">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-200"
              for="product-name"
            >
              Nombre
            </label>
            <input
              id="product-name"
              v-model="newProduct.name"
              type="text"
              :class="[
                'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                fieldErrors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
              ]"
              placeholder="Nombre del producto"
              autocomplete="off"
            />
            <p v-if="fieldErrors.name" class="text-sm text-red-600">
              {{ fieldErrors.name }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label
            class="text-sm font-medium text-gray-700 dark:text-gray-200"
            for="product-description"
          >
            Descripción
          </label>
          <AdminProductMarkdownEditor
            id="product-description"
            v-model="newProduct.description"
            :invalid="Boolean(fieldErrors.description)"
            placeholder="Describe el producto con claridad..."
          />
          <!-- <UInput
              type="file"
              multiple
              id="product-images"
              rows="4"
              :class="[
                'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                fieldErrors.imagesInput
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
              ]"
            /> -->
          <p v-if="fieldErrors.description" class="text-sm text-red-600">
            {{ fieldErrors.description }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <div class="space-y-2">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
                for="product-status"
              >
                Estado
              </label>
              <select
                id="product-status"
                v-model="newProduct.status"
                class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option
                  v-for="status in productStatusOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
                for="product-price"
              >
                Precio (entero)
              </label>
              <input
                id="product-price"
                v-model.number="newProduct.price"
                type="number"
                min="0"
                step="1"
                :class="[
                  'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                  fieldErrors.price
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
                ]"
                placeholder="0"
              />
              <p v-if="fieldErrors.price" class="text-sm text-red-600">
                {{ fieldErrors.price }}
              </p>
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
                for="product-tags"
              >
                Etiquetas
              </label>
              <input
                id="product-tags"
                v-model="newProduct.tags"
                type="text"
                :class="[
                  'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                  fieldErrors.tagsInput
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
                ]"
                placeholder="etiqueta uno, etiqueta dos"
                autocomplete="off"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ingresa etiquetas separadas por comas.
              </p>
              <p v-if="fieldErrors.tagsInput" class="text-sm text-red-600">
                {{ fieldErrors.tagsInput }}
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-200"
              for="product-images"
            >
              Imágenes
            </label>
            <div v-if="newProduct.images.length > 0" class="space-y-3">
              <div
                class="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <img
                  :src="selectedImage"
                  alt="Previsualización principal del producto"
                  class="h-64 w-full object-cover"
                />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  v-for="(image, index) in newProduct.images"
                  :key="image + index"
                  class="group relative overflow-hidden rounded-md border-2 transition"
                  :class="
                    selectedImageIndex === index
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  "
                >
                  <button type="button" class="block w-full" @click="selectedImageIndex = index">
                    <img
                      :src="image"
                      :alt="`Previsualización ${index + 1}`"
                      class="h-20 w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                  <div class="absolute inset-x-1 bottom-1 flex justify-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <UButton
                      type="button"
                      icon="i-lucide-arrow-left"
                      color="neutral"
                      variant="solid"
                      size="xs"
                      square
                      :disabled="index === 0"
                      @click="moveExistingImage(index, -1)"
                    />
                    <UButton
                      type="button"
                      icon="i-lucide-arrow-right"
                      color="neutral"
                      variant="solid"
                      size="xs"
                      square
                      :disabled="index === newProduct.images.length - 1"
                      @click="moveExistingImage(index, 1)"
                    />
                    <UButton
                      type="button"
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="solid"
                      size="xs"
                      square
                      @click="removeExistingImage(index)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- <textarea
              id="product-images"
              v-model="newProduct.images"
              rows="4"
              :class="[
                'block w-full rounded-md bg-white px-3 py-2 shadow-sm focus:outline-none dark:bg-gray-900 dark:text-gray-100',
                fieldErrors.imagesInput
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700',
              ]"
              placeholder="https://ejemplo.com/imagen-1.jpg"
            /> -->
            <!-- Files to upload preview -->
            <ClientOnly>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  v-for="(image, index) in filesToUploadPreviews"
                  :key="image"
                >
                  <div class="overflow-hidden rounded-lg relative">
                    <img
                      :src="image"
                      :alt="`Previsualización ${index + 1}`"
                      class="h-20 w-full object-cover"
                    />
                    <UButton
                      type="button"
                      color="error"
                      icon="i-lucide-x"
                      class="absolute top-2 right-2"
                      @click="removeFilePreview(index)"
                    />
                  </div>
                </div>
              </div>
            </ClientOnly>
            <label
              v-if="!isSubmitting"
              for="product-images"
              class="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white px-4 py-8 text-center transition dark:bg-gray-900"
              :class="[
                fieldErrors.imagesInput
                  ? 'border-red-500 text-red-600 dark:border-red-500 dark:text-red-400'
                  : isDraggingImages
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-800',
              ]"
              @dragenter.prevent="isDraggingImages = true"
              @dragover.prevent="isDraggingImages = true"
              @dragleave.prevent="isDraggingImages = false"
              @drop.prevent="handleImagesDrop"
            >
              <UIcon
                name="i-lucide-image-up"
                class="mb-3 size-8"
                aria-hidden="true"
              />
              <span class="text-sm font-medium">
                Arrastra imágenes aquí o haz clic para seleccionarlas
              </span>
              <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG o WebP. Máximo 5 por guardado.
              </span>
              <input
                id="product-images"
                class="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                @change="handleFilesChanged"
              />
            </label>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Las imágenes nuevas se agregarán al guardar el producto.
            </p>
            <p v-if="fieldErrors.imagesInput" class="text-sm text-red-600">
              {{ fieldErrors.imagesInput }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-lucide-eye"
            @click="isPreviewVisible = !isPreviewVisible"
          >
            {{ isPreviewVisible ? "Ocultar preview" : "Preview del producto" }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            :disabled="isSubmitting"
            icon="i-lucide-save"
          >
            {{ isSubmitting ? "Guardando..." : "Guardar producto" }}
          </UButton>
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            @click="handleCancel"
          >
            Cancelar
          </UButton>
        </div>
      </form>

      <section
        v-if="isPreviewVisible"
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div class="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <img
              v-if="selectedImage"
              :src="selectedImage"
              :alt="newProduct.name"
              class="h-72 w-full object-cover"
            />
            <div
              v-else
              class="flex h-72 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
            >
              Sin imagen
            </div>
          </div>
          <div class="space-y-4">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ newProduct.name || "Nombre del producto" }}
                </h2>
                <UBadge
                  :color="newProduct.status === 'active' ? 'success' : newProduct.status === 'archived' ? 'neutral' : 'warning'"
                  variant="subtle"
                >
                  {{
                    productStatusOptions.find(
                      (status) => status.value === newProduct.status,
                    )?.label
                  }}
                </UBadge>
              </div>
              <p class="text-xl font-semibold text-primary-600">
                {{ formatCurrency(newProduct.price || 0) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in previewTags"
                :key="tag"
                color="primary"
                variant="subtle"
              >
                {{ tag }}
              </UBadge>
            </div>

            <div class="markdown-content leading-relaxed">
              <Comark
                v-if="newProduct.description.trim()"
                :markdown="newProduct.description"
                :plugins="markdownPlugins"
              />
              <p v-else class="text-sm text-gray-500 dark:text-gray-400">
                Sin descripción.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="!isCreating && product"
        class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Metadatos
        </h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Creado
            </dt>
            <dd class="text-gray-900 dark:text-gray-100">
              {{ longDateTimeFormat(new Date(product?.createdAt)) }}
            </dd>
          </div>
          <div class="space-y-1">
            <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Actualizado
            </dt>
            <dd class="text-gray-900 dark:text-gray-100">
              {{ longDateTimeFormat(new Date(product?.updatedAt)) }}
            </dd>
          </div>
        </dl>
      </section>

    </div>
  </div>
</template>
