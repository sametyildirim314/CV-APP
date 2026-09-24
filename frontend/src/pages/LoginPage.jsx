import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Backend adresi .env dosyasından geliyor (REACT_APP_API_URL)
const API = process.env.REACT_APP_API_URL;

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form alanlarını tek bir state'te tutuyoruz.
    // İki ayrı useState yerine obje kullanmak, alan sayısı artınca işi kolaylaştırıyor.
    const [form, setForm] = useState({ email: "", sifre: "" });

    // İstek atılırken butonu kilitlemek ve "Giriş yapılıyor..." yazmak için
    const [loading, setLoading] = useState(false);

    // Hata mesajını burada tutuyoruz. Boş string = hata yok.
    const [error, setError] = useState("");

    // Şifre alanı "password" mı "text" mi olacak? true ise şifre görünür.
    const [sifreGoster, setSifreGoster] = useState(false);

    // Input'a her harf yazıldığında çalışır.
    // e.target.name -> hangi input (email / sifre)
    // e.target.value -> yazılan değer
    const handleChange = (e) => {
        const { name, value } = e.target;

        // ...prev ile eski değerleri koruyup sadece değişen alanı güncelliyoruz.
        // [name] köşeli parantez: değişkenin DEĞERİNİ key olarak kullan demek.
        setForm((prev) => ({ ...prev, [name]: value }));

        // Kullanıcı yazmaya başladıysa eski hatayı temizle
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        // Formun sayfayı yenilemesini engelle (klasik HTML davranışı)
        e.preventDefault();
        setError("");

        // Backend'e gitmeden önce basit kontrol.
        // Boş alanlarla istek atıp sunucuyu yormaya gerek yok.
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

            // Cevap JSON değilse (örn. 500 sayfası) patlamasın diye catch ile boş obje dönüyoruz
            const data = await res.json().catch(() => ({}));

            // res.ok -> status 200-299 arasıysa true
            if (!res.ok) {
                setError(data.mesaj || "Giriş başarısız oldu.");
                return;
            }

            // Backend'den gelen { id, ad, soyad, email, rol, token } bilgisini
            // AuthContext'e veriyoruz. O da localStorage'a yazıyor.
            login(data);

            // replace: true -> login sayfası geçmişten silinir,
            // kullanıcı geri tuşuna basınca tekrar login formuna düşmez
            navigate("/", { replace: true });
        } catch {
            // fetch'in kendisi patlarsa (API kapalı, internet yok vs.) buraya düşer
            setError("Sunucuya bağlanılamadı. API çalışıyor mu?");
        } finally {
            // Başarılı da olsa hata da olsa loading'i kapat
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Kart iki parçadan oluşuyor: sol tanıtım paneli + sağ form */}
            <div className="auth-split">

                {/* ---------- SOL PANEL ---------- */}
                {/* Sadece görsel amaçlı. Mobilde CSS ile gizleniyor. */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>CVPro</span>
                    </div>

                    <h2>Tekrar hoş geldin</h2>
                    <p>
                        Hesabına giriş yap, CV'lerini düzenle ve dakikalar içinde
                        PDF olarak indir.
                    </p>

                    {/* Küçük özellik listesi. Sayfayı boş bırakmamak için. */}
                    <ul className="auth-side-list">
                        <li>
                            <span className="auth-check">✓</span>
                            Profesyonel PDF şablonları
                        </li>
                        <li>
                            <span className="auth-check">✓</span>
                            Deneyim, eğitim ve proje bölümleri
                        </li>
                        <li>
                            <span className="auth-check">✓</span>
                            Verilerin güvende, sadece sen görürsün
                        </li>
                    </ul>
                </div>

                {/* ---------- SAĞ PANEL (FORM) ---------- */}
                <div className="auth-form-side">
                    <div className="auth-header">
                        <h1>Giriş Yap</h1>
                        <p>Devam etmek için bilgilerini gir</p>
                    </div>

                    {/* error dolu ise bu kutu görünür. && kısa yol: soldaki false ise sağı hiç render etmez. */}
                    {error && (
                        <div className="alert alert-error" role="alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* noValidate: tarayıcının kendi "bu alan zorunlu" balonlarını kapatıyoruz,
                        hatayı biz kendimiz gösteriyoruz */}
                    <form onSubmit={handleSubmit} noValidate>

                        {/* E-POSTA */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                E-posta
                            </label>

                            {/* Input'un içine ikon koymak için sarmalayıcı div.
                                İkon position:absolute ile sola yaslanıyor, input'a soldan padding veriyoruz. */}
                            <div className="input-icon-wrap">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="form-input has-icon"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="ornek@email.com"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* ŞİFRE */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="sifre">
                                Şifre
                            </label>

                            <div className="input-icon-wrap">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                <input
                                    id="sifre"
                                    name="sifre"
                                    // Ternary: sifreGoster true ise "text", değilse "password"
                                    type={sifreGoster ? "text" : "password"}
                                    className="form-input has-icon has-toggle"
                                    value={form.sifre}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />

                                {/* Göz butonu. type="button" ÖNEMLİ:
                                    yoksa form içindeki her buton submit sayılır ve form gönderilir. */}
                                <button
                                    type="button"
                                    className="input-toggle"
                                    onClick={() => setSifreGoster(!sifreGoster)}
                                    aria-label={sifreGoster ? "Şifreyi gizle" : "Şifreyi göster"}
                                    tabIndex={-1}
                                >
                                    {sifreGoster ? (
                                        // Göz kapalı ikonu
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        // Göz açık ikonu
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {/* loading true iken küçük bir dönen halka gösteriyoruz */}
                            {loading && <span className="spinner" />}
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Hesabın yok mu? <Link to="/kayit">Hemen kayıt ol</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
