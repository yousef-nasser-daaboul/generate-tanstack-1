export enum Projects {
  "Sahab" = "Sahab",
  "Dinarak" = "Dinarak",
}

export async function downloadModule(module: string, project: Projects) {
  const response = await fetch(
    project === Projects.Sahab
      ? `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
      : `https://dev-dinarak-app.asasstech.com:443/ClientCode/Get?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text(); // Use .json() or .blob() if needed
}
