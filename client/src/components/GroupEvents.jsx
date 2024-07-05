import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';
import { Box, Button, Container, useDisclosure } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import CreateEventModal from './CreateEventModal';
import EventCard from './EventCard';

import formatDateInTimeZone from '../lib/formatDate';

const GroupEvents = () => {

    const navigate = useNavigate();
    const [groupId, isMember, activityTags] = useOutletContext();
    const { logoutHandler } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [groupEvents, setGroupEvents] = useState([]);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        eventService.getGroupEvents(groupId)
            .then(setGroupEvents)
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }
            });

    }, []);

    //може би тази заявка трябва да се изпълни чак след като се намери успешно група
    //ако това е възможно изобщо да хвърли грешка, то ще се хване от catch?
    return (
        <Box>
            {isMember && (<Button
                position='fixed'
                bottom={10}
                right={4}
                d='flex'
                size={{ base: 'sm', sm: 'md' }}
                leftIcon={<FiPlus />}
                onClick={onOpen}
                zIndex={1}
            >
                Ново събитие
            </Button>)
            }

            {
                isOpen && <CreateEventModal
                    isOpen={isOpen}
                    onClose={onClose}
                    groupId={groupId}
                    activityTags={activityTags}
                />
            }

            <Container maxW='80vw' mt={5}>
                {
                    groupEvents.length > 0 ?

                        (groupEvents.map(event => (
                            <EventCard
                                key={event._id}
                                name={event.name}
                                description={event.description}
                                specificLocation={event.specificLocation.name}
                                time={formatDateInTimeZone(event.time, timeZone)}
                                activityTags={event.activityTags}
                            />))
                        )

                        : (<p>Все още няма събития в групата</p>)

                }

            </Container>
        </Box>
    )
}

export default GroupEvents
