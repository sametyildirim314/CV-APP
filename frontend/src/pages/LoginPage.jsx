import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", sifre: "" });
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

        if (!form.email.trim() || !form.sifre) {
            setError("E-posta ve şifre zorunludur.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/Auth/giris`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email.trim(),
                    sifre: form.sifre,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.mesaj || "Giriş başarısız oldu.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.id,
                    ad: data.ad,
                    soyad: data.soyad,
                    email: data.email,
                    rol: data.rol,
                })
            );

            navigate("/");
        } catch {
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
                        <h1>Giriş Yap</h1>
                        <p>CVGenius AI hesabına giriş yap</p>
                    </div>

                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
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
                                placeholder="Şifreniz"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Hesabın yok mu? <Link to="/kayit">Kayıt ol</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
