export type Character = {
  account: string
  realm: string
  name: string
  hasData: boolean
  level?: number
  faction?: string
  race?: string
  class?: string
  weeklyQuestCompletedAt?: Date
  isWeeklyQuestCompleted?: boolean
  dailyHeroicCompletedAt?: Date
  isDailyHeroicCompleted?: boolean
  lastUpdated?: number
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
  isRaid: boolean
  isLocked: boolean
  reset: number
}

export type Realm = {
  name: string
  dailyReset?: Date
  weeklyReset?: Date
}

export type WarbandyHelperData = {
  characters: Character[]
  realms: Realm[]
}
