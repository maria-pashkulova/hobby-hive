import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from '../contexts/authContext';
import Loading from '../components/Loading';

import * as groupService from '../services/groupService';
import * as categoryService from '../services/categoryService';
import * as locationService from '../services/locationService';

import CardsGrid from '../components/CardsGrid';
import { Button, Flex, FormControl, Input, Select, Text, useToast } from '@chakra-ui/react';
import useForm from '../hooks/useForm';



const FormKeys = {
    Name: 'name',
    Category: 'category',
    Location: 'location'
}


const GroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const { formValues, onChange, resetForm } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Category]: '',
        [FormKeys.Location]: ''
    });


    const [groups, setGroups] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingFilterGroups, setLoadingFilterGroups] = useState(false);
    const [loadingResetFilter, setLoadingResetFilter] = useState(false);

    const toast = useToast();

    useEffect(() => {
        Promise.all([
            categoryService.getCategories(),
            locationService.getLocations(),
            groupService.getAll()
        ])
            .then(([categories, locations, groups]) => {
                setCategoryOptions(categories);
                setLocationOptions(locations);
                setGroups(groups);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    //TODO: add some image or text so that the page wont be left empty (white screen)
                    toast({
                        title: "Възникна грешка!",
                        description: "Опитайте по-късно",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();


        //client side validation for at least one of the fields to be changed
        //to perform a request to the server - иначе ще е напразно и ще даде същия резултат
        //извеждащ всички групи тоест

        const hasFilter = Object.values(formValues).some(filterField => filterField !== '');
        if (!hasFilter) {
            toast({
                title: "Не сте приложили филтър",
                description: "Филтрирайте по име, категория или локация",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        //Perform a request to filter groups
        try {
            setLoadingFilterGroups(true);
            const filteredGroups = await groupService.getAll({
                name: formValues[FormKeys.Name],
                category: formValues[FormKeys.Category],
                location: formValues[FormKeys.Location]
            });

            setGroups(filteredGroups);

        } catch (error) {
            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                //TODO: add some image or text so that the page wont be left empty (white screen)
                toast({
                    title: "Възникна грешка!",
                    description: "Опитайте по-късно",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        } finally {
            setLoadingFilterGroups(false);
        }

    }

    const handleResetFilter = async () => {
        setLoadingResetFilter(true);
        try {
            const allGroups = await groupService.getAll()
            setGroups(allGroups);
            resetForm({
                [FormKeys.Name]: '',
                [FormKeys.Category]: '',
                [FormKeys.Location]: ''
            });
        } catch (error) {
            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                //TODO: add some image or text so that the page wont be left empty (white screen)
                toast({
                    title: "Възникна грешка!",
                    description: "Опитайте по-късно",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setLoadingResetFilter(false);
        }

    }

    return loading ?
        (<Loading />) :
        (
            <>
                <form onSubmit={handleFormSubmit}>
                    <Flex
                        mb={10}
                        gap={5}
                        direction={{ base: 'column', xl: 'row' }}
                        justifyContent='space-between'
                    >
                        <Flex
                            gap={3}
                            direction={{ base: 'column', lg: 'row' }}
                            flex="0 0 70%">
                            <FormControl>
                                <Input
                                    placeholder='Потърсете група...'
                                    name={[FormKeys.Name]}
                                    value={formValues[FormKeys.Name]}
                                    onChange={onChange}
                                />
                            </FormControl>
                            <FormControl>
                                <Select name={[FormKeys.Category]} value={formValues[FormKeys.Category]} onChange={onChange}>
                                    <option value=''>Всички категории</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <Select name={[FormKeys.Location]} value={formValues[FormKeys.Location]} onChange={onChange}>
                                    <option value=''>Всички локации</option>
                                    {locationOptions.map((option) => (
                                        <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </Flex>
                        <Flex justifyContent='center'>
                            <Button
                                type='submit'
                                mr={3}
                                colorScheme='blue'
                                isLoading={loadingFilterGroups}
                                loadingText='Приложи'
                            >
                                Приложи
                            </Button>

                            <Button
                                colorScheme='blue'
                                isLoading={loadingResetFilter}
                                loadingText='Изчисти'
                                onClick={handleResetFilter}
                            >
                                Изчисти
                            </Button>
                        </Flex>

                    </Flex>

                </form>
                {groups.length === 0
                    ? (<Text>Не бяха намерени групи</Text>)
                    : (<CardsGrid groups={groups} partialLinkToGroup='groups' />)}

            </>

        );



}

export default GroupsPage
