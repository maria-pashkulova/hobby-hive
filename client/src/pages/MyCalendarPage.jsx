import { Box, Button, Heading, Text, Tooltip, useToast } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc';
import React from 'react'
import MyCalendar from '../components/MyCalendar'
import { useGoogleLogin } from '@react-oauth/google';
import { sendAuthorizationCode } from '../services/googleCalendarService';
import { SCOPE, FLOW } from '../constants/google-calendar';
import { useNavigate } from 'react-router-dom';


const MyCalendarPage = () => {

    const toast = useToast();
    const navigate = useNavigate();

    //Send an authentication request to Google
    //onSuccess/onError/onNonOauthError for handling errors from the consent
    const googleLoginAndAuthorization = useGoogleLogin({
        scope: SCOPE,
        flow: FLOW,
        onSuccess: async (codeResponse) => {

            //Examine scopes of access granted by the user
            //Check if user has granted access to his own Google calendar(s)
            if (!codeResponse.scope.includes('https://www.googleapis.com/auth/calendar.events.owned')) {

                toast({
                    title: 'Изисква се позволение за достъп до Вашия Гугъл календар! Пропуснали сте тази стъпка. Опитайте отново!',
                    status: 'info',
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                return;
            }

            //Send server the authorization code to obtain access and refresh token and store it securely
            //only if the scopes are confirmed by the user
            //Handle possible errors
            try {

                const googleAuthorizationResponse = await sendAuthorizationCode(codeResponse.code);

                toast({
                    title: googleAuthorizationResponse.message,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });

            } catch (error) {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing authentication token 
                    navigate('/login');
                } else if (error.error === 'invalid_grant') {
                    //Handle invalid or expired authorization code case
                    toast({
                        title: 'Възникна грешка',
                        description: 'Повторете стъпките за позволение на достъпа до календара Ви!',
                        status: "error",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    });
                } else {
                    //Handle other possible errors 
                    console.log(error);

                }
            }

        },
        onError: (errorResponse) => {
            toast({
                title: 'Не предоставихте необходимото позволение за достъп до Вашия Гугъл календар! Няма да може да добавяте събития от Хоби Кошер към него.',
                status: "warning",
                duration: 10000,
                isClosable: true,
                position: "bottom",
            });
        },
        onNonOAuthError: (errorResponse) => {
            toast({
                title: 'Опитайте отново!',
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        }

    });



    return (
        <>
            <Heading my='6' size='lg'>Събития, за които сте отбелязали присъствие</Heading>
            {/* Google */}

            <Box maxW={'60vw'}>
                <Tooltip label='Добави / Презапиши в Гугъл календар' placement='bottom-end'>
                    <Button maxW='full' variant={'outline'} leftIcon={<FcGoogle />} onClick={googleLoginAndAuthorization}>
                        <Text display={{ base: 'none', md: 'inline-block' }}>Позволи достъп до Google календар</Text>
                    </Button>
                </Tooltip>
            </Box>


            <MyCalendar />
        </>
    )
}

export default MyCalendarPage
