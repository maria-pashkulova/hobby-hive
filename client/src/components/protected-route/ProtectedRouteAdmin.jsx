import { useContext } from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

const ProtectedRouteAdmin = () => {

    const [groupId, isMember, activityTags, groupRegionCity, groupAdmin] = useOutletContext();
    const { logoutHandler, userId } = useContext(AuthContext);

    if (userId !== groupAdmin) {
        return <Navigate to={`/groups/${groupId}`} />
    }


    return <Outlet context={[groupId]} />
}

export default ProtectedRouteAdmin
