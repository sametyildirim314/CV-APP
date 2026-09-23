import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const API = process.env.REACT_APP_API_URL;

const EMPTY_DENEYIM = { pozisyon: "", sirket: "", baslangicTarihi: "", bitisTarihi: "", aciklama: "" };
const EMPTY_EGITIM = { okulAdi: "", bolum: "", başlangıcTarihi: "", bitisTarihi: "", ortlama: "" };
const EMPTY_PROJE = { projeAdi: "", aciklama: "" };
const EMPTY_SERTIFIKA = { sertifikaAdi: "", verenKurum: "", alisTarihi: "", bitisTarihi: "", aciklama: "" };

function CreateCvPage() {
    const { user } = useAuth();
    const [creating, setCreating] = useState(false);
    const [toast, setToast] = useState(null);

    // Girişli kullanıcının adı ve e-postası formda hazır gelir
    const [form, setForm] = useState({
        adSoyad: user ? `${user.ad} ${user.soyad}` : "",
        unvan: "",
        email: user ? user.email : "",
        telefon: "",
        adres: "",
        özet: "",
        yetenekler: "",
    });

    const [deneyimler, setDeneyimler] = useState([]);
    const [egitimler, setEgitimler] = useState([]);
    const [projeler, setProjeler] = useState([]);
    const [sertifikalar, setSertifikalar] = useState([]);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const showToast = (type, message) => setToast({ type, message });

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const updateListItem = (setter, index, field, value) => {
        setter((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const removeListItem = (setter, index) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setForm({
            adSoyad: user ? `${user.ad} ${user.soyad}` : "",
            unvan: "",
            email: user ? user.email : "",
            telefon: "",
            adres: "",
            özet: "",
            yetenekler: "",
        });
        setDeneyimler([]);
        setEgitimler([]);
        setProjeler([]);
        setSertifikalar([]);
    };

    const handleSubmit = async (action) => {
        if (!user) {
            showToast("error", "CV oluşturmak için giriş yapmalısınız");
            return;
        }
        if (!form.adSoyad.trim() || !form.email.trim()) {
            showToast("error", "Ad Soyad ve E-posta zorunlu alanlardır");
            return;
        }

        setCreating(true);

        try {
            const body = {
                adSoyad: form.adSoyad,
                unvan: form.unvan,
                email: form.email,
                telefon: form.telefon,
                adres: form.adres,
                özet: form.özet,
                yetenekler: form.yetenekler
                    ? form.yetenekler.split(",").map((s) => s.trim()).filter(Boolean)
                    : [],
                deneyim: deneyimler.map(({ pozisyon, sirket, baslangicTarihi, bitisTarihi, aciklama }) => ({
                    pozisyon, sirket, baslangicTarihi, bitisTarihi, aciklama,
                })),
                eğitim: egitimler.map(({ okulAdi, bolum, başlangıcTarihi, bitisTarihi, ortlama }) => ({
                    okulAdi, bolum, başlangıcTarihi, bitisTarihi, ortlama,
                })),
                projeler: projeler.map(({ projeAdi, aciklama }) => ({ projeAdi, aciklama })),
                sertifikalar: sertifikalar.map(({ sertifikaAdi, verenKurum, alisTarihi, bitisTarihi, aciklama }) => ({
                    sertifikaAdi, verenKurum, alisTarihi, bitisTarihi, aciklama,
                })),
            };

            const res = await fetch(
                `${API}/api/Cv/kullanici/${user.id}/olustur-ve-indir`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            if (action === "download") {
                const a = document.createElement("a");
                a.href = url;
                a.download = `cv-${form.adSoyad.replace(/\s+/g, "_")}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                window.open(url, "_blank");
            }

            window.URL.revokeObjectURL(url);
            showToast("success", "CV başarıyla oluşturuldu!");
            resetForm();
        } catch (err) {
            showToast("error", "CV oluşturulurken hata: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {toast.type === "success" ? (
                                <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                            ) : (
                                <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                            )}
                        </svg>
                        {toast.message}
                    </div>
                </div>
            )}

            <div className="page-header">
                <h1>CV Oluştur</h1>
                <p>Profesyonel bir CV oluşturun ve PDF olarak indirin</p>
            </div>

            {/* Giriş yapılmadıysa formu gösterme */}
            {!user ? (
                <div className="form-section">
                    <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>
                            CV oluşturmak için önce giriş yapmalısınız.{" "}
                            <Link to="/giris">Giriş yap</Link> veya{" "}
                            <Link to="/kayit">kayıt ol</Link>.
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    <div className="form-section">
                        <div className="form-section-header">
                            <div className="form-section-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <div className="form-section-title">Kişisel Bilgiler</div>
                                <div className="form-section-subtitle">Temel iletişim ve kimlik bilgileriniz</div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Ad Soyad <span className="required">*</span></label>
                                <input className="form-input" name="adSoyad" value={form.adSoyad} onChange={handleFormChange} placeholder="Örn: Ahmet Yılmaz" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unvan</label>
                                <input className="form-input" name="unvan" value={form.unvan} onChange={handleFormChange} placeholder="Örn: Full Stack Developer" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">E-posta <span className="required">*</span></label>
                                <input className="form-input" type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Örn: ahmet@mail.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Telefon</label>
                                <input className="form-input" name="telefon" value={form.telefon} onChange={handleFormChange} placeholder="Örn: 0532 123 4567" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Adres</label>
                            <input className="form-input" name="adres" value={form.adres} onChange={handleFormChange} placeholder="Örn: İstanbul, Türkiye" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Profesyonel Özet</label>
                            <textarea className="form-textarea" name="özet" value={form.özet} onChange={handleFormChange} rows={3} placeholder="Kendinizi kısaca tanıtın..." />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Yetenekler</label>
                            <input className="form-input" name="yetenekler" value={form.yetenekler} onChange={handleFormChange} placeholder="React, Node.js, SQL, Python..." />
                            <span className="form-hint">Virgülle ayırarak yazın</span>
                        </div>
                    </div>

                    {/* Deneyim */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <div className="form-section-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                                </svg>
                            </div>
                            <div>
                                <div className="form-section-title">İş Deneyimi</div>
                                <div className="form-section-subtitle">Profesyonel iş deneyimlerinizi ekleyin</div>
                            </div>
                        </div>

                        {deneyimler.map((d, i) => (
                            <div className="list-item" key={i}>
                                <div className="list-item-header">
                                    <span className="list-item-number">Deneyim #{i + 1}</span>
                                    <button type="button" className="list-item-remove" onClick={() => removeListItem(setDeneyimler, i)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        Kaldır
                                    </button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Pozisyon</label>
                                        <input className="form-input" value={d.pozisyon} onChange={(e) => updateListItem(setDeneyimler, i, "pozisyon", e.target.value)} placeholder="Yazılım Mühendisi" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Şirket</label>
                                        <input className="form-input" value={d.sirket} onChange={(e) => updateListItem(setDeneyimler, i, "sirket", e.target.value)} placeholder="ABC Teknoloji" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Başlangıç Tarihi</label>
                                        <input className="form-input" value={d.baslangicTarihi} onChange={(e) => updateListItem(setDeneyimler, i, "baslangicTarihi", e.target.value)} placeholder="Ocak 2022" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input className="form-input" value={d.bitisTarihi} onChange={(e) => updateListItem(setDeneyimler, i, "bitisTarihi", e.target.value)} placeholder="Devam ediyor" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" value={d.aciklama} onChange={(e) => updateListItem(setDeneyimler, i, "aciklama", e.target.value)} rows={2} placeholder="Görev ve sorumluluklarınız..." />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={() => setDeneyimler([...deneyimler, { ...EMPTY_DENEYIM }])}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            Deneyim Ekle
                        </button>
                    </div>

                    {/* Eğitim */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <div className="form-section-icon amber">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
                                </svg>
                            </div>
                            <div>
                                <div className="form-section-title">Eğitim Bilgileri</div>
                                <div className="form-section-subtitle">Eğitim geçmişinizi ekleyin</div>
                            </div>
                        </div>

                        {egitimler.map((e, i) => (
                            <div className="list-item" key={i}>
                                <div className="list-item-header">
                                    <span className="list-item-number">Eğitim #{i + 1}</span>
                                    <button type="button" className="list-item-remove" onClick={() => removeListItem(setEgitimler, i)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        Kaldır
                                    </button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Okul Adı</label>
                                        <input className="form-input" value={e.okulAdi} onChange={(ev) => updateListItem(setEgitimler, i, "okulAdi", ev.target.value)} placeholder="İstanbul Teknik Üniversitesi" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bölüm</label>
                                        <input className="form-input" value={e.bolum} onChange={(ev) => updateListItem(setEgitimler, i, "bolum", ev.target.value)} placeholder="Bilgisayar Mühendisliği" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Başlangıç Tarihi</label>
                                        <input className="form-input" value={e.başlangıcTarihi} onChange={(ev) => updateListItem(setEgitimler, i, "başlangıcTarihi", ev.target.value)} placeholder="2018" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input className="form-input" value={e.bitisTarihi} onChange={(ev) => updateListItem(setEgitimler, i, "bitisTarihi", ev.target.value)} placeholder="2022" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Ortalama (GPA)</label>
                                    <input className="form-input" value={e.ortlama} onChange={(ev) => updateListItem(setEgitimler, i, "ortlama", ev.target.value)} placeholder="3.50" />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={() => setEgitimler([...egitimler, { ...EMPTY_EGITIM }])}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            Eğitim Ekle
                        </button>
                    </div>

                    {/* Projeler */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <div className="form-section-icon sky">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6" />
                                    <polyline points="8 6 2 12 8 18" />
                                </svg>
                            </div>
                            <div>
                                <div className="form-section-title">Projeler</div>
                                <div className="form-section-subtitle">Öne çıkan projelerinizi ekleyin</div>
                            </div>
                        </div>

                        {projeler.map((p, i) => (
                            <div className="list-item" key={i}>
                                <div className="list-item-header">
                                    <span className="list-item-number">Proje #{i + 1}</span>
                                    <button type="button" className="list-item-remove" onClick={() => removeListItem(setProjeler, i)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        Kaldır
                                    </button>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Proje Adı</label>
                                    <input className="form-input" value={p.projeAdi} onChange={(e) => updateListItem(setProjeler, i, "projeAdi", e.target.value)} placeholder="E-Ticaret Platformu" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" value={p.aciklama} onChange={(e) => updateListItem(setProjeler, i, "aciklama", e.target.value)} rows={2} placeholder="Projenin detayları..." />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={() => setProjeler([...projeler, { ...EMPTY_PROJE }])}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            Proje Ekle
                        </button>
                    </div>

                    {/* Sertifikalar */}
                    <div className="form-section">
                        <div className="form-section-header">
                            <div className="form-section-icon red">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="8" r="7" />
                                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                                </svg>
                            </div>
                            <div>
                                <div className="form-section-title">Sertifikalar</div>
                                <div className="form-section-subtitle">Sahip olduğunuz sertifikaları ekleyin</div>
                            </div>
                        </div>

                        {sertifikalar.map((s, i) => (
                            <div className="list-item" key={i}>
                                <div className="list-item-header">
                                    <span className="list-item-number">Sertifika #{i + 1}</span>
                                    <button type="button" className="list-item-remove" onClick={() => removeListItem(setSertifikalar, i)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        Kaldır
                                    </button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Sertifika Adı</label>
                                        <input className="form-input" value={s.sertifikaAdi} onChange={(e) => updateListItem(setSertifikalar, i, "sertifikaAdi", e.target.value)} placeholder="AWS Solutions Architect" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Veren Kurum</label>
                                        <input className="form-input" value={s.verenKurum} onChange={(e) => updateListItem(setSertifikalar, i, "verenKurum", e.target.value)} placeholder="Amazon Web Services" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Alış Tarihi</label>
                                        <input className="form-input" value={s.alisTarihi} onChange={(e) => updateListItem(setSertifikalar, i, "alisTarihi", e.target.value)} placeholder="Mart 2023" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bitiş Tarihi</label>
                                        <input className="form-input" value={s.bitisTarihi} onChange={(e) => updateListItem(setSertifikalar, i, "bitisTarihi", e.target.value)} placeholder="Mart 2026" />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" value={s.aciklama} onChange={(e) => updateListItem(setSertifikalar, i, "aciklama", e.target.value)} rows={2} placeholder="Sertifika detayları..." />
                                </div>
                            </div>
                        ))}
                        <button type="button" className="add-item-btn" onClick={() => setSertifikalar([...sertifikalar, { ...EMPTY_SERTIFIKA }])}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                            Sertifika Ekle
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-section" style={{ position: "sticky", bottom: 16, zIndex: 50, boxShadow: "var(--shadow-xl)" }}>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button
                                type="button"
                                className="btn btn-success btn-lg"
                                style={{ flex: 1, minWidth: 180 }}
                                disabled={creating}
                                onClick={() => handleSubmit("download")}
                            >
                                {creating ? (
                                    <span className="spinner" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                )}
                                {creating ? "Oluşturuluyor..." : "PDF İndir"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1, minWidth: 180 }}
                                disabled={creating}
                                onClick={() => handleSubmit("view")}
                            >
                                {creating ? (
                                    <span className="spinner" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                                {creating ? "Oluşturuluyor..." : "PDF Görüntüle"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CreateCvPage;
