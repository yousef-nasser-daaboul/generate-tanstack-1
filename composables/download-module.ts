export enum Projects {
  "Sahab" = "Sahab",
  "Dinarak" = "Dinarak",
  "Masar" = "Masar",
  "Bayan" = "Bayan",
  "AmanPay" = "Aman-Pay",
  "AmanPayBusiness" = "Aman-Pay Business",
}

export async function downloadModule(module: string, project: Projects) {
  const response = await fetch(
    project === Projects.Sahab
      ? `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
      : project === Projects.Dinarak
        ? `https://dev-dinarak-app.asasstech.com:443/ClientCode/Get?module=${module}`
        : project === Projects.Masar
          ? `https://dev-masar.asasstech.com:443/ClientCode/Generate?module=${module}`
          : project === Projects.Bayan
            ? `https://dev-bayan.asasstech.com:443/ClientCode/Generate?module=${module}`
            : project === Projects.AmanPay
              ? `https://dev-amanpay.asasstech.com:443/ClientCode/Generate?module=${module}`
              : `https://dev-amanpay-business.asasstech.com:443/ClientCode/Generate?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text(); // Use .json() or .blob() if needed
}
