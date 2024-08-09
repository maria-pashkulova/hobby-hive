import { Navigate, Outlet, useOutletContext } from 'react-router-dom';


const ProtectedRoute = () => {

    const [groupId, isMember, activityTags, groupRegionCity, groupAdmin] = useOutletContext();
    if (!isMember) {
        return <Navigate to={`/groups/${groupId}`} />
    }

    return <Outlet context={[groupId, isMember, activityTags, groupRegionCity, groupAdmin]} />
}

export default ProtectedRoute
