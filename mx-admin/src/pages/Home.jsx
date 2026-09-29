/**
 * Project: mxfrragrance
 * Created: 2026/05/14 12:52
 * Author: Scarra Luba
 */
import useAuth from "../context/auth/useAuth.jsx";

const Home = () => {
    const { user } = useAuth();
    return (
        <div>
                <h1>Welcome, {user.email}!</h1>
        </div>
    );
};

export default Home;