<script setup lang="ts">
import JSZip from "jszip";
import { generate } from "~/composables/generate";
import { generateFolderNameWithDateNow } from "~/utils/helper/generate-folder-name";
import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";

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

  // Download Module
  const fileContent = await downloadModule(selectedClient.value);

  console.log(fileContent);

  if (!fileContent) return;

  // Generate Content
  const content = generate(fileContent);

  console.log(content);

  // // Write File
  // const folderName = generateFolderNameWithDateNow();

  // downloadZip(
  //   folderName,
  //   `${selectedClient.value.toLowerCase()}.client.ts`,
  //   content
  // );

  loading.value = false;
}

async function downloadModule(module: string) {
  const response = await fetch(
    `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text(); // Use .json() or .blob() if needed
}

const downloadZip = async (
  folderName: string,
  fileName: string,
  content: string,
  withFormat: boolean = true
) => {
  const zip = new JSZip();

  // Add folder
  const folder = zip.folder(folderName);

  if (folder) {
    const formattedContent = withFormat
      ? await prettier.format(content, {
          parser: "typescript",
          plugins: [parserTypescript, parserEstree],
          singleQuote: true,
          trailingComma: "all",
        })
      : content;

    // Add files with content
    folder.file(fileName, formattedContent);

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated.zip";
    link.click();
  }
};
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
