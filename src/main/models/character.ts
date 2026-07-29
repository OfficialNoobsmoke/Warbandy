export type Character = {
  account: string
  realm: string
  name: string
  race?: string
  class?: string
  weeklyCompleted?: boolean
  weeklyQuestCompletedAt?: Date
  lastUpdated?: Date
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
}
