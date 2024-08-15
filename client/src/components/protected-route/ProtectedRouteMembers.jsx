import { Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom';


const ProtectedRoute = () => {

    const { groupId } = useParams();
    const { isMember, activityTags, groupRegionCity, groupAdmin } = useOutletContext();

    if (!isMember) {
        return <Navigate to={`/groups/${groupId}`} />
    }

    return <Outlet context={{ isMember, activityTags, groupRegionCity, groupAdmin }} />
}

export default ProtectedRoute
