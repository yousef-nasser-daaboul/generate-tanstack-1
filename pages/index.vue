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
const downloadLoading = ref(false);
const generateLoading = ref(false);
const generateTime = ref("");

async function startGenerate() {
  // Download Module
  downloadLoading.value = true;
  const fileContent = await downloadModule(selectedClient.value);
  downloadLoading.value = false;

  // console.log(fileContent);

  if (!fileContent) return;

  // Generate Content
  generateLoading.value = true;
  const start = performance.now();
  const content = generate(fileContent);

  // console.log(content);

  // // Write File
  const folderName = generateFolderNameWithDateNow();

  downloadZip(
    folderName,
    `${selectedClient.value.toLowerCase()}.client.ts`,
    content
  );
  const end = performance.now();
  generateLoading.value = false;
  generateTime.value = ((end - start) / 1000).toFixed(2);
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
