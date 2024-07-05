//TODO: use in create/update event
//use in create Group main location

import { Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, InputRightElement } from "@chakra-ui/react";
import LocationItem from "./LocationItem";
import { useState } from "react";

const OPENSTREET_MAP_BASE_URL = 'https://nominatim.openstreetmap.org/search?';

const SearchLocation = ({ handleSelectLocation }) => {

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const handleSearchLocation = () => {
        const params = {
            q: search,
            format: 'json'
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
                console.log(err);
            });
    };

    return (
        <>
            <FormControl my={4}>
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

            </FormControl >


            {/* render searched result locations */}
            {

                searchResult?.map((location) => (
                    <LocationItem
                        key={location.place_id}
                        name={location.display_name}
                        selectLocation={() => {
                            handleSelectLocation({
                                name: location.name,
                                coordinates: [Number(location.lat), Number(location.lon)]
                            });
                            setSearch(location.name);
                            setSearchResult([]);
                        }}
                    />
                ))
            }

        </>
    )
}

export default SearchLocation
