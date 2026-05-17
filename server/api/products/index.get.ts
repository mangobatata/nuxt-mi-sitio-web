import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let limit = parseInt(query.limit as string) || 10;
  let offset = parseInt(query.offset as string) || 0;
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const rawStatus = typeof query.status === "string" ? query.status : "all";
  const status = ["all", "draft", "active", "archived"].includes(rawStatus)
    ? rawStatus
    : "all";
  const sortBy = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  // Validaciones
  if (isNaN(limit) || limit <= 1) limit = 10;
  if (isNaN(offset) || offset < 0) offset = 0;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { tags: { has: search } },
          ],
        }
      : {}),
    ...(status !== "all" ? { status } : {}),
  };

  const orderBy =
    sortBy === "name" || sortBy === "price" || sortBy === "updatedAt"
      ? { [sortBy]: sortOrder }
      : { createdAt: sortOrder };

  const products = await prisma.product.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy,
  });

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / limit);

  return {
    products,
    totalPages,
    currentPage: offset / limit + 1,
    perPage: limit,
    total,
  };
});
