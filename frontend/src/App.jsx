import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import './App.css';
import CreateCvPage from "./pages/CreateCvPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        // Çıkış sonrası geri tuşuyla korumalı sayfaya dönülmesin
        navigate("/giris", { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-brand">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>CVPro</span>
                </NavLink>

                {user && (
                    <NavLink
                        to="/create"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>CV Oluştur</span>
                    </NavLink>
                )}

                {!user ? (
                    <>
                        <NavLink
                            to="/kayit"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span>Kayıt Ol</span>
                        </NavLink>
                        <NavLink
                            to="/giris"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <span>Giriş Yap</span>
                        </NavLink>
                    </>
                ) : (
                    <div className="nav-user-area">
                        <span className="nav-user">
                            {user.ad} {user.soyad}
                        </span>
                        <button type="button" className="nav-link nav-logout" onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Çıkış</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}


function AnaSayfaYonlendir() {
    const { user } = useAuth();
    return <Navigate to={user ? "/create" : "/giris"} replace />;
}


function KorumaliSayfa({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/giris" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div id="root-layout">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<AnaSayfaYonlendir />} />

                            {/* /create artık korumalı: giriş yoksa buraya gelinemez */}
                            <Route
                                path="/create"
                                element={
                                    <KorumaliSayfa>
                                        <CreateCvPage />
                                    </KorumaliSayfa>
                                }
                            />

                            <Route path="/kayit" element={<RegisterPage />} />
                            <Route path="/giris" element={<LoginPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
