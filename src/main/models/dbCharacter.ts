export type DbCharacter = {
  realm: string
  name: string
  race: string
  class: string
  weeklyQuestCompletedAt?: number
  lastUpdated: number
  savedInstances?: DbSavedInstance[]
}

export type DbSavedInstance = {
  id: number
  name: string
  difficulty: number
  maxPlayers: number
  locked: boolean
  extended: boolean
  isRaid: boolean
  reset: number
}

export type DbRealm = {
  name: string
  dailyReset?: number
  weeklyReset?: number
}
