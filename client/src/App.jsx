import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import StartPage from './pages/StartPage';
import GroupsPage from './pages/GroupsPage';
import LoggedInLayout from './layouts/LoggedInLayout';
import MyGroupsPage from './pages/MyGroupsPage';
import SingleGroupPage from './pages/SingleGroupPage';
import Logout from './components/Logout';



function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<LoggedInLayout />}>
          <Route path='/' element={<GroupsPage />} />
          <Route path='/my-groups' element={<MyGroupsPage />} />
          <Route path='/groups/:groupId' element={<SingleGroupPage />} />
        </Route >
        <Route path='/notLogged' element={<StartPage />} />
        <Route path={'/logout'} element={<Logout />} />
      </Routes >

    </div>
  )
}

export default App
