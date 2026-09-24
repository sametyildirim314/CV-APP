import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API = process.env.REACT_APP_API_URL;

function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({
        ad: "",
        soyad: "",
        email: "",
        sifre: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.ad.trim() || !form.soyad.trim() || !form.email.trim() || !form.sifre) {
            setError("Tüm alanlar zorunludur.");
            return;
        }

        if (form.sifre.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/Auth/kayit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ad: form.ad.trim(),
                    soyad: form.soyad.trim(),
                    email: form.email.trim(),
                    sifre: form.sifre,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.mesaj || "Kayıt başarısız oldu.");
                return;
            }

            login(data);
            navigate("/");
        } catch (err) {
            setError("Sunucuya bağlanılamadı. API çalışıyor mu?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="card-body">
                    <div className="auth-header">
                        <h1>Kayıt Ol</h1>
                        <p>CVPro hesabı oluştur</p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="ad">
                                    Ad <span className="required">*</span>
                                </label>
                                <input
                                    id="ad"
                                    name="ad"
                                    type="text"
                                    className="form-input"
                                    value={form.ad}
                                    onChange={handleChange}
                                    placeholder="Adınız"
                                    autoComplete="given-name"
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="soyad">
                                    Soyad <span className="required">*</span>
                                </label>
                                <input
                                    id="soyad"
                                    name="soyad"
                                    type="text"
                                    className="form-input"
                                    value={form.soyad}
                                    onChange={handleChange}
                                    placeholder="Soyadınız"
                                    autoComplete="family-name"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                E-posta <span className="required">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="ornek@email.com"
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="sifre">
                                Şifre <span className="required">*</span>
                            </label>
                            <input
                                id="sifre"
                                name="sifre"
                                type="password"
                                className="form-input"
                                value={form.sifre}
                                onChange={handleChange}
                                placeholder="En az 6 karakter"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <p className="form-hint">En az 6 karakter</p>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Kaydediliyor..." : "Hesap Oluştur"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Kayıt sonrası otomatik giriş yapılır.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
