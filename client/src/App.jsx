import { useState } from 'react'

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';

import './App.css'

import GuestLayout from './layouts/GuestLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRouteMembers from './components/protected-route/ProtectedRouteMembers.jsx';

import GroupsPage from './pages/GroupsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import SingleGroupPage from './pages/SingleGroupPage';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Logout from './components/Logout';

import GroupEvents from './components/GroupEvents.jsx';
import GroupPosts from './components/GroupPosts.jsx';
import UpdateProfilePage from './pages/UpdateProfilePage.jsx';
import MyGroupPosts from './components/MyGroupPosts.jsx';
import GroupChat from './components/group-chat/GroupChat.jsx';
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
            <Route path='/update-profile' element={<UpdateProfilePage />} />
            <Route path='/groups/:groupId' element={<SingleGroupPage />} >
              <Route index element={<GroupPosts />} />
              <Route path='my-posts' element={<MyGroupPosts />} />
              <Route element={<ProtectedRouteMembers />}>
                <Route path='events' element={<GroupEvents />} />
                <Route path='chat' element={<GroupChat />} />
              </Route>
            </Route>
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
