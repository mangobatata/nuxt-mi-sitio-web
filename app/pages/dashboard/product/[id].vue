<script setup lang="ts">
import { z } from 'zod';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Variables
const rawId = route.params.id as string;
</script>

<template>
    <h1>Product ID: {{ rawId }}</h1>
</template>