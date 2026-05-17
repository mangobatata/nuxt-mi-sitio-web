import type { Product } from "@@/shared/types/product";
import prisma from "@@/lib/prisma";
import { createError, defineEventHandler, getRouterParam } from "h3";

// ─── Constantes ────────────────────────────────────────────────────────────
// Producto vacío que se retorna cuando se solicita el formulario de creación.
// Centralizado aquí para que sea fácil de mantener si el modelo cambia.
const EMPTY_PRODUCT: Product = {
  id: 0,
  slug: "",
  name: "",
  description: "",
  price: 0,
  images: [],
  tags: [],
  status: "draft",
};

// ─── Helper privado ────────────────────────────────────────────────────────
/**
 * Parsea y valida el parámetro de ruta `id`.
 * Retorna `null` si el id es "new" (señal de creación),
 * o un entero positivo si corresponde a un producto existente.
 * Lanza 400 si el valor no es válido.
 */
const parseId = (raw: string | undefined): number | null => {
  if (raw === "new") return null;

  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `El parámetro 'id' debe ser un entero positivo o "new". Recibido: "${raw}".`,
    });
  }

  return id;
};

// ─── Handler principal ─────────────────────────────────────────────────────
/**
 * GET /api/products/:id
 *
 * Retorna un producto por su ID, o un producto vacío si el id es "new".
 * El caso "new" es usado por el formulario de creación en el frontend.
 *
 * Flujo:
 *  1. Parsea y valida el parámetro de ruta `id`.
 *  2. Si es "new", retorna un producto vacío sin consultar la base de datos.
 *  3. Si es un ID numérico, busca el producto y lanza 404 si no existe.
 */
export default defineEventHandler(async (event): Promise<Product> => {
  // 1. Parsear el ID
  const id = parseId(getRouterParam(event, "id"));

  // 2. Caso "new": retornar producto vacío para el formulario de creación
  if (id === null) return EMPTY_PRODUCT;

  // 3. Buscar el producto en la base de datos
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No se encontró un producto con id ${id}.`,
    });
  }

  return product;
});
