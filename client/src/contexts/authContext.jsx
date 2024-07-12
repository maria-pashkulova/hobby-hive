import { createContext, useEffect, useState } from "react";
import * as userService from '../services/userService';
import usePersistedState from "../hooks/usePersistedState";

import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

const AuthContext = createContext();

AuthContext.displayName = 'AuthContext';

//* контекста не се занимава с обработка на грешки,
//това се случва в самите компоненти
//handlers за login, register, logout, updateProfile са
//тук за да запаметят данни за потребителя в контекста


export const AuthProvider = ({ children }) => {

    //auth - данните върнати от сървъра след успешен логин
    const [auth, setAuth] = usePersistedState('user', {});
    const [socket, setSocket] = useState(null);


    useEffect(() => {

        //Create new socket connection only upon successful login/ register
        if (auth._id) {
            // Only create new socket connection if it doesn't exist 
            //this check is needed because of the dependency array
            if (!socket) {
                const newSocket = io(ENDPOINT);
                setSocket(newSocket);

                newSocket.emit('setup', auth._id);
                return () => {
                    newSocket.disconnect();
                }
            }

        } else if (socket) {
            socket.disconnect(); // Disconnect the socket if the user logs out
            setSocket(null);
        }
    }, [auth])


    //ВХОД:
    //await is needed in order to save user data in the context
    const loginSubmitHandler = async (userData) => {

        const result = await userService.login(userData);

        //разчитаме че сървъра връща обект с _id, fullName, email
        //можем да деструктурираме обекта за по-сигурно
        setAuth(result);

    }

    //Регистрация
    const registerSubmitHandler = async (userData) => {

        const result = await userService.register(userData);

        //разчитаме че сървъра връща обект с _id, fullName, email, profilePic
        //можем да деструктурираме обекта за по-сигурно
        setAuth(result);;
    }

    //logout + invalid or missing token handling (при изтичане на токена (бисквитката също в моя случай))
    const logoutHandler = () => {
        console.log('logout handler');
        setAuth(null);
    }


    //update profile
    const updateProfileSubmitHandler = async (userId, userData, newProfilePic, currProfilePic) => {
        const result = await userService.updateUser(userId, { ...userData, newProfilePic, currProfilePic }); //updated user data

        //разчитаме че сървъра връща обект с _id, fullName, email, profilePic
        //можем да деструктурираме обекта за по-сигурно
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

//за да използваме values от Provider-a в останалите компоненти трябва да 
//exportнем AuthContext
export default AuthContext;