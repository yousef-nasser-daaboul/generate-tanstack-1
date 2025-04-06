<script setup lang="ts">
import { downloadModule } from "~/composables/download-module";
import { downloadZip } from "~/composables/download-zip";
import { generate } from "~/composables/generate";
import { generateFolderNameWithDateNow } from "~/utils/helper/generate-folder-name";

useHead({
  script: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.7.3/typescript.min.js",
      async: true,
    },
  ],
});

definePageMeta({
  middleware: "auth",
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

const selectedClient = ref(clients[0]);
const downloadLoading = ref(false);
const generateLoading = ref(false);
const generateTime = ref("");

async function startGenerate() {
  // Download Module
  downloadLoading.value = true;
  let fileContent = "";
  try {
    fileContent = await downloadModule(selectedClient.value);

    if (!fileContent) return;
  } catch (e) {
    console.error("Error Network");
  }
  downloadLoading.value = false;

  // Generate Content
  generateLoading.value = true;
  const start = performance.now();

  generate(fileContent, selectedClient.value,withTanstack.value);

  const end = performance.now();
  generateLoading.value = false;
  generateTime.value = ((end - start) / 1000).toFixed(2);
}

const withTanstack = ref(false);
</script>

<template>
  <div class="flex flex-col justify-center gap-5">
    <h1 class="text-4xl font-bold">Hello World</h1>
    <Select
      v-model="selectedClient"
      class="w-52"
      :items="clients"
      label="Select Module"
    />

    <UCheckbox v-model="withTanstack">
      <template #label>
        <div class="text-green-400">With Tanstack</div>
      </template>
    </UCheckbox>
    <UButton
      class="w-52"
      block
      @click="startGenerate"
      :disabled="downloadLoading || generateLoading"
    >
      <span v-if="downloadLoading">Download Module...</span>
      <span v-else-if="generateLoading">Generating...</span>
      <span v-else>Generate</span>
    </UButton>
    <div v-if="generateTime">Generated In {{ generateTime }} seconds</div>
  </div>
</template>
