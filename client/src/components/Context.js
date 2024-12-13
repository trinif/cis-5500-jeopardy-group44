import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const generateRandomUserId = () => {
    return 'guest_' + Math.random().toString(36).substring(2, 9);
};

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(generateRandomUserId); 

    return (
        <AuthContext.Provider value={{ userId, setUserId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
