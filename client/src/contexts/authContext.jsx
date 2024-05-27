import { createContext, useState, useEffect } from "react";
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

import * as authService from '../services/authService';



const AuthContext = createContext();

AuthContext.displayName = 'AuthContext';

export const AuthProvider = ({ children }) => {

    const navigate = useNavigate();
    const toast = useToast();

    //auth - данните върнати от сървъра след успешен логин
    const [auth, setAuth] = useState({});

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
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(error.message);
        }
    }

    //Изход
    const logoutHandler = () => {
        setAuth({});
    }

    const values = {
        loginSubmitHandler,
        registerSubmitHandler,
        logoutHandler,
        userId: auth.userId,
        fullName: auth.fullName,
        email: auth.email
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