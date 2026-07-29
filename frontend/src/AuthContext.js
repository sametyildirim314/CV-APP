import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function readUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser);

    // Backend'den dönen GirisYanitDto (id, ad, soyad, email, rol, token) alır
    const login = (data) => {
        localStorage.setItem("token", data.token);
        const u = {
            id: data.id,
            ad: data.ad,
            soyad: data.soyad,
            email: data.email,
            rol: data.rol,
        };
        localStorage.setItem("user", JSON.stringify(u));
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
