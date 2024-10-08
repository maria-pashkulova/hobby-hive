import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, Text, useToast, Box } from "@chakra-ui/react";
import LocationItem from "./LocationItem";
import { useState } from "react";
import { useFormikContext } from "formik";
import { EventKeys } from "../../formKeys/formKeys";
import { getLocationData } from '../../utils/getLocationData';
import checkIsObjectEmpty from "../../utils/checkIsObjectEmpty";

const OPENSTREET_MAP_BASE_URL = 'https://nominatim.openstreetmap.org/search?';

const SearchLocation = ({ initialEventLocationName }) => {

    const [search, setSearch] = useState(initialEventLocationName);
    const [searchResult, setSearchResult] = useState([]);
    const [showNoResults, setShowNoResults] = useState(false);
    const [requiredSearchValueErr, setRequiredSearchValueErr] = useState(false);
    const [loadingSearchOpenstreetApi, setLoadingSearchOpenstreetApi] = useState(false);
    const toast = useToast();

    const { values, setFieldValue, errors } = useFormikContext();


    const handleSearchLocation = () => {
        //do not perform request if there is no search value
        if (search === '') {
            setRequiredSearchValueErr(true);
            return;
        }
        const params = {
            q: search,
            format: 'json',
            addressdetails: 1,
            countrycodes: 'bg' //get results only in Bulgaria
        };
        const queryString = new URLSearchParams(params).toString();
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        setLoadingSearchOpenstreetApi(true);

        fetch(`${OPENSTREET_MAP_BASE_URL}${queryString}`, requestOptions)
            .then(response => response.json())
            .then(specificLocations => {
                setSearchResult(specificLocations);
                if (specificLocations.length === 0) {
                    setShowNoResults(true);
                }
            })
            .catch((err) => {
                //Case: problem on fetching data from Openstreet map API
                toast({
                    title: 'Възникна грешка!',
                    description: 'Потърсете локация отново',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                })
            })
            .finally(() => {
                setLoadingSearchOpenstreetApi(false);
            })
    };

    //Form's field specificLocation is set only if user selects an option from Openstreet map results
    const handleSelectLocation = (location) => {
        const locationData = getLocationData(location);

        setFieldValue(EventKeys.SpecificLocation, {
            name: locationData,
            locationRegionCity: location.address.state, //used for FE valion with Yup
            coordinates: [Number(location.lat), Number(location.lon)]
        });

        setSearch(locationData);
        setSearchResult([]);
    }

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (requiredSearchValueErr) {
            setRequiredSearchValueErr(false);
        }

        if (showNoResults) {
            setShowNoResults(false);
        }


        if (value === '') {

            //reset specificLocation only if it is not an empty object (a user has selected location, not just typing and deleting chars)
            if (!checkIsObjectEmpty(values[EventKeys.SpecificLocation])) {
                setFieldValue(EventKeys.SpecificLocation, {}); // Reset specificLocation field when search input is cleared
            }

            //If search input field is empty, hide results from OpenStreet map API IF ANY
            if (searchResult.length > 0) {
                setSearchResult([]);
            }
        }
    };

    return (
        <>
            <FormControl my={4} isInvalid={errors[EventKeys.SpecificLocation] || requiredSearchValueErr}>
                <FormLabel>Потърсете и изберете локация</FormLabel>
                <FormHelperText mb={4} color={'teal.600'}>
                    <Text>
                        {initialEventLocationName
                            ? '* Ако не изберете локация, събитието ще бъде запазено без зададена локация или с предходната локация, ако е била зададена такава.'
                            : '* Ако не изберете локация, събитието ще бъде запазено без зададена локация.'
                        }
                    </Text>
                    <Text mt={1}>* В случай че не намирате желаната от Вас локация, можете да дадете детайли за нея в описанието на събитието.</Text>
                </FormHelperText>
                <InputGroup>

                    <Input
                        placeholder='Потърси локация...'
                        value={search}
                        onChange={handleSearchChange}
                    />
                    <Button
                        colorScheme='blue'
                        isLoading={loadingSearchOpenstreetApi}
                        loadingText='Търсене...'
                        onClick={handleSearchLocation}
                    >
                        Търсене
                    </Button>

                </InputGroup>

                {requiredSearchValueErr && <FormErrorMessage>Въведете локация за търсене</FormErrorMessage>}
                <FormErrorMessage>
                    {errors[EventKeys.SpecificLocation]}
                </FormErrorMessage>
            </FormControl >


            {/* render searched result locations */}
            {
                searchResult.length > 0 && searchResult.map((location) => (
                    <LocationItem
                        key={location.place_id}
                        location={location}
                        selectLocation={() => { handleSelectLocation(location) }}
                    />
                ))

            }

            {/* render no locations found message */}
            {
                showNoResults && <Box
                    backgroundColor={'gray.100'}
                    p={2}
                    borderRadius={6}
                >
                    <Text color={'gray.700'}>Не бяха намерени резултати от търсенето. Проверете валидността на търсената локация или опитайте с по-детайлно търсене!</Text>
                </Box>

            }

        </>
    )
}

export default SearchLocation
