import { defineEventHandler, createError } from "h3";

// ─── Constantes ────────────────────────────────────────────────────────────
const PROTECTED_PREFIX = "/api/admin";
const ADMIN_ROLE = "admin";

// ─── Middleware: Admin Guard ───────────────────────────────────────────────
/**
 * Middleware que protege todas las rutas bajo /api/admin.
 *
 * Flujo:
 *  1. Si la ruta no es /api/admin/*, pasa sin hacer nada.
 *  2. Verifica que el usuario tenga sesión activa (requireUserSession
 *     lanza 401 automáticamente si no está autenticado).
 *  3. Verifica que el usuario tenga el rol "admin" (403 si no lo tiene).
 *
 * Códigos de respuesta:
 *  - 401 Unauthorized  → sin sesión activa.
 *  - 403 Forbidden     → autenticado pero sin permisos de admin.
 */
export default defineEventHandler(async (event) => {
  // 1. Ignorar rutas que no sean del área admin
  if (!event.path.startsWith(PROTECTED_PREFIX)) return;

  // 2. Verificar sesión activa
  //    requireUserSession lanza 401 automáticamente si no hay sesión
  const { user } = await requireUserSession(event);

  // 3. Verificar rol de admin
  //    401 → "no sé quién eres"  (sin sesión)
  //    403 → "sé quién eres, pero no tienes permiso" (sin rol)
  if (!user.roles.includes(ADMIN_ROLE)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "No tienes permisos para acceder a esta sección.",
    });
  }
});