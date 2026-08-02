import { DbCharacter, DbRealm } from '../models/dbCharacter'

function parseCharacters(db: any): DbCharacter[] {
  return Object.entries(db.char).map(([key, data]) => {
    const [name, realm] = key.split(' - ')

    return {
      name,
      realm,
      ...data
    }
  })
}

function parseRealms(db: any): DbRealm[] {
  return Object.entries(db.realm).map(([key, data]) => {
    return {
      name: key,
      ...data
    }
  })
}

export { parseCharacters, parseRealms }
