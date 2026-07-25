import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import './App.css';
import CvListPage from "./pages/CvListPage";
import CreateCvPage from "./pages/CreateCvPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
    return (
        <Router>
            <div id="root-layout">
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
                            <span>CVGenius AI</span>
                        </NavLink>

                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            <span>CV Listesi</span>
                        </NavLink>

                        <NavLink
                            to="/create"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            <span>CV Oluştur</span>
                        </NavLink>

                        <NavLink
                            to="/kayit"
                            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            <span>Kayıt Ol</span>
                        </NavLink>
                    </div>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<CvListPage />} />
                        <Route path="/create" element={<CreateCvPage />} />
                        <Route path="/kayit" element={<RegisterPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
