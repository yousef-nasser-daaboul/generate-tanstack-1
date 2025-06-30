<script setup lang="ts">
const password = ref("");
const errorMsg = ref("");

const loading = ref(false);
async function login() {
  loading.value = true;
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: password.value }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      errorMsg.value = data.message;
      throw new Error(data.message || "Login failed");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      console.log(data.module);
      useState("module", () => data.module);
      location.replace("/");
      // return navigateTo("/");
    }
  } catch (error) {
    console.error("Login error:", error);
    // Optionally: show error message to user
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div @keydown.enter="login">
    <h1 class="mt-40 text-4xl font-bold">Welcome To Generate Tanstack</h1>
    <div class="flex justify-center w-full h-full items-center -mt-50">
      <div class="flex flex-col gap-5">
        <TextInputField
          v-model:value="password"
          v-model:error-msg="errorMsg"
          label="Password"
          placeholder="Enter The Password"
        />
        <UButton class="w-full" block @click="login" :disabled="loading">
          <span v-if="loading">Loading...</span>
          <span v-else>Login</span>
        </UButton>
      </div>
    </div>
  </div>
</template>
