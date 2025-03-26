<script setup lang="ts">
import JSZip from "jszip";
import { generate } from "~/composables/generate";
import { generateFolderNameWithDateNow } from "~/utils/helper/generate-folder-name";
import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";

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

const startGenerate = async () => {
  loading.value = true;

  // Download Module
  const { data } = await useFetch(
    "/api/download-module?module=" + selectedClient.value
  );

  console.log(data);

  const dataValue = data.value as { fileContent?: string };

  if (!dataValue.fileContent) return;

  // Generate Content
  const content = generate(dataValue.fileContent);

  console.log(content);

  // Write File
  const folderName = generateFolderNameWithDateNow();

  downloadZip(
    folderName,
    `${selectedClient.value.toLowerCase()}.client.ts`,
    content
  );

  // const response = await $fetch("/api/write-file", {
  //   method: "post",
  //   body: {
  //     module: selectedClient.value,
  //     outputPath: "public/" + folderName,
  //     content: content,
  //   },
  // });

  // console.log(response);

  // Download Archived Path
  // if ((response as { archivePath: string }).archivePath) {
  //   const response = await fetch("generated.zip");
  //   const blob = await response.blob();
  //   const url = window.URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "generated.zip";
  //   document.body.appendChild(a);
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  //   document.body.removeChild(a);
  // }

  loading.value = false;
};

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
