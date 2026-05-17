import { z } from "zod";
import prisma from "@@/lib/prisma";
import {
  createError,
  defineEventHandler,
  getRouterParam,
  readMultipartFormData,
  setResponseStatus,
} from "h3";
import { fileUpload } from "@@/shared/utils/file-upload"; // ajusta el path según tu proyecto

// ─── Schema de validación ──────────────────────────────────────────────────
// Valida los campos del producto enviados como JSON dentro del multipart form.
// images y tags son opcionales en el update (PATCH semántico).
const bodySchema = z.object({
  slug: z
    .string()
    .min(1, "El slug no puede estar vacío.")
    .max(100, "El slug no puede superar los 100 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones.",
    )
    .optional(),
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío.")
    .max(150, "El nombre no puede superar los 150 caracteres.")
    .optional(),
  description: z
    .preprocess(
      (description) =>
        typeof description === "string"
          ? description.replace(/\r\n?/g, "\n")
          : description,
      z
        .string()
        .trim()
        .min(1, "La descripción no puede estar vacía.")
        .max(5000, "La descripción no puede superar los 5000 caracteres.")
        .refine(
          (description) => !/<\/?[a-z][\s\S]*>/i.test(description),
          "La descripción debe estar en Markdown, no en HTML.",
        ),
    )
    .optional(),
  price: z
    .number({ message: "El precio debe ser un número." })
    .min(0, "El precio no puede ser negativo.")
    .multipleOf(0.01, "El precio no puede tener más de 2 decimales.")
    .optional(),
  images: z
    .array(z.string().url("Cada imagen debe ser una URL válida."))
    .optional(),
  tags: z
    .array(z.string().min(1, "Cada tag debe tener al menos un carácter."))
    .optional(),
});

// ─── Constantes ────────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 5; // Límite de imágenes por request

// ─── Helpers privados ──────────────────────────────────────────────────────

/**
 * Parsea y valida el ID de la ruta.
 * Lanza 400 si el parámetro no es un entero positivo válido.
 */
const parseProductId = (raw: string | undefined): number => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El parámetro 'id' debe ser un entero positivo.",
    });
  }
  return id;
};

/**
 * Extrae el JSON de datos y los archivos de imagen del multipart form.
 *
 * El cliente debe enviar:
 *  - Un part con name="data" y contenido JSON con los campos del producto.
 *  - Uno o más parts con name="images" y el buffer binario de cada imagen.
 */
const parseFormData = (
  formData: NonNullable<Awaited<ReturnType<typeof readMultipartFormData>>>,
): { dataString: string; imageBuffers: Buffer[] } => {
  let dataString = "";
  const imageBuffers: Buffer[] = [];

  for (const part of formData) {
    // Part con los datos del producto en JSON
    if (part.name === "data" && part.data) {
      dataString = part.data.toString("utf-8");
      continue;
    }

    // Parts de imágenes: valida tipo MIME antes de aceptar el buffer
    if (part.name === "images" && part.data && part.type) {
      if (!ALLOWED_MIME_TYPES.has(part.type)) {
        throw createError({
          statusCode: 415,
          statusMessage: "Unsupported Media Type",
          message: `Tipo de archivo no permitido: "${part.type}". Solo se aceptan jpeg, png y webp.`,
        });
      }
      imageBuffers.push(part.data);
    }
  }

  if (!dataString) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El part 'data' es requerido en el formulario.",
    });
  }

  if (imageBuffers.length > MAX_FILES) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `Se pueden subir como máximo ${MAX_FILES} imágenes por request.`,
    });
  }

  return { dataString, imageBuffers };
};

/**
 * Sube todos los buffers de imagen a Cloudinary en paralelo.
 * Retorna el array de URLs optimizadas resultantes.
 */
const uploadImages = async (imageBuffers: Buffer[]): Promise<string[]> => {
  if (imageBuffers.length === 0) return [];

  // Promise.all sube todas las imágenes en paralelo para minimizar latencia
  return Promise.all(imageBuffers.map((buffer) => fileUpload(buffer)));
};

// ─── Handler principal ─────────────────────────────────────────────────────
/**
 * PUT /api/products/:id
 *
 * Actualiza un producto existente, incluyendo subida de imágenes a Cloudinary.
 *
 * Flujo:
 *  1. Parsea y valida el ID de la ruta.
 *  2. Lee y parsea el multipart form (part "data" + parts "images").
 *  3. Valida el JSON del producto con Zod.
 *  4. Verifica que el producto exista en la base de datos.
 *  5. Sube las nuevas imágenes a Cloudinary en paralelo.
 *  6. Actualiza el producto combinando los datos + URLs de imágenes nuevas.
 *  7. Retorna 200 con el producto actualizado.
 */
export default defineEventHandler(async (event) => {
  // 1. Validar el ID de la ruta
  const id = parseProductId(getRouterParam(event, "id"));

  // 2. Leer y parsear el multipart form
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El body del request está vacío.",
    });
  }

  const { dataString, imageBuffers } = parseFormData(formData);

  // 3. Validar el JSON del producto
  //    Se parsea primero el string para detectar JSON malformado explícitamente
  let rawData: unknown;
  try {
    rawData = JSON.parse(dataString);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El part 'data' no contiene un JSON válido.",
    });
  }

  const body = bodySchema.safeParse(rawData);

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Los datos del producto no son válidos.",
      data: body.error.flatten(), // flatten() es más legible que el ZodError crudo
    });
  }

  // 4. Verificar que el producto exista
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, images: true }, // Traemos images para poder hacer merge
  });

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No se encontró un producto con id ${id}.`,
    });
  }

  // 5. Subir imágenes nuevas a Cloudinary en paralelo
  const newImageUrls = await uploadImages(imageBuffers);

  // 6. Actualizar el producto
  //    Las imágenes nuevas se agregan a las existentes (merge, no reemplazo total).
  //    Si el body trae un array "images", se usa como base para respetar borrados/reordenamientos.
  const baseImages = body.data.images ?? existing.images;
  const mergedImages = [...new Set([...baseImages, ...newImageUrls])];

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      ...body.data,
      images: mergedImages,
    },
  });

  // 7. Responder con el producto actualizado
  setResponseStatus(event, 200);

  return {
    message: "Producto actualizado exitosamente.",
    product: updatedProduct,
  };
});
