import path from 'path'
import { DbCharacter, DbRealm } from '../models/dbCharacter'
import fs from 'fs'
import { LuaParser } from '../helpers/luaParser'
import { parseCharacters, parseRealms } from '../helpers/warbandyHelperDataParser'
import mapDbCharacterToCharacter from '../mappers/characterMapper'
import { Character, Realm, WarbandyHelperData } from '../models/character'
import { unixToDate } from '../helpers/time'
import { getNextDailyReset, getNextWeeklyReset } from '../helpers/resetHelper'

export async function getWarbandyHelperData(wowPath: string): Promise<WarbandyHelperData> {
  const characters: Character[] = []
  let realms: Realm[] = []

  const accountsPath = path.join(wowPath, 'WTF', 'Account')
  const accountDirs = await fs.promises.readdir(accountsPath, {
    withFileTypes: true
  })

  for (const accountDir of accountDirs) {
    if (!accountDir.isDirectory()) {
      continue
    }

    const accountData = await loadAccountData(path.join(accountsPath, accountDir.name))

    const accountCharacters = await loadCharacters(
      accountDir.name,
      path.join(accountsPath, accountDir.name),
      accountData
    )

    characters.push(...accountCharacters.characters)
    realms = updateRealms(realms, accountCharacters.realms)
  }

  const result = { characters, realms: [...realms.values()] }

  updateDataAfterRead(result)

  return result
}

function updateRealms(realms: Realm[], dbRealms: Realm[]): Realm[] {
  const realmMap = new Map<string, Realm>()
  for (const realm of realms) {
    realmMap.set(realm.name, realm)
  }

  for (const dbRealm of dbRealms) {
    const existingRealm = realmMap.get(dbRealm.name)
    if (existingRealm) {
      if (!existingRealm.dailyReset && dbRealm.dailyReset) {
        existingRealm.dailyReset = dbRealm.dailyReset
      }
      if (!existingRealm.weeklyReset && dbRealm.weeklyReset) {
        existingRealm.weeklyReset = dbRealm.weeklyReset
      }
    } else {
      realmMap.set(dbRealm.name, dbRealm)
    }
  }

  return [...realmMap.values()]
}

function updateDataAfterRead({ characters, realms }: WarbandyHelperData): void {
  const realmMap = new Map<string, Realm>()
  for (const realm of realms) {
    realmMap.set(realm.name, realm)
  }

  for (const character of characters) {
    const realm = realmMap.get(character.realm)
    if (!realm || (!realm.dailyReset && !realm.weeklyReset) || !character.hasData) {
      continue
    }

    if (character.weeklyQuestCompletedAt && realm.weeklyReset) {
      character.isWeeklyQuestCompleted =
        getNextWeeklyReset(realm.weeklyReset, character.weeklyQuestCompletedAt).getTime() >
        Date.now()
    }

    if (character.dailyHeroicCompletedAt && realm.dailyReset) {
      character.isDailyHeroicCompleted =
        getNextDailyReset(realm.dailyReset, character.dailyHeroicCompletedAt).getTime() > Date.now()
    }

    if (character.lastUpdated) {
      for (const instance of [
        ...(character.savedRaids || []),
        ...(character.savedDungeons || [])
      ]) {
        instance.isLocked =
          instance.locked === false
            ? false
            : (character.lastUpdated + instance.reset) * 1000 > Date.now()
      }
    }
  }
}

async function loadAccountData(accountPath: string): Promise<{
  characters: DbCharacter[]
  realms: DbRealm[]
}> {
  const savedVariablesPath = path.join(accountPath, 'SavedVariables')

  try {
    const lua = await fs.promises.readFile(
      path.join(savedVariablesPath, 'WarbandyHelper.lua'),
      'utf8'
    )

    const db = new LuaParser(lua).parse().value

    return {
      characters: parseCharacters(db),
      realms: parseRealms(db)
    }
  } catch {
    return {
      characters: [],
      realms: []
    }
  }
}

async function loadCharacters(
  account: string,
  accountPath: string,
  db: {
    characters: DbCharacter[]
    realms: DbRealm[]
  }
): Promise<WarbandyHelperData> {
  const characters: Character[] = []
  const realms: Realm[] = []

  const realmDirs = await fs.promises.readdir(accountPath, {
    withFileTypes: true
  })

  for (const realmDir of realmDirs) {
    if (!realmDir.isDirectory() || realmDir.name === 'SavedVariables') {
      continue
    }

    const realmName = realmDir.name

    realms.push(buildRealm(realmName, db.realms))

    const characterDirs = await fs.promises.readdir(path.join(accountPath, realmName), {
      withFileTypes: true
    })

    for (const characterDir of characterDirs) {
      if (!characterDir.isDirectory()) {
        continue
      }

      characters.push(buildCharacter(account, realmName, characterDir.name, db.characters))
    }
  }

  return { characters, realms }
}

function buildRealm(name: string, realms: DbRealm[]): Realm {
  const realm = realms.find((r) => r.name === name)

  return {
    name,
    dailyReset: realm?.dailyReset ? unixToDate(realm?.dailyReset) : undefined,
    weeklyReset: realm?.weeklyReset ? unixToDate(realm?.weeklyReset) : undefined
  }
}

function buildCharacter(
  account: string,
  realm: string,
  name: string,
  dbCharacters: DbCharacter[]
): Character {
  const dbCharacter = dbCharacters.find((c) => c.realm === realm && c.name === name)

  if (dbCharacter) {
    return mapDbCharacterToCharacter(dbCharacter, account)
  }

  return {
    account,
    realm,
    name,
    hasData: false
  }
}
