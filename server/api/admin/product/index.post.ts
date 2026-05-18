import { z } from "zod";
import prisma from "@@/lib/prisma";
import {
  createError,
  defineEventHandler,
  getHeader,
  type H3Event,
  readMultipartFormData,
  readValidatedBody,
  setResponseStatus,
} from "h3";
import { fileUpload } from "@@/shared/utils/file-upload";

// ─── Schema de validación ──────────────────────────────────────────────────
// Define y valida la forma exacta del body esperado en el request.
// Zod lanzará un error descriptivo si algún campo no cumple las reglas.
const bodySchema = z.object({
  slug: z
    .string()
    .min(1, "El slug no puede estar vacío.")
    .max(100, "El slug no puede superar los 100 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones.",
    ),
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  description: z.preprocess(
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
  ),
  price: z
    .number({ message: "El precio debe ser un número." })
    .min(0, "El precio no puede ser negativo.")
    .multipleOf(0.01, "El precio no puede tener más de 2 decimales."),
  images: z
    .array(z.string().url("Cada imagen debe ser una URL válida."))
    .optional(),
  tags: z
    .array(z.string().min(1, "Cada tag debe tener al menos un carácter."))
    .optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

// ─── Tipo inferido del schema ──────────────────────────────────────────────
// Se deriva directamente del schema para evitar duplicar la definición del tipo.
type CreateProductBody = z.infer<typeof bodySchema>;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 5;

interface ParsedMultipartProductBody {
  body: CreateProductBody;
  imageBuffers: Buffer[];
}

const parseMultipartProductBody = async (
  event: H3Event,
): Promise<ParsedMultipartProductBody> => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El body del request está vacío.",
    });
  }

  let dataString = "";
  const imageBuffers: Buffer[] = [];

  for (const part of formData) {
    if (part.name === "data" && part.data) {
      dataString = part.data.toString("utf-8");
      continue;
    }

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

  const parsedBody = bodySchema.safeParse(rawData);

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Los datos del producto no son válidos.",
      data: parsedBody.error.flatten(),
    });
  }

  return { body: parsedBody.data, imageBuffers };
};

// ─── Handler principal ─────────────────────────────────────────────────────
/**
 * POST /api/products
 *
 * Crea un nuevo producto en la base de datos.
 *
 * Flujo:
 *  1. Valida y parsea el body con Zod (lanza 400 automáticamente si falla).
 *  2. Verifica que el slug no esté ya en uso (conflicto 409).
 *  3. Persiste el producto en la base de datos.
 *  4. Retorna 201 con el producto creado.
 */
export default defineEventHandler(async (event) => {
  // 1. Validación del body
  //    readValidatedBody usa bodySchema.safeParse internamente y lanza
  //    un H3Error con status 400 si la validación falla.
  const contentType = getHeader(event, "content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");
  const multipartBody = isMultipart
    ? await parseMultipartProductBody(event)
    : null;
  const body: CreateProductBody =
    multipartBody?.body ?? (await readValidatedBody(event, bodySchema.parse));

  // 2. Verificar unicidad del slug antes de intentar insertar.
  //    Así el error que llega al cliente es claro (409) en lugar de
  //    un error críptico de constraint violation de la base de datos.
  const existingProduct = await prisma.product.findUnique({
    where: { slug: body.slug },
    select: { id: true }, // Solo necesitamos saber si existe, no todos los campos
  });

  if (existingProduct) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: `Ya existe un producto con el slug "${body.slug}".`,
    });
  }

  const uploadedImages = multipartBody
    ? await Promise.all(
        multipartBody.imageBuffers.map((buffer) => fileUpload(buffer)),
      )
    : [];
  const productData = {
    ...body,
    images: [...new Set([...(body.images ?? []), ...uploadedImages])],
  };

  // 3. Crear el producto en la base de datos
  const product = await prisma.product.create({
    data: productData,
  });

  // 4. Responder con 201 Created y el producto creado
  setResponseStatus(event, 201);

  return {
    message: "Producto creado exitosamente.",
    product,
  };
});
