import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';

import './App.css'

import GuestLayout from './layouts/GuestLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRouteMembers from './components/protected-route/ProtectedRouteMembers.jsx';
import ProtectedRouteAdmin from './components/protected-route/ProtectedRouteAdmin.jsx';

import GroupsPage from './pages/GroupsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import MyCalendarPage from './pages/MyCalendarPage';
import SingleGroupPage from './pages/SingleGroupPage';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Logout from './components/Logout';
import GroupEvents from './components/GroupEvents.jsx';
import GroupEventChangeRequests from './components/GroupEventChangeRequests';
import GroupPosts from './components/GroupPosts.jsx';
import UpdateProfilePage from './pages/UpdateProfilePage.jsx';
import MyGroupPosts from './components/MyGroupPosts.jsx';
import GroupChat from './components/group-chat/GroupChat.jsx';
import NotFoundPage from './components/NotFoundPage.jsx';


function App() {

  return (
    <AuthProvider>
      <div className='App'>
        <Routes>
          {/* initial default path is /, AuthLayout is rendered and user is redirected to GuestLayout */}
          <Route element={<AuthLayout />}>
            <Route path='/' element={<GroupsPage />} />
            <Route path='/my-groups' element={<MyGroupsPage />} />
            <Route path='/my-calendar' element={<MyCalendarPage />} />
            <Route path='/update-profile' element={<UpdateProfilePage />} />
            <Route path='/groups/:groupId' element={<SingleGroupPage />} >
              <Route index element={<GroupPosts />} />
              <Route element={<ProtectedRouteMembers />}>
                <Route path='my-posts' element={<MyGroupPosts />} />
                <Route path='events' element={<GroupEvents />} />
                <Route path='chat' element={<GroupChat />} />
              </Route>
              <Route element={<ProtectedRouteAdmin />}>
                <Route path='event-change-requests' element={<GroupEventChangeRequests />} />
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
