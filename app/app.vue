<script lang="ts" setup>
const count = ref(10);
await sleep(2000);

count.value = 20;
</script>

<template>
  <div>
    <h1>Welcome to Nuxt 4</h1>

    <button @click="count++">+</button>
    <button @click="count--">-</button>
    <p>{{ count }}</p>
  </div>
</template>
