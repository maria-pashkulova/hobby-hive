import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';


import * as locationService from '../services/locationService';
import * as categoryService from '../services/categoryService';
import AuthContext from '../contexts/authContext';

export default function useFetchCategoriesAndLocations(resetForm, onClose, isResetNeeded) {
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

                //Reset is needed only for Create group modal
                //Not needed for update group modal -> pre-populated data from state
                //Not needed for Groups page -> '' -> Всички категории / локации (default)
                if (isResetNeeded) {
                    resetForm({
                        'category': categories[0]?._id, // optional chaining -> handle case where categories might be empty
                        'location': locations[0]?._id // optional chaining ->  handle case where locations might be empty
                    });
                }


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

                    onClose();
                }
            })
            .finally(() => {
                setLoadingCategoriesAndLocations(false);
            })
    }, []);

    return { categoryOptions, locationOptions, loadingCategoriesAndLocations };
}