export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return;

  console.log("in middleware ====>");
  const token = localStorage?.getItem("token");
  console.log("in middleware ====>", token);

  if (token) {
    const { data, error } = await useFetch("/api/check-login", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(data.value);

    if (!(data.value as any)?.success) {
      console.error("Handle error (e.g., token is invalid)");
      return navigateTo("/login");
    }

    // Token is valid
  } else {
    console.log("No token, redirect to login");
    // No token, redirect to login
    return navigateTo("/login");
  }
});
