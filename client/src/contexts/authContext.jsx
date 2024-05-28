import { createContext } from "react";
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

import * as authService from '../services/authService';
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
            const result = await authService.login(userData);

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
            const result = await authService.register(userData);

            //разчитаме че сървъра връща обект с _id, fullName, email
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


    const values = {
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        userId: auth._id,
        fullName: auth.fullName,
        email: auth.email,
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