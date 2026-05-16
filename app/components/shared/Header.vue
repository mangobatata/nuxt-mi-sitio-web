<script setup lang="ts">
import type { NavigationMenuItem } from "#ui/components/NavigationMenu.vue";

const route = useRoute();
const { isLoggedIn, logout, isAdmin } = useAuthentication();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Productos",
    to: "/products",
    icon: "i-lucide-package", // Representa mejor un catálogo de productos
    active: route.path.startsWith("/products"),
  },
  {
    label: "Precios",
    to: "/pricing",
    icon: "i-lucide-banknote", // Ideal para planes y costos
    active: route.path.startsWith("/pricing"),
  },
  {
    label: "Nosotros",
    to: "/about",
    icon: "i-lucide-users", // Representa al equipo o empresa
  },
  {
    label: "Contacto",
    to: "/contact",
    icon: "i-lucide-mail", // El estándar para contacto/correo
  },
]);

const responsiveMenu = computed<NavigationMenuItem[]>(() => [
  ...items.value,
  ...(isLoggedIn.value
    ? [
        {
          label: "Cerrar sesión",
          icon: "i-lucide-log-out",
          onSelect: logout,
        },
      ]
    : [
        {
          label: "Iniciar sesión",
          to: "/login",
          icon: "i-lucide-log-in",
          active: route.path.startsWith("/login"),
        },
      ]),
]);
</script>

<template>
  <UHeader>
    <template #title>
      <IconsNuxtui class="h-6 w-auto" />
    </template>

    <UNavigationMenu :items="items" />

    <!-- Solución Real  -->
    <ClientOnly>
      <UNavigationMenu
        v-if="isAdmin"
        :items="[
          {
            label: 'Dashboard',
            to: '/dashboard',
          },
        ]"
      />
    </ClientOnly>

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>

      <ClientOnly>
        <UButton
          v-if="!isLoggedIn"
          color="primary"
          variant="soft"
          icon="i-heroicons-user-circle"
          to="/login"
          label="Login"
        />

        <UButton
          v-else
          variant="ghost"
          icon="i-heroicons-user-circle"
          label="Cerrar sesión"
          @click="logout"
        />
      </ClientOnly>
    </template>

    <template #body>
      <UNavigationMenu
        :items="responsiveMenu"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
