<script setup lang="ts">
import { downloadModule, Projects } from "~/composables/download-module";
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

// const module = useState<Projects>("module");

// Clients : Common, Customer, FCExchange, Finance, EntityManagement, Compliance, Utilities, Remittance, Accounting, SystemSettings

const sahabClients = [
  "Common",
  "Complaint",
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
const dinarakClients = [
  "Common",
  "Complaint",
  "Customer",
  "FCExchange",
  "Finance",
  "EntityManagement",
  "Compliance",
  "Utilities",
  "Remittance",
  "Accounting",
  "SystemSettings",
  "custom",
  "Global",
  "Support",
];
const masarClients = [
  "Vehicle",
  "Pricing",
  "Shared",
  "EntityManagement",
  "FileManagement",
  "SystemSettings",
];
const bayanClients = [
  "Employee",
  "Shared",
  "EntityManagement",
  "FileManagement",
  "SystemSettings",
];

const clients = {
  [Projects.Sahab]: sahabClients,
  [Projects.Dinarak]: dinarakClients,
  [Projects.Masar]: masarClients,
  [Projects.Bayan]: bayanClients,
};

enum generateType {
  Select = "Select",
  Upload = "Upload",
}
const selectedProject = ref<Projects>(
  (localStorage.getItem("current_project") as Projects) ?? Projects.Sahab
);
const selectedClient = ref(clients[selectedProject.value][0]);

watch(
  () => selectedProject.value,
  () => {
    selectedClient.value = clients[selectedProject.value][0];
    // Store Client
    localStorage.setItem("current_project", selectedProject.value);
  }
);

const files = ref<{ name: string; content: string }[]>([]);

const downloadLoading = ref(false);
const generateLoading = ref(false);
const generateTime = ref("");

const fileContent = ref();
const generateTypeModel = ref(generateType.Select);
const uploadFileModel = ref();

async function handleGenerateClicked() {
  if (generateTypeModel.value === generateType.Select) {
    downloadFile();
  } else if (fileContent.value) {
    await generateContent(fileContent.value);
  }
}

async function downloadFile() {
  // Download Module
  downloadLoading.value = true;
  let fileContent = "";
  try {
    fileContent = await downloadModule(
      selectedClient.value,
      selectedProject.value
    );

    if (!fileContent) return;
  } catch (e) {
    console.error("Error Network");
  }
  downloadLoading.value = false;

  await generateContent(fileContent);
}

async function generateContent(fileContent: string) {
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

const handleFileChange = async () => {
  fileContent.value = await uploadFileModel.value?.text();
};

watch(uploadFileModel, handleFileChange);
</script>

<template>
  <div class="grid grid-cols-12 h-screen">
    <div class="col-span-12 w-full items-center flex flex-col gap-5">
      <!-- <div class="px-10 mt-10 w-full flex justify-end">
        <UButton class="w-fit" color="info" block @click="navigateTo('/login')">
          < Logout
        </UButton>
      </div>
      <h2 class="text-2xl font-semibold">
        Your Currently in
        <span class="text-green-500 font-bold text-3xl">
          {{ module?.toUpperCase() }}
        </span>
      </h2>
      <span class="text-gray-500 text-sm italic">
        If you want to change project => logout!
      </span> -->
      <!-- <div class="w-full px-96 mt-10">
        <AnimationTitle />
      </div> -->
      <div class="flex flex-col h-full mt-10 gap-5 justify-center">
        <h1 class="text-4xl font-bold">Hello World</h1>
        <Select
          v-model="selectedProject"
          class="w-52"
          :items="Object.values(Projects)"
          label="Select Project"
        />
        <URadioGroup
          v-model="generateTypeModel"
          orientation="horizontal"
          default-value="Select"
          :items="[generateType.Select, generateType.Upload]"
        />
        <Select
          v-if="generateTypeModel === generateType.Select"
          v-model="selectedClient"
          class="w-52"
          :items="clients[selectedProject]"
          label="Select Module"
        />
        <UFileUpload
          v-else
          v-model="uploadFileModel"
          accept=".ts"
          class="w-52 h-24"
        />
        <UCheckbox v-model="withTanstack">
          <template #label>
            <div class="text-green-400">With Tanstack</div>
          </template>
        </UCheckbox>
        <UButton
          class="w-52"
          block
          @click="handleGenerateClicked"
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
              :ui="{
                base: 'justify-center cursor-pointer',
                leadingIcon: 'px-3',
              }"
              @click="copyToClipboard"
            >
              Copy Client To Clipboard
            </UButton>
            <div v-if="copied" class="absolute w-full h-full top-0 left-0">
              <UBadge
                icon="ic:baseline-content-copy"
                :ui="{
                  base: 'justify-center cursor-pointer',
                  leadingIcon: 'px-3',
                }"
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
            :ui="{
              base: 'justify-center cursor-pointer',
              trailingIcon: 'px-5',
            }"
            @click="download(withTanstack, selectedClient, files)"
          >
            Download
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
