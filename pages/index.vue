<script setup lang="ts">
import { generate } from "~/composables/generate";

useHead({
  script: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.7.3/typescript.min.js",
      async: true,
    },
  ],
});

// Clients : Common, Customer, FCExchange, Finance, EntityManagement, Compliance, Utilities, Remittance, Accounting, SystemSettings
const clients = [
  "Common",
  "Customer",
  "FCExchange",
  "Finance",
  "EntityManagement",
  "Compliance",
  "Utilities",
  "Remittance",
  "Accounting",
  "SystemSettings",
];

const selectedClient = ref();
const loading = ref(false);

async function startGenerate() {
  loading.value = true;

  // Generate Content
  await generate(selectedClient.value);

  loading.value = false;
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen gap-5">
    <h1 class="text-4xl font-bold">Hello World</h1>
    <Select
      v-model="selectedClient"
      class="w-52"
      :items="clients"
      label="Select Module"
    />
    <UButton class="w-52" block @click="startGenerate" :disabled="loading">
      <span v-if="loading">Loading...</span>
      <span v-else>Generate</span>
    </UButton>
  </div>
</template>
