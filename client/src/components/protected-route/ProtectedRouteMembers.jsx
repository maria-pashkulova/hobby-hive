import { Navigate, Outlet, useOutletContext } from 'react-router-dom';


const ProtectedRoute = () => {

    const [groupId, isMember, activityTags] = useOutletContext();
    if (!isMember) {
        return <Navigate to={`/groups/${groupId}`} />
    }

    return <Outlet context={[groupId, isMember, activityTags]} />
}

export default ProtectedRoute
