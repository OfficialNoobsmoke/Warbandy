export type Character = {
  account: string
  realm: string
  name: string
  race?: string
  class?: string
  weeklyQuestCompletedAt?: Date
  isWeeklyQuestCompleted?: boolean
  lastUpdatedAt?: Date
  savedRaids?: Instance[]
  savedDungeons?: Instance[]
}

export type Instance = {
  id: number
  name: string
  difficulty: number
  maxPlayers: number
  locked: boolean
  extended: boolean
  isLocked?: boolean
}

export type Realm = {
  name: string
  dailyReset?: Date
  weeklyReset?: Date
}
