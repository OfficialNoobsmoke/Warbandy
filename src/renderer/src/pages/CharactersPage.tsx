import { Character } from '@renderer/domain/character'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CharactersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')

  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    const wowPath = localStorage.getItem('wowPath')

    if (!wowPath) return

    window.electronAPI.getCharacters(wowPath).then(setCharacters)
  }, [])

  const filteredCharacters = useMemo(() => {
    const search = filter.toLowerCase()

    return characters.filter(
      (character) =>
        character.account.toLowerCase().includes(search) ||
        character.realm.toLowerCase().includes(search) ||
        character.name.toLowerCase().includes(search)
    )
  }, [characters, filter])

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
              <th>Saved Instances</th>
              <th>Saved Dungeons</th>
              <th>Weekly Quest Completed</th>
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
                <td>{character.savedInstances}</td>
                <td>{character.savedDungeons}</td>
                <td>{character.weeklyQuestCompleted ? 'Yes' : 'No'}</td>
              </tr>
            ))}

            {filteredCharacters.length === 0 && (
              <tr>
                <td colSpan={6}>No characters found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
