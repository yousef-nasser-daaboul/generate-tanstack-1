export async function downloadModule(module: string) {
  const response = await fetch(
    `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text(); // Use .json() or .blob() if needed
}
