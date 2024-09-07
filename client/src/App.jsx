import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CLIENT_ID } from './constants/google-calendar.js';

import './App.css'

import GuestLayout from './layouts/GuestLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRouteMembers from './layouts/ProtectedRouteMembers';
import ProtectedRouteAdmin from './layouts/ProtectedRouteAdmin';

import UpdateProfilePage from './pages/UpdateProfilePage';
import GroupsPage from './pages/GroupsPage';
import MyGroupsPage from './pages/MyGroupsPage';
import MyCalendarPage from './pages/MyCalendarPage';
import SingleGroupPage from './pages/SingleGroupPage';
import NotFoundPage from './pages/NotFoundPage.jsx';

import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import Logout from './components/authentication/Logout';

import GroupPosts from './components/group-posts/GroupPosts.jsx';
import MyGroupPosts from './components/group-posts/MyGroupPosts.jsx';
import GroupEvents from './components/group-events/GroupEvents.jsx';
import GroupEventChangeRequests from './components/group-event-change-requests/GroupEventChangeRequests.jsx';
import GroupChat from './components/group-chat/GroupChat';


function App() {

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
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
      </GoogleOAuthProvider>
    </AuthProvider>
  )
}

export default App
