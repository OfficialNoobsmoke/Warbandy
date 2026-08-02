import { appSettingsStorage } from '../domain/appSettings'
import { Character, Instance } from '../domain/character'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { warbandyHelperDataStorage } from '../domain/warbandyHelperData'

export default function CharactersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [showExpired, setShowExpired] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    const { wowPath } = appSettingsStorage.get()
    if (!wowPath) return

    const warbandyHelperData = warbandyHelperDataStorage.get()
    if (
      warbandyHelperData &&
      warbandyHelperData.characters &&
      warbandyHelperData.characters.length > 0
    )
      return setCharacters(warbandyHelperData.characters)

    window.electronAPI.getWarbandyHelperData(wowPath).then((data) => {
      setCharacters(data.characters)
      warbandyHelperDataStorage.set(data)
    })
  }, [])

  const filteredCharacters = useMemo(() => {
    const search = filter.toLowerCase()

    return characters.filter(
      (character) =>
        character.account.toLowerCase().includes(search) ||
        character.realm.toLowerCase().includes(search) ||
        character.name.toLowerCase().includes(search) ||
        character.savedRaids?.some((instance) => instance.name.toLowerCase().includes(search)) ||
        character.savedDungeons?.some((instance) => instance.name.toLowerCase().includes(search))
    )
  }, [characters, filter])

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

  function formatDate(date: Date | undefined): string {
    if (!date) return ''
    return date.toLocaleString()
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
      </div>
      <div className="table-container">
        <table className="characters-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Realm</th>
              <th>Name</th>
              <th>Race</th>
              <th>Class</th>
              <th>Saved Raids</th>
              <th>Saved Dungeons</th>
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
                <td>{character.race}</td>
                <td>{character.class}</td>
                <td>{formatSavedRaids(character.savedRaids || [])}</td>
                <td>{formatSavedDungeons(character.savedDungeons || [])}</td>
                <td>{character.isWeeklyQuestCompleted ? 'Yes' : 'No'}</td>
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
