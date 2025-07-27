export enum Projects {
  "Sahab" = "sahab",
  "Dinarak" = "dinarak",
  "Masar" = "masar",
}

export async function downloadModule(module: string, project: Projects) {
  const response = await fetch(
    project === Projects.Sahab
      ? `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
      : project === Projects.Dinarak
        ? `https://dev-dinarak-app.asasstech.com:443/ClientCode/Get?module=${module}`
        : `https://dev-masar.asasstech.com:443/ClientCode/Generate?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text(); // Use .json() or .blob() if needed
}
