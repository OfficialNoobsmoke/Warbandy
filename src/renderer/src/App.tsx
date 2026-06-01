import { useNavigate } from 'react-router-dom'

function App(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <>
      <button onClick={() => navigate('/charactersPage')}>Characters Page</button>
      <button onClick={() => navigate('/gameSettingsPage')}>Go To Game Settings Page</button>
      <button onClick={() => navigate('/applicationSettingsPage')}>
        Go To Application Settings Page
      </button>
    </>
  )
}

export default App
