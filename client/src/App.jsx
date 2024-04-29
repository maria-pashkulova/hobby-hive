import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import StartPage from './pages/StartPage';
import GroupsPage from './pages/GroupsPage';
import LoggedInLayout from './layouts/LoggedInLayout';



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/' element={<LoggedInLayout />}>
          <Route path='/' element={<GroupsPage />} />
        </Route >
        <Route path='/notLogged' element={<StartPage />} />
      </Routes >

    </>
  )
}

export default App
