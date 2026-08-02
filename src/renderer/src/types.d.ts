export {}

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>
      folderExists: (path: string) => Promise<boolean>
      readFile(filePath: string): Promise<string | null>
      writeFile(path: string, content: string): Promise<void>
      fileExists: (filePath: string) => Promise<boolean>
      getWarbandyHelperData: (wowPath: string) => Promise<WarbandyHelperData>
      getAppPath: () => Promise<string>
    }
  }
}
