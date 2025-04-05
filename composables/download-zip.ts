import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";
import JSZip from "jszip";

export const downloadZip = async (
  folderName: string,
  fileName: string,
  content: string,
  withFormat: boolean = true
) => {
  const zip = new JSZip();

  // Add folder
  const folder = zip.folder(folderName);

  if (folder) {
    const formattedContent = withFormat
      ? await prettier.format(content, {
          parser: "typescript",
          plugins: [parserTypescript, parserEstree],
          singleQuote: true,
          trailingComma: "all",
        })
      : content;

    // Add files with content
    folder.file(fileName, formattedContent);

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated.zip";
    link.click();
  }
};
