import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react"
import Loading from "./Loading";
import UserListItem from "./UserListItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import * as userService from '../services/userService';

const SearchUser = ({ mt, handleFunction }) => {

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const [loadingSearchedUsers, setLoadingSearchedUsers] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();


    const handleSearch = async (query) => {
        setSearch(query);

        //Make request when user has entered at least 3 characters 
        //(whitespace handling included)
        if (query.trim().length >= 3) {

            try {
                setLoadingSearchedUsers(true);

                const users = await userService.searchUser(query);
                setSearchResult(users);

            } catch (error) {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    console.log(error);
                    toast({
                        title: "Възникна грешка!",
                        description: "Не успяхме да изведем резултата от търсенето",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom-left",
                    });
                }

            } finally {
                setLoadingSearchedUsers(false);
            }
        } else if (query.trim() === '') {
            setSearchResult([]);
        }

    };

    return (
        <>
            <FormControl mt={mt}>
                <FormLabel>Добавяне на членове</FormLabel>
                <Input
                    placeholder='Потърсете потребители...'
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </FormControl>

            {/* render searched users */}
            {
                loadingSearchedUsers ? <Loading /> : (
                    searchResult?.map((user) => (
                        <UserListItem
                            key={user._id}
                            user={user}
                            handleFunction={() => handleFunction(user)}
                        />

                    ))
                )
            }
        </>
    )
}

export default SearchUser
