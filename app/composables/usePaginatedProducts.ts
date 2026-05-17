// En Vue, computed sirve para crear un valor calculado reactivo.
// Es decir: Vue calcula un valor a partir de otros datos, y cuando esos datos cambian, el computed se actualiza automáticamente.

export const usePaginatedProducts = async (
  options: {
    search?: Ref<string>;
    status?: Ref<string>;
    sortBy?: Ref<string>;
    sortOrder?: Ref<"asc" | "desc">;
  } = {},
) => {
  // Obtenemos la ruta actual.
  // Esto nos permite leer los query params de la URL.
  // Ejemplo: /products?page=2&limit=20
  const route = useRoute();

  // Obtenemos el número de página desde la URL.
  // Si no existe o no es un número válido, usamos la página 1 por defecto.
  const page = computed(() => {
    const pageParam = route.query.page as string;

    return isNaN(+pageParam) ? 1 : +pageParam;
  });

  // Obtenemos el límite de productos por página desde la URL.
  // Si no existe o no es un número válido, usamos 10 por defecto.
  const limit = computed(() => {
    const limitParam = route.query.limit as string;

    return isNaN(+limitParam) ? 10 : +limitParam;
  });

  // Calculamos desde qué registro empezar a traer productos.
  // Esto se usa para la paginación en el backend.
  //
  // Ejemplo:
  // page = 1, limit = 10 => offset = 0
  // page = 2, limit = 10 => offset = 10
  // page = 3, limit = 10 => offset = 20
  const offset = computed(() => {
    return (page.value - 1) * limit.value;
  });

  const search = computed(() => options.search?.value ?? "");
  const statusFilter = computed(() => options.status?.value ?? "all");
  const sortBy = computed(() => options.sortBy?.value ?? "createdAt");
  const sortOrder = computed(() => options.sortOrder?.value ?? "desc");

  // Hacemos la petición a la API de productos.
  // Le enviamos limit y offset como query params.
  //
  // Ejemplo final:
  // /api/products?limit=10&offset=0
  const { data, error, status, execute, pending } = await useFetch(
    "/api/products",
    {
      query: {
        // Cantidad de productos por página
        limit,

        // Cantidad de productos que se deben saltar
        offset,
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
      },

      // Cuando cambie page o limit, Nuxt vuelve a ejecutar la petición.
      watch: [page, limit, search, statusFilter, sortBy, sortOrder],
    },
  );

  // Retornamos los datos y estados para usarlos en los componentes.
  return {
    // data contiene toda la respuesta de la API.
    // Es reactiva, por eso se accede con data.value internamente.
    data,

    // Lista de productos.
    // Si data todavía no existe, devuelve un array vacío.
    products: computed(() => data.value?.products || []),

    // Total de páginas disponibles.
    totalPages: computed(() => data.value?.totalPages || 0),

    // Página actual.
    currentPage: computed(() => data.value?.currentPage || 1),

    // Cantidad de productos por página.
    perPage: computed(() => data.value?.perPage || 10),

    // Total de productos existentes.
    total: computed(() => data.value?.total || 0),

    // Error de la petición, si ocurre alguno.
    error,

    // Estado de la petición.
    // Puede ser: idle, pending, success o error.
    status,

    // Función para ejecutar manualmente la petición otra vez.
    execute,

    // Indica si la petición está cargando.
    pending,
  };
};
