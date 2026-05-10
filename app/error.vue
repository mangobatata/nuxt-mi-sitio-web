<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();
</script>

<template>
  <UError
    :error="error"
    :clear="{
      size: 'xl',
      icon: 'skill-icons:gitlab-dark',
      // icon: 'i-lucide-arrow-left',
      // icon: 'humbleicons:brand-twitter',
      class: 'rounded-full',
    }"
    :ui="{
      statusCode: 'text-9xl font-thin',
    }"
  />
</template>
