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

  if (!product || product.status !== "active") {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Product with slug ${slug} not found`,
      data: {
        slug,
        state: process.env.STAGE,
      },

      stack: process.env.STAGE !== "prod" ? new Error().stack : "",
    });
  }

  return product;
});
