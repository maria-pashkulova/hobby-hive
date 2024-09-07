import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from '../contexts/authContext';

import * as groupService from '../services/groupService';

import CardsGrid from '../components/groups/CardsGrid';
import { Box, Button, Flex, FormControl, Input, Select, Spinner, Text, useToast } from '@chakra-ui/react';
import useForm from '../hooks/useForm';

import { GroupKeys } from '../formKeys/formKeys';


import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import useFetchCategoriesAndLocations from '../hooks/useFetchCategoriesAndLocations';


const GROUPS_PER_PAGE = 6;


const GroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const { formValues, onChange, resetForm } = useForm({
        [GroupKeys.Name]: '',
        [GroupKeys.Category]: '',
        [GroupKeys.Location]: ''
    });
    const [groups, setGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pagesCount, setPagesCount] = useState(0);
    const [appliedFilters, setAppliedFilters] = useState({
        name: '',
        category: '',
        location: ''
    });


    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingFilterGroups, setLoadingFilterGroups] = useState(false);
    const [loadingResetFilter, setLoadingResetFilter] = useState(false);


    const toast = useToast();



    //FILTER AND GROUPS RELATED 

    //Fetch static data (categories and location) on initial mount
    const { categoryOptions, locationOptions } = useFetchCategoriesAndLocations();


    //Fetch paginated groups when current page changes
    //while taking applied filters into consideration
    useEffect(() => {

        const { name, category, location } = appliedFilters;

        if (!isInitialLoading) {
            setIsLoading(true);
        }

        groupService.getAll({
            name,
            category,
            location,
            page: currentPage,
            limit: GROUPS_PER_PAGE
        })

            .then(({ groups, totalPages }) => {
                setGroups(groups);
                setPagesCount(totalPages);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler();
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
                //check for state's current value to avoid unnecessary state updates
                //which will result in re-renders;

                if (!isInitialLoading) {
                    //if isInitialLoading is false, we have changed page or applied filters
                    setIsLoading(false);
                }

                if (isInitialLoading) {
                    setIsInitialLoading(false);
                }

                if (loadingFilterGroups) {
                    setLoadingFilterGroups(false);
                }
                if (loadingResetFilter) {
                    setLoadingResetFilter(false);
                }
            });

    }, [currentPage, appliedFilters]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        //check if objects are different references
        if (appliedFilters !== formValues) {
            setLoadingFilterGroups(true);
            //Trigger useEffect()
            setAppliedFilters(formValues);
            setCurrentPage(0);
        }

    }

    const handleResetFilter = async () => {

        //if formValues has values different from '', reset formValues state
        const hasFormValuesChanged = Object.values(formValues).some(filterField => filterField !== '');
        if (hasFormValuesChanged) {
            resetForm({
                [GroupKeys.Name]: '',
                [GroupKeys.Category]: '',
                [GroupKeys.Location]: ''
            });
        }

        //if appliedFilters has values different from '', reset appliedFilters state
        const hasFilterApplied = Object.values(appliedFilters).some(filterField => filterField !== '');
        if (hasFilterApplied) {
            setLoadingResetFilter(true);
            setAppliedFilters({ name: '', category: '', location: '' }); //reset applied filters state
            setCurrentPage(0);
        }

    }


    //PAGINATION RELATED
    const handleCurrentPageChange = (currPage) => {
        setCurrentPage(currPage);
    }


    return isInitialLoading ?
        (<Flex justifyContent={'center'}>
            <Spinner size='xl' />
        </Flex>) :
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
                                    name={[GroupKeys.Name]}
                                    value={formValues[GroupKeys.Name]}
                                    onChange={onChange}
                                />
                            </FormControl>
                            <FormControl>
                                <Select name={[GroupKeys.Category]} value={formValues[GroupKeys.Category]} onChange={onChange}>
                                    <option value=''>Всички категории</option>
                                    {categoryOptions.map((option) => (
                                        <option key={option._id} value={option._id}>{option.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <Select name={[GroupKeys.Location]} value={formValues[GroupKeys.Location]} onChange={onChange}>
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
                                isDisabled={loadingFilterGroups}
                            >
                                Приложи
                            </Button>

                            <Button
                                colorScheme='blue'
                                isDisabled={loadingResetFilter}
                                onClick={handleResetFilter}
                            >
                                Изчисти
                            </Button>
                        </Flex>

                    </Flex>

                </form>

                {isLoading ?
                    (<Loading />) :
                    (
                        <>
                            {groups.length === 0
                                ? (<Text>Не бяха намерени групи, отговарящи на зададените критерии</Text>)
                                : (<CardsGrid groups={groups} partialLinkToGroup='groups' />)}

                            {pagesCount > 1 && (
                                <Box
                                    position='sticky'
                                    top='100%'
                                >
                                    <Pagination
                                        pagesCount={pagesCount}
                                        currentPage={currentPage}
                                        handleCurrentPageChange={handleCurrentPageChange}
                                    />
                                </Box>)
                            }
                        </>
                    )}


            </>

        );

}

export default GroupsPage
