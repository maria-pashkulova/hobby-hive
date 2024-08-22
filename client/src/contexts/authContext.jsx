import { createContext, useEffect, useState } from "react";

import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

import * as userService from '../services/userService';
import usePersistedState from "../hooks/usePersistedState";

const AuthContext = createContext();
AuthContext.displayName = 'AuthContext';


/* Error handling for asynchronous API calls in 
-loginSubmitHandler
-registerSubmitHandler
-updateProfileSubmitHandler
-logoutSubmitHandler
is placed in the respective components using these handlers.
These handlers are defined here so they can set the auth state with
the user data fetched and update the context values
*/

export const AuthProvider = ({ children }) => {

    /*auth value : 
    -  user data after successful login, register, user update.
    The server responds with object in format {_id: ..., fullName:..., email: ..., profilePic:...}
    - null (when user logs out)
    */
    const [auth, setAuth] = usePersistedState('user', {});
    //socket connection object for real-time communication
    const [socket, setSocket] = useState(null);


    useEffect(() => {

        //Create new socket connection only upon successful login/ register
        if (auth._id) {

            //Initialize new socket connection
            const newSocket = io(ENDPOINT);

            newSocket.on('connect', () => {
                //when connection is fully established, 
                //set 'socket' state to the socket connection object (newSocket)
                console.log('New socket connection established. Socket Id: ' + newSocket.id);
                setSocket(newSocket);

                newSocket.emit('setup', auth._id);

            })

            return () => {
                console.log('Cleanup function for socket disconnection');
                newSocket.disconnect();
            }
        }

    }, [auth._id])



    const loginSubmitHandler = async (userData) => {

        //await is needed in order to save user data in the context
        const result = await userService.login(userData);

        setAuth(result);

    }

    //Регистрация
    const registerSubmitHandler = async (userData) => {

        const result = await userService.register(userData);

        setAuth(result);;
    }

    //logout + invalid or missing token handling (token and cookie expiration)
    const logoutHandler = () => {
        console.log('logout handler');

        //Clear user data from local storage, because it was persited
        //the actual auth state value is {} , set in usePersistedState
        setAuth(null);
    }


    //update profile
    const updateProfileSubmitHandler = async (userId, userData, newProfilePic, currProfilePic) => {
        const result = await userService.updateUser(userId, { ...userData, newProfilePic, currProfilePic }); //updated user data

        setAuth(result);

        return result;

    }

    const values = {
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        updateProfileSubmitHandler,
        userId: auth._id,
        fullName: auth.fullName,
        email: auth.email,
        profilePic: auth.profilePic,
        isAuthenticated: !!auth._id,
        socket
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    )
}

/*In order to use values from AuthContext.Provider in the nested child components of AuthProvider
export of AuthContext object is needed, so it can be used as useContext()'s argument
*/
export default AuthContext;