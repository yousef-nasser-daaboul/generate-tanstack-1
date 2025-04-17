export function download(
  withTanstack: boolean,
  moduleName: string,
  files: { name: string; content: string }[]
) {
  if (withTanstack) {
    downloadZip(moduleName, files);
  } else {
    files.forEach(({ name, content }) => downloadFile(name, content));
  }
}
