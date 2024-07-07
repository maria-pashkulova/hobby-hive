import { useToast } from "@chakra-ui/react";
import { useState } from "react";


const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
const FILE_SIZE_LIMIT = 1048576; // 1 MB in binary



export default function usePreviewImage() {
    const [imageUrl, setImageUrl] = useState('');
    const toast = useToast();


    const showErrorMessage = (errorDescription) => {
        toast({
            title: "Невалиден файл",
            description: errorDescription,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        });

        if (imageUrl) {
            setImageUrl('');
        }

    }


    const handleImageChange = (e) => {

        //Get uploaded file
        const file = e.target.files[0];

        if (file) {

            const fileType = file.type;
            const fileExtension = file.name.split('.').pop();
            const fileSize = file.size; // in bytes


            //Validate image format
            if (!fileType.startsWith('image/')) {
                showErrorMessage("Моля, прикачете снимка!");
                return;
            }
            if (!SUPPORTED_FORMATS.includes(fileExtension)) {
                showErrorMessage("Позволени са изображения с формати: jpg, jpeg, png, svg, webp");
                return;
            }
            //Validate image size
            if (fileSize > FILE_SIZE_LIMIT) {
                showErrorMessage("Ограничението за размер на изображението е 1 MB");
                return;
            }

            //If uploaded image's format and size are valid
            const reader = new FileReader();

            //Takes the file the user uploaded and turns it into Base64
            reader.readAsDataURL(file);

            reader.onloadend = () => {
                setImageUrl(reader.result);
            }

            // Reset the file input to allow re-selection of the same valid image file
            e.target.value = null;
        }

    }


    const handleImageDecline = () => {
        setImageUrl('');
    }

    return {
        handleImageChange,
        handleImageDecline,
        imageUrl
    }
}

