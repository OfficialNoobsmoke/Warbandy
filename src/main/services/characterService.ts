import path from 'path'
import { Character, DbCharacter } from '../models/dbCharacter'
import fs from 'fs'
import { LuaParser } from '../helpers/luaParser'
import { parseCharacters } from '../helpers/characterDataParser'
import mapDbCharacterToCharacter from '../mappers/characterMapper'

export async function getCharacters(wowPath: string): Promise<Character[]> {
  let characters: Character[] = []
  const accountsPath = path.join(wowPath, 'WTF', 'Account')
  const accountDirs = await fs.promises.readdir(accountsPath, { withFileTypes: true })

  for (const accountDir of accountDirs) {
    if (!accountDir.isDirectory()) {
      continue
    }

    const accountName = accountDir.name
    const accountPath = path.join(accountsPath, accountName)
    const savedVariablesPath = path.join(accountPath, 'SavedVariables')
    const realmDirs = await fs.promises.readdir(accountPath, { withFileTypes: true })

    const savedVariablesFolder = await fs.promises.stat(savedVariablesPath).catch(() => null)
    const warbandyHelperData = await fs.promises
      .readFile(path.join(savedVariablesPath, 'WarbandyHelper.lua'), 'utf8')
      .catch(() => null)

    if (!savedVariablesFolder || !savedVariablesFolder.isDirectory()) {
      continue
    }

    let parsedCharacters: DbCharacter[] = []
    let warbandyHelperDataParsed: any | null = null
    if (warbandyHelperData) {
      const parser = new LuaParser(warbandyHelperData || '')
      warbandyHelperDataParsed = parser.parse().value
      parsedCharacters = parseCharacters(warbandyHelperDataParsed)
    }

    for (const realmDir of realmDirs) {
      if (!realmDir.isDirectory() || realmDir.name === 'SavedVariables') {
        continue
      }

      const realmName = realmDir.name
      const realmPath = path.join(accountPath, realmName)
      const characterDirs = await fs.promises.readdir(realmPath, { withFileTypes: true })

      for (const characterDir of characterDirs) {
        if (!characterDir.isDirectory()) {
          continue
        }

        let character = parsedCharacters.find(
          (c) => c.realm === realmName && c.name === characterDir.name
        )
        if (character) {
          characters.push(mapDbCharacterToCharacter(character, accountName))
        } else {
          characters.push({
            account: accountName,
            realm: realmName,
            name: characterDir.name
          })
        }
      }
    }
  }

  return characters
}
