import { useToast } from "@chakra-ui/react";
import { useState } from "react";


export default function usePreviewImage() {
    const [imageUrl, setImageUrl] = useState('');
    const toast = useToast();


    const handleImageChange = (e) => {
        //it returns an array!
        const file = e.target.files[0];

        if (!file) {
            toast({
                title: "Не прикачихте файл",
                description: "Запазва се текущата Ви профилна снимка",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setImageUrl('');
        } else if (file && file.type.startsWith('image/')) {
            //file reader

            const reader = new FileReader();

            reader.onloadend = () => {
                setImageUrl(reader.result);
            }

            //takes the file the user uploaded and turns it into 
            //Base64
            reader.readAsDataURL(file);

        } else {
            toast({
                title: "Невалиден тип файл",
                description: "Моля, прикачете изображение ",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setImageUrl('');
        }
    }

    return {
        handleImageChange,
        imageUrl
    }
}