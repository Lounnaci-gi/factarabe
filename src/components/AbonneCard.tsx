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
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNomArabe(abonne.nom_arabe || '');
    setRueArabe(abonne.rue_arabe || '');
    setBlocArabe(abonne.bloc_arabe || '');
    setNdomArabe(abonne.ndom_arabe || '');
    setTypeAbonneArabe(abonne.type_abonne_arabe || '');
  }, [abonne]);

  const handleSaveArabe = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Simulation d'une sauvegarde en base de données SQL
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
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
