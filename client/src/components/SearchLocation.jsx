//TODO: use in update event

import { Button, FormControl, FormErrorMessage, FormLabel, Input, InputGroup } from "@chakra-ui/react";
import LocationItem from "./LocationItem";
import { useState } from "react";
import { useFormikContext } from "formik";
import { EventKeys } from "../formKeys/formKeys";

const OPENSTREET_MAP_BASE_URL = 'https://nominatim.openstreetmap.org/search?';

const SearchLocation = () => {

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const { setFieldValue, errors, touched } = useFormikContext();

    //If search input field is empty, hide results from OpenStreet map API if any
    if (search === '') {
        if (searchResult.length > 0) {
            setSearchResult([]);
        }
    }

    const handleSearchLocation = () => {
        const params = {
            q: search,
            format: 'json',
            addressdetails: 1
        };

        const queryString = new URLSearchParams(params).toString();
        const requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        fetch(`${OPENSTREET_MAP_BASE_URL}${queryString}`, requestOptions)
            .then(response => response.json())
            .then(specificLocations => {
                setSearchResult(specificLocations);
            })
            .catch((err) => {
                //todo toast
                console.log(err);
            });
    };

    //Form's filed specificLocation is set only if user selects an option from Openstreet map results
    const handleSelectLocation = (location) => {
        const locationName = `${location.name}, ${location.address.city || location.address.municipality || location.address.county || location.address.town || ''}`;

        setFieldValue(EventKeys.SpecificLocation, {
            name: locationName,
            coordinates: [Number(location.lat), Number(location.lon)]
        });

        setSearch(locationName);
        setSearchResult([]);
    }

    return (
        <>
            <FormControl my={4} isInvalid={errors[EventKeys.SpecificLocation] && touched[EventKeys.SpecificLocation]}>
                <FormLabel>Потърси локация</FormLabel>
                <InputGroup>
                    <Input
                        placeholder='Потърси локация...'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                        }}
                    />
                    <Button
                        colorScheme='blue'
                        onClick={handleSearchLocation}
                    >
                        Търсене
                    </Button>

                </InputGroup>

                <FormErrorMessage>
                    {errors[EventKeys.SpecificLocation]}
                </FormErrorMessage>

            </FormControl >


            {/* render searched result locations */}
            {
                searchResult.map((location) => (
                    <LocationItem
                        key={location.place_id}
                        name={location.display_name}
                        selectLocation={() => { handleSelectLocation(location) }}
                    />
                ))

            }

        </>
    )
}

export default SearchLocation
