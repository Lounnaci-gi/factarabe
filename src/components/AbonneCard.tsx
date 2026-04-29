import React, { useState, useEffect } from 'react';
import type { Abonne } from '../types';

interface AbonneCardProps {
  abonne: Abonne;
}

export const AbonneCard: React.FC<AbonneCardProps> = ({ abonne }) => {
  const [nomArabe, setNomArabe] = useState(abonne.nom_arabe || '');
  const [rueArabe, setRueArabe] = useState(abonne.rue_arabe || '');
  const [blocArabe, setBlocArabe] = useState(abonne.bloc_arabe || '');
  const [ndomArabe, setNdomArabe] = useState(abonne.ndom_arabe || '');
  const [typeAbonneArabe, setTypeAbonneArabe] = useState(abonne.type_abonne_arabe || '');
  const [nomUniteArabe, setNomUniteArabe] = useState(abonne.nom_unite_arabe || '');
  const [nomSecteurArabe, setNomSecteurArabe] = useState(abonne.nom_secteur_arabe || '');
  const [nomCaisseArabe, setNomCaisseArabe] = useState(abonne.nom_caisse_arabe || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNomArabe(abonne.nom_arabe || '');
    setRueArabe(abonne.rue_arabe || '');
    setBlocArabe(abonne.bloc_arabe || '');
    setNdomArabe(abonne.ndom_arabe || '');
    setTypeAbonneArabe(abonne.type_abonne_arabe || '');
    setNomUniteArabe(abonne.nom_unite_arabe || '');
    setNomSecteurArabe(abonne.nom_secteur_arabe || '');
    setNomCaisseArabe(abonne.nom_caisse_arabe || '');
  }, [abonne]);

  const handleSaveArabe = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      try {
        await fetch(`http://${window.location.hostname}:3001/api/abonne/${abonne.numab}/traduction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_arabe: nomArabe || null,
            rue_arabe: rueArabe || null,
            bloc_arabe: blocArabe || null,
            ndom_arabe: ndomArabe || null,
            type_abonne_arabe: typeAbonneArabe || null,
            nom_unite_arabe: nomUniteArabe || null,
            nom_secteur_arabe: nomSecteurArabe || null,
            nom_caisse_arabe: nomCaisseArabe || null,
          }),
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      } catch {
        console.error('Erreur de sauvegarde de la traduction');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Informations Abonné</span>
          <span className="badge badge-success" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Type : {abonne.type_abonne}</span>
        </div>
        <span className="text-muted" style={{ fontSize: '14px' }}>#{abonne.numab}</span>
      </div>

      <div className="info-grid">
        <div className="info-block">
          <span className="info-label">Identité Initiale (FR)</span>
          <span className="info-value">{abonne.nom_prenom}</span>
          <div style={{ marginTop: '12px' }}>

            <span className="info-value text-muted" style={{ fontSize: '13px' }}>
              Compteur N° : <strong style={{ color: '#0F172A' }}>{abonne.num_serie}</strong>
              &nbsp;&nbsp;|&nbsp;&nbsp;
              Tournée : <strong style={{ color: '#0F172A' }}>{abonne.tournee}</strong>
            </span>
            <div style={{ marginTop: '8px' }}>
              <span className="info-value text-muted" style={{ fontSize: '13px' }}>
                Unité : <strong style={{ color: '#0F172A' }}>{abonne.code_unite} - {abonne.nom_unite}</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Secteur : <strong style={{ color: '#0F172A' }}>{abonne.code_secteur} - {abonne.nom_secteur}</strong>
              </span>
            </div>
            <div style={{ marginTop: '4px' }}>
              <span className="info-value text-muted" style={{ fontSize: '13px' }}>
                Caisse : <strong style={{ color: '#0F172A' }}>{abonne.code_caisse} - {abonne.nom_caisse}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="info-block" style={{ direction: 'rtl', textAlign: 'right' }}>
          <span className="info-label">الهوية (ترجمة المستخدم)</span>
          <div className="ar-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <input
              type="text"
              className="rtl-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="إدخال الاسم بالعربية (Nom en Arabe)"
              value={nomArabe}
              onChange={(e) => setNomArabe(e.target.value)}
              onKeyDown={handleSaveArabe}
            />
            <input
              type="text"
              className="rtl-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="نوع الاشتراك (Type d'abonné en Arabe)"
              value={typeAbonneArabe}
              onChange={(e) => setTypeAbonneArabe(e.target.value)}
              onKeyDown={handleSaveArabe}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="rtl-input"
                style={{ flex: 1 }}
                placeholder="اسم الوحدة (Unité en Arabe)"
                value={nomUniteArabe}
                onChange={(e) => setNomUniteArabe(e.target.value)}
                onKeyDown={handleSaveArabe}
              />
              <input
                type="text"
                className="rtl-input"
                style={{ flex: 1 }}
                placeholder="اسم القطاع (Secteur en Arabe)"
                value={nomSecteurArabe}
                onChange={(e) => setNomSecteurArabe(e.target.value)}
                onKeyDown={handleSaveArabe}
              />
            </div>
            <input
              type="text"
              className="rtl-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="اسم الصندوق (Caisse en Arabe)"
              value={nomCaisseArabe}
              onChange={(e) => setNomCaisseArabe(e.target.value)}
              onKeyDown={handleSaveArabe}
            />
            {isSaved && <span style={{ color: '#10B981', fontSize: '12px' }}>✔ Sauvegardé</span>}
          </div>
        </div>

        <div className="info-block">
          <span className="info-label">Localisation (FR)</span>
          <span className="info-value">{abonne.adresse}</span>
        </div>

        <div className="info-block" style={{ direction: 'rtl', textAlign: 'right' }}>
          <span className="info-label">الموقع (ترجمة المستخدم)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

            <input
              type="text"
              className="rtl-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="الشارع (Rue)"
              value={rueArabe}
              onChange={(e) => setRueArabe(e.target.value)}
              onKeyDown={handleSaveArabe}
            />

            <div className="ar-form" style={{ justifyContent: 'flex-start' }}>
              <input
                type="text"
                className="rtl-input"
                style={{ maxWidth: '120px' }}
                placeholder="الكتلة (Bloc)"
                value={blocArabe}
                onChange={(e) => setBlocArabe(e.target.value)}
                onKeyDown={handleSaveArabe}
              />
              <input
                type="text"
                className="rtl-input"
                style={{ maxWidth: '120px' }}
                placeholder="رقم (N°)"
                value={ndomArabe}
                onChange={(e) => setNdomArabe(e.target.value)}
                onKeyDown={handleSaveArabe}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
