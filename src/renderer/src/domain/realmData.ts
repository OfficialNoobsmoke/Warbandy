import { createStorage } from '../services/localStorageService'
import { Realm } from './character'

export interface RealmData {
  realms: Realm[]
}

export const realmDataStorage = createStorage<RealmData>('realmData')
