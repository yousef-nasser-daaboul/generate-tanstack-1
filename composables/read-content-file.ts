/**
 * Reads the content of a file and returns it as text
 * @param filePath - Path to the file to read
 * @returns Promise containing the file contents as string
 */
export async function readContentFile(filePath: string): Promise<string> {
  // This function needs to be used only on the server side
  if (process.server) {
    const { readFile } = await import('fs/promises')
    try {
      const content = await readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      throw new Error(`Failed to read file at ${filePath}: ${error}`)
    }
  } else {
    throw new Error('readContentFile can only be used on the server side')
  }
}
