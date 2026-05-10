<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

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

const responsiveMenu = ref([
  ...items.value,
  {
    label: "Iniciar sesión",
    to: "/login",
    icon: "i-lucide-log-in",
    active: route.path.startsWith("/login"),
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <IconsNuxtui class="h-6 w-auto" />
    </template>

    <UNavigationMenu :items="items" />

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

      <UButton
        color="primary"
        variant="soft"
        icon="i-heroicons-user-circle"
        to="/login"
        label="Login"
      />
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
