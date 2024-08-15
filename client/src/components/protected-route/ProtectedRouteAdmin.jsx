import { useContext } from 'react';
import { Navigate, Outlet, useOutletContext, useParams } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

const ProtectedRouteAdmin = () => {

    const { groupId } = useParams();
    const { groupAdmin } = useOutletContext();
    const { userId } = useContext(AuthContext);

    if (userId !== groupAdmin) {
        return <Navigate to={`/groups/${groupId}`} />
    }


    return <Outlet />
}

export default ProtectedRouteAdmin
