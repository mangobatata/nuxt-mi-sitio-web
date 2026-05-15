import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug de producto requerido",
    });
  }

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: "Producto no encontrado",
    });
  }

  return product;
});
