import { createContext } from "react";
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

import * as userService from '../services/userService';
import usePersistedState from "../hooks/usePersistedState";



const AuthContext = createContext();

AuthContext.displayName = 'AuthContext';

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();
    const toast = useToast();



    //auth - данните върнати от сървъра след успешен логин
    const [auth, setAuth] = usePersistedState('user', {});

    //Вариант да не пазя токена в localStorage, а само в бисквитка
    // => не ми се налага да изнасям токена в localStorage, за да го пратя с request-a
    //той просто се изпраща заради  credentials:include


    //ВХОД:
    const loginSubmitHandler = async (userData) => {

        try {
            const result = await userService.login(userData);

            toast({
                title: "Успешно вписване!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            //разчитаме че сървъра връща обект с _id, fullName, email
            //можем да деструктурираме обекта за по-сигурно
            setAuth(result);
            navigate('/')

        } catch (error) {
            console.log(error.message);
        }

    }

    //Регистрация
    const registerSubmitHandler = async (userData) => {

        try {
            const result = await userService.register(userData);

            //разчитаме че сървъра връща обект с _id, fullName, email, profilePic
            //можем да деструктурираме обекта за по-сигурно
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(error.message);
        }
    }

    //logout + invalid or missing token handling (при изтичане на токена (бисквитката също в моя случай))
    const logoutHandler = () => {
        console.log('logout handler');
        setAuth(null);
    }


    //update profile
    const updateProfileSubmitHandler = async (userId, userData, profilePic) => {
        try {
            const result = await userService.updateUser(userId, { ...userData, profilePic });

            //разчитаме че сървъра връща обект с _id, fullName, email, profilePic
            //можем да деструктурираме обекта за по-сигурно
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(error.message);
        }
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
        isAuthenticated: !!auth._id
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