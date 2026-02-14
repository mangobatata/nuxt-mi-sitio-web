<script lang="ts" setup>


const count = ref(5)

await sleep(2000)
count.value = 20
</script>

<template>
  <div>
    <h1>Hello, World! - {{ count }}</h1>
    <button @click="count++">Click me+</button>
  </div>
</template>

<!-- <style>
body {
  background-color: #020420;
  font-family: 'Roboto', sans-serif;
  color: #fff;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: #00dc82;
}
</style> -->