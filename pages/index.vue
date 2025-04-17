<script setup lang="ts">
import { downloadModule } from "~/composables/download-module";
import { generate } from "~/composables/generate";
import { download } from "~/composables/download";

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

const files = ref<{ name: string; content: string }[]>([]);

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

  files.value = await generate(
    fileContent,
    selectedClient.value,
    withTanstack.value
  );

  const end = performance.now();
  generateLoading.value = false;
  generateTime.value = ((end - start) / 1000).toFixed(2);
}

const withTanstack = ref(false);
const copied = ref(false);

const copyToClipboard = async () => {
  try {
    const text = files.value[0].content;
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard:");
    copied.value = true;
    setTimeout(() => (copied.value = false), 300);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
</script>

<template>
  <div class="flex flex-col justify-center gap-5">
    <h1 class="text-4xl font-bold">Hello World</h1>

    <AnimationTitle />
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

    <div v-if="generateTime" class="flex flex-col justify-center gap-5">
      <div class="relative w-full">
        <UButton
          class="w-full"
          icon="ic:baseline-content-copy"
          color="neutral"
          variant="outline"
          :ui="{ base: 'justify-center cursor-pointer', leadingIcon: 'px-3' }"
          @click="copyToClipboard"
        >
          Copy Client To Clipboard
        </UButton>
        <div v-if="copied" class="absolute w-full h-full top-0 left-0">
          <UBadge
            icon="ic:baseline-content-copy"
            :ui="{ base: 'justify-center cursor-pointer', leadingIcon: 'px-3' }"
            class="w-full h-full"
            >Copied</UBadge
          >
        </div>
      </div>
      <div class="flex justify-center">Or</div>
      <UButton
        trailing-icon="ic:outline-file-download"
        variant="subtle"
        size="md"
        :ui="{ base: 'justify-center cursor-pointer', trailingIcon: 'px-5' }"
        @click="download(withTanstack, selectedClient, files)"
      >
        Download
      </UButton>
    </div>
  </div>
</template>
