import { computed } from "vue";
import type { FetchError } from "ofetch";

// ─── Tipos ─────────────────────────────────────────────────────────────────
interface AuthError {
  statusCode: number;
  message: string;
}

interface AuthResult {
  success: boolean;
  error?: AuthError;
}

// ─── Composable ────────────────────────────────────────────────────────────
/**
 * Composable central de autenticación.
 *
 * Envuelve useUserSession de Nuxt Auth Utils y expone métodos de login,
 * registro y logout con manejo de errores estructurado.
 *
 * Uso:
 *   const { isLoggedIn, isAdmin, login, register, logout } = useAuthentication();
 */
export const useAuthentication = () => {
  const { loggedIn, session, user, clear, fetch, ready } = useUserSession();

  // ─── Helpers privados ─────────────────────────────────────────────────

  /**
   * Extrae un AuthError estructurado desde un FetchError de ofetch.
   * Si el error no es un FetchError reconocido, retorna un error genérico.
   */
  const parseError = (error: unknown): AuthError => {
    const fetchError = error as FetchError;
    return {
      statusCode: fetchError?.statusCode ?? 500,
      message:
        fetchError?.data?.message ??
        fetchError?.message ??
        "Error inesperado. Intenta más tarde.",
    };
  };

  // ─── Acciones ─────────────────────────────────────────────────────────

  /**
   * Inicia sesión con email y contraseña.
   * Navega a "/" en caso de éxito.
   *
   * @returns AuthResult con success y, si falló, el error estructurado.
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      await fetch();
      await navigateTo("/");

      return { success: true };
    } catch (error) {
      return { success: false, error: parseError(error) };
    }
  };

  /**
   * Registra un nuevo usuario e inicia sesión automáticamente.
   * Navega a "/" en caso de éxito.
   *
   * @returns AuthResult con success y, si falló, el error estructurado.
   */
  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    try {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: { fullName, email, password },
      });

      await fetch();
      await navigateTo("/");

      return { success: true };
    } catch (error) {
      return { success: false, error: parseError(error) };
    }
  };

  /**
   * Cierra la sesión del usuario actual y navega a "/".
   */
  const logout = async (): Promise<void> => {
    await clear();
    await navigateTo("/");
  };

  // ─── Getters computados ───────────────────────────────────────────────

  const isAdmin = computed(() => user.value?.roles.includes("admin") ?? false);

  // ─── API pública del composable ───────────────────────────────────────
  return {
    // Estado
    ready,
    loggedIn,
    session,
    user,
    isLoggedIn: loggedIn,  // Alias semántico
    isAdmin,

    // Métodos
    fetch,
    login,
    register,
    logout,
  };
};