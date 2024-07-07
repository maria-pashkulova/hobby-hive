import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';


import * as locationService from '../services/locationService';
import * as categoryService from '../services/categoryService';
import AuthContext from '../contexts/authContext';

export default function useFetchCategoriesAndLocations(onClose = () => { }) {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [loadingCategoriesAndLocations, setLoadingCategoriesAndLocations] = useState(true);

    const toast = useToast();
    const navigate = useNavigate();

    const { logoutHandler } = useContext(AuthContext);

    //executed on component mount (for each component using this hook)
    useEffect(() => {

        Promise.all([
            categoryService.getCategories(),
            locationService.getLocations()
        ])
            .then(([categories, locations]) => {

                setCategoryOptions(categories);
                setLocationOptions(locations);

            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else {
                    //case изключвам си сървъра - грешка при свързването със сървъра
                    toast({
                        title: 'Възникна грешка при свързване!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });

                    //for create group and update group modals
                    onClose();
                }
            })
            .finally(() => {
                setLoadingCategoriesAndLocations(false);
            })
    }, []);

    return { categoryOptions, locationOptions, loadingCategoriesAndLocations };
}