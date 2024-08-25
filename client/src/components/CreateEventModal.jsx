import EventModal from "./EventModal";


const CreateEventModal = ({ isOpen, onClose, groupId, groupRegionCity, groupActivityTags, selectedDate, handleAddNewEvent, existingEvents }) => {

    return (
        <EventModal
            isOpen={isOpen}
            onClose={onClose}
            groupId={groupId}
            groupRegionCity={groupRegionCity}
            groupActivityTags={groupActivityTags}
            selectedDate={selectedDate}
            handleEventsChange={handleAddNewEvent}
            existingEvents={existingEvents}
        />

    )
}

export default CreateEventModal;
