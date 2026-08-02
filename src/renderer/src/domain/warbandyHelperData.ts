import { createStorage } from '../services/localStorageService'
import { Character, Realm } from './character'

export interface WarbandyHelperData {
  characters: Character[]
  realms: Realm[]
}

export const warbandyHelperDataStorage = createStorage<WarbandyHelperData>('warbandyHelperData')
