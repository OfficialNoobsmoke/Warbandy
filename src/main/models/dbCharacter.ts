export type DbCharacter = {
  realm: string
  name: string
  race?: string
  class?: string
  weeklyCompleted?: boolean
  weeklyQuestCompletedAt?: number
  lastUpdated?: number
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
}
