import { appSettingsStorage } from '../domain/appSettings'
import { Character, Instance } from '../domain/character'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { warbandyHelperDataStorage } from '../domain/warbandyHelperData'

export default function CharactersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [showExpired, setShowExpired] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [showCharactersWithNoData, setShowCharactersWithNoData] = useState(false)
  const loading = useRef(false)

  useEffect(() => {
    const cached = warbandyHelperDataStorage.get()

    if (cached?.characters?.length) {
      setCharacters(cached.characters)
    } else {
      loadCharacters()
    }

    const unsubscribe = window.electronAPI.onWarbandyHelperDataChanged(() => {
      loadCharacters()
    })

    return unsubscribe
  }, [])

  async function loadCharacters() {
    if (loading.current) return

    loading.current = true

    try {
      const { wowPath } = appSettingsStorage.get()
      if (!wowPath) return

      const data = await window.electronAPI.getWarbandyHelperData(wowPath)

      setCharacters(data.characters)
      warbandyHelperDataStorage.set(data)
    } finally {
      loading.current = false
    }
  }
  const filteredCharacters = useMemo(() => {
    const search = filter.toLowerCase()

    return characters.filter((character) => {
      if (!showCharactersWithNoData && !character.hasData) {
        return false
      }

      return (
        character.account.toLowerCase().includes(search) ||
        character.realm.toLowerCase().includes(search) ||
        character.name.toLowerCase().includes(search) ||
        character.savedRaids?.some((instance) => instance.name.toLowerCase().includes(search)) ||
        character.savedDungeons?.some((instance) => instance.name.toLowerCase().includes(search))
      )
    })
  }, [characters, filter, showCharactersWithNoData])

  function formatSavedRaids(instances: Instance[]) {
    return instances
      .filter((instance) => showExpired || instance.isLocked)
      .map((instance) => {
        return `${!instance.isLocked ? '(X)' : ''}${instance.name} (${instance.maxPlayers}) ${instance.difficulty === 2 ? 'HC' : 'NM'}${instance.extended ? ' Extended' : ''}`
      })
      .join(', ')
  }

  function formatSavedDungeons(instances: Instance[]) {
    return instances
      .filter((instance) => showExpired || instance.isLocked)
      .map((instance) => `${!instance.isLocked ? '(X)' : ''}${instance.name}`)
      .join(', ')
  }

  function formatWeeklyQuestCompleted(
    isWeeklyQuestCompleted: boolean | undefined,
    characterHasData: boolean
  ): string {
    if (isWeeklyQuestCompleted === undefined && !characterHasData) return ''
    return isWeeklyQuestCompleted ? 'Yes' : 'No'
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return ''
    return new Date(date).toLocaleString()
  }

  return (
    <div>
      <h1>Characters</h1>

      <div>
        <input
          type="text"
          placeholder="Filter by account, realm or character..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button onClick={() => navigate('/')}>Back</button>
        <label>
          <input
            type="checkbox"
            checked={showExpired}
            onChange={(e) => setShowExpired(e.target.checked)}
          />
          Show expired
        </label>
        <label>
          <input
            type="checkbox"
            checked={showCharactersWithNoData}
            onChange={(e) => setShowCharactersWithNoData(e.target.checked)}
          />
          Show characters with no data
        </label>
      </div>
      <div className="table-container">
        <table className="characters-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Realm</th>
              <th>Name</th>
              <th>Level</th>
              <th>Faction</th>
              <th>Race</th>
              <th>Class</th>
              <th>Saved Raids</th>
              <th>Saved Dungeons</th>
              <th>Daily Heroic RDF Completed</th>
              <th>Weekly Quest Completed</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {filteredCharacters.map((character) => (
              <tr key={`${character.account}-${character.realm}-${character.name}`}>
                <td>{character.account}</td>
                <td>{character.realm}</td>
                <td>{character.name}</td>
                <td>{character.level}</td>
                <td>{character.faction}</td>
                <td>{character.race}</td>
                <td>{character.class}</td>
                <td>{formatSavedRaids(character.savedRaids || [])}</td>
                <td>{formatSavedDungeons(character.savedDungeons || [])}</td>
                <td>
                  {formatWeeklyQuestCompleted(character.isDailyHeroicCompleted, character.hasData)}
                </td>
                <td>
                  {formatWeeklyQuestCompleted(character.isWeeklyQuestCompleted, character.hasData)}
                </td>
                <td>{formatDate(character.lastUpdatedAt)}</td>
              </tr>
            ))}

            {filteredCharacters.length === 0 && (
              <tr>
                <td colSpan={8}>No characters found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
