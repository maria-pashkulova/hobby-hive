import { useState } from "react";



export default function usePersistedState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const persistedState = localStorage.getItem(key);
        //от localStorage четем единствено и само при презареждане на application-а (mount)

        if (persistedState) {
            return JSON.parse(persistedState); //default value == persistedState
        }

        return defaultValue;
    });

    //performance hit - при промяна в state тр да се запази и в localStorage
    //което изисква първо stringify на стойността, която искаме да променяме
    const setPersistedState = (value) => {

        if (!value) {
            localStorage.removeItem(key);
            setState({});
        }
        else {
            const serializedValue = JSON.stringify(value);

            //всеки update направен чрез setPersistedState ще update-ва localStorage,
            //освен вътрешния state; синхронизация
            localStorage.setItem(key, serializedValue);
            setState(value);
        }


    };

    return [
        state,
        setPersistedState
    ]
};
