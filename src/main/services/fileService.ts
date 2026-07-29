import fs from 'fs'

export async function folderExists(path: string): Promise<boolean> {
  try {
    return (await fs.promises.stat(path)).isDirectory()
  } catch {
    return false
  }
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    return (await fs.promises.stat(path)).isFile()
  } catch {
    return false
  }
}

export async function readFile(path: string): Promise<string | null> {
  try {
    return await fs.promises.readFile(path, 'utf8')
  } catch {
    return null
  }
}

export async function writeFile(path: string, content: string): Promise<boolean> {
  await fs.promises.writeFile(path, content, 'utf8')
  return true
}
