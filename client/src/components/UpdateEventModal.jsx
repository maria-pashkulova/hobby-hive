import EventModal from "./EventModal"

const UpdateEventModal = ({ isOpen, onClose, groupId, groupRegionCity, groupActivityTags, handleUpdateEvent, existingEvents, currentEventData }) => {

    return (
        <EventModal
            isOpen={isOpen}
            onClose={onClose}
            groupId={groupId}
            groupRegionCity={groupRegionCity}
            groupActivityTags={groupActivityTags}
            handleEventsChange={handleUpdateEvent}
            existingEvents={existingEvents}
            currentEventData={currentEventData}
        />
    )
}

export default UpdateEventModal
