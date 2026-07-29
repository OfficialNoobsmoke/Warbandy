import { unixToDate } from '../helpers/time'
import { Character, Instance } from '../models/character'
import { DbCharacter, DbSavedInstance } from '../models/dbCharacter'

function mapDbCharacterToCharacter(dbCharacter: DbCharacter, account: string): Character {
  return {
    account,
    realm: dbCharacter.realm,
    name: dbCharacter.name,
    race: dbCharacter.race,
    class: dbCharacter.class,
    weeklyCompleted: dbCharacter.weeklyCompleted,
    weeklyQuestCompletedAt: dbCharacter.weeklyQuestCompletedAt
      ? unixToDate(dbCharacter.weeklyQuestCompletedAt)
      : undefined,
    lastUpdated: dbCharacter.lastUpdated ? unixToDate(dbCharacter.lastUpdated) : undefined,
    savedRaids: (dbCharacter.savedInstances?.filter((instance) => instance?.isRaid) || []).map(
      mapDbSavedInstanceToInstance
    ),
    savedDungeons: (dbCharacter.savedInstances?.filter((instance) => !instance?.isRaid) || []).map(
      mapDbSavedInstanceToInstance
    )
  }
}

function mapDbSavedInstanceToInstance(dbSavedInstance: DbSavedInstance): Instance {
  return {
    id: dbSavedInstance.id,
    name: dbSavedInstance.name,
    difficulty: dbSavedInstance.difficulty,
    maxPlayers: dbSavedInstance.maxPlayers,
    locked: dbSavedInstance.locked,
    extended: dbSavedInstance.extended
  }
}

export default mapDbCharacterToCharacter
