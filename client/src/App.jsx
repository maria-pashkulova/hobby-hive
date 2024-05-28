import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import GuestLayout from './layouts/GuestLayout.jsx';
import GroupsPage from './pages/GroupsPage';
import AuthLayout from './layouts/AuthLayout.jsx';
import MyGroupsPage from './pages/MyGroupsPage';
import SingleGroupPage from './pages/SingleGroupPage';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Logout from './components/Logout';

import { AuthProvider } from './contexts/authContext.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';




function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <div className='App'>
        <Routes>
          {/* път / води към AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path='/' element={<GroupsPage />} />
            <Route path='/my-groups' element={<MyGroupsPage />} />
            <Route path='/groups/:groupId' element={<SingleGroupPage />} />
            <Route path={'/logout'} element={<Logout />} />
          </Route >
          <Route element={<GuestLayout />}>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
          </Route>
          <Route path='*' element={<NotFoundPage />} />
        </Routes >

      </div>

    </AuthProvider>
  )
}

export default App
