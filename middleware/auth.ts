export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return;

  const token = localStorage?.getItem("token");

  if (token) {
    const { data } = await useFetch("/api/check-login", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!(data.value as any)?.success) {
      console.error("Handle error (e.g., token is invalid)");
      return navigateTo("/login");
    }

    // useState("module", () => (data.value as any)?.module);
    // Token is valid
  } else {
    // No token, redirect to login
    return navigateTo("/login");
  }
});
