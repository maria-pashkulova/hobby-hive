import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const CreateTagsInput = ({ handleSetNewTags }) => {
    const [tagInputValue, setTagInputValue] = useState(''); //for user input
    const [tagValues, setTagValues] = useState([]); // for all created tags

    const createOption = (label) => ({
        label,
        value: label
    })

    // handle the creation of new tags when the user presses the "Enter" key.
    const handleKeyDown = (event) => {
        // Check if there's no input value;
        if (!tagInputValue) return;

        // Check if the 'Enter' key is pressed.
        if (event.key === 'Enter') {
            //prevent submitting the form for creating a group
            event.preventDefault();

            //prevent adding tag with the same value; case insensitive
            const tagExists = tagValues.find(tag => tag.value.toLowerCase() === tagInputValue.toLowerCase());
            if (tagExists) {
                // If the tag exists, clear the input value and return early to prevent duplicate tags.
                setTagInputValue('');
                return;
            }

            // Create a new tag using the input value.
            const newTag = createOption(tagInputValue);

            // Add the new tag to the existing tagValues array.
            const newTagValues = [...tagValues, newTag]; // guarantee access to the newTags so we ca update local tagValues state and parent component's state also!

            // Update the local state with the new array of tags.
            setTagValues(newTagValues);
            setTagInputValue('');

            //Update state in CreateGroupModal parent component
            handleSetNewTags(newTagValues);

        }

    }

    //Handle user interaction with CreatableSelect comonent - selecting (not in this case but in general), creating or removing tags
    //newTagValues holds all selected values or is empty array if there are no selected values
    const handleTagsChange = (newTagValues) => {

        setTagValues(newTagValues);
        handleSetNewTags(newTagValues);
    }

    return (
        <CreatableSelect
            isClearable
            isMulti
            components={
                { DropdownIndicator: null }
            }
            menuIsOpen={false}
            value={tagValues}
            onChange={handleTagsChange}
            inputValue={tagInputValue}
            onInputChange={(newTagInputValue) => setTagInputValue(newTagInputValue)}
            onKeyDown={handleKeyDown}
            placeholder="Създайте тагове за груповите дейности"
        >

        </CreatableSelect>
    )
}

export default CreateTagsInput
