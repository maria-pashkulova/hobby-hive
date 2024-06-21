import { createContext } from "react";
import * as userService from '../services/userService';
import usePersistedState from "../hooks/usePersistedState";



const AuthContext = createContext();

AuthContext.displayName = 'AuthContext';

//* контекста не се занимава с обработка на грешки,
//това се случва в самите компоненти
//handlers за login, register, logout, updateProfile са
//тук за да запаметят данни за потребителя в контекста


export const AuthProvider = ({ children }) => {

    //auth - данните върнати от сървъра след успешен логин
    const [auth, setAuth] = usePersistedState('user', {});

    //Вариант да не пазя токена в localStorage, а само в бисквитка
    // => не ми се налага да изнасям токена в localStorage, за да го пратя с request-a
    //той просто се изпраща заради  credentials:include


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
        setAuth(result);
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