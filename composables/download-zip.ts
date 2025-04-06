import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";
import JSZip from "jszip";

export const downloadZip = async (
  clientName: string,
  contentFiles: { name: string; content: string }[],
  withFormat: boolean = true
) => {
  const zip = new JSZip();

  // Add folder
  const folder = zip.folder(`${clientName}-generated`);

  if (folder && contentFiles.length > 0) {
    const tanstackFolder = folder.folder(`tanstack`); // Place tanstackFolder inside folder

    // Handle the first file separately
    const firstFile = contentFiles[0];
    const formattedFirstContent = withFormat
      ? await prettier.format(firstFile.content, {
          parser: "typescript",
          plugins: [parserTypescript, parserEstree],
          singleQuote: true,
          trailingComma: "all",
        })
      : firstFile.content;

    folder.file(firstFile.name, formattedFirstContent);

    if (tanstackFolder) {
      // Handle the rest of the files and place them in tanstackFolder
      for (let i = 1; i < contentFiles.length; i++) {
        const file = contentFiles[i];
        const formattedContent = withFormat
          ? await prettier.format(file.content, {
              parser: "typescript",
              plugins: [parserTypescript, parserEstree],
              singleQuote: true,
              trailingComma: "all",
            })
          : file.content;

        tanstackFolder.file(file.name, formattedContent);
      }
    }

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated.zip";
    link.click();
  }
};
