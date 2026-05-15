export const useAuthentication = () => {
  const { loggedIn, session, user, clear, fetch, ready } = useUserSession();

  const login = async (email: string, password: string) => {
    try {
      await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      await fetch();
      await navigateTo("/?message=Login successful");

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
  ) => {
    try {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: { fullName, email, password },
      });

      await fetch();
      await navigateTo("/?message=Registration successful");

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const logout = async () => {
    await clear();
    await navigateTo("/?message=Logout successful");
  };

  return {
    ready,
    loggedIn,
    session,
    user,

    // Getters
    isLoggedIn: loggedIn,
    isAdmin: computed(() => user.value?.roles.includes("admin") ?? false),

    // Methods, Acciones
    fetch,
    login,
    register,
    logout,
  };
};
