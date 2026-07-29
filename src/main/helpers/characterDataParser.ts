import { Character } from '../models/dbCharacter'

function parseCharacters(db: any): Character[] {
  return Object.entries(db.char).map(([key, data]) => {
    const [name, realm] = key.split(' - ')

    return {
      name,
      realm,
      ...data
    }
  })
}

export { parseCharacters }
