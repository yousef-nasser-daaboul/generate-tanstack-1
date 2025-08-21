export function download(
  withTanstack: boolean,
  moduleName: string,
  files: { name: string; content: string }[],
  withFormat: boolean = true
) {
  if (withTanstack) {
    downloadZip(moduleName, files, withFormat);
  } else {
    files.forEach(({ name, content }) => downloadFile(name, content));
  }
}
