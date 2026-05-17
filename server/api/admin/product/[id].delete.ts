import prisma from "@@/lib/prisma";
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseStatus,
} from "h3";

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

export default defineEventHandler(async (event) => {
  const id = parseProductId(getRouterParam(event, "id"));

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, status: true },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No se encontró un producto con id ${id}.`,
    });
  }

  await prisma.$transaction([
    prisma.productChange.create({
      data: {
        productId: id,
        productName: product.name,
        action: "deleted",
        changes: {
          slug: product.slug,
          status: product.status,
        },
      },
    }),
    prisma.product.delete({
      where: { id },
    }),
  ]);

  setResponseStatus(event, 200);

  return {
    message: "Producto eliminado exitosamente.",
    product,
  };
});
