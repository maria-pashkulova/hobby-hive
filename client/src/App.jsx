import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import HomePage from './components/Home/HomePage';
import GroupsPage from './components/GroupsPage';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/groups' element={<GroupsPage />} />
      </Routes>

    </>
  )
}

export default App
