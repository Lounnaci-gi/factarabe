import React from 'react';
import type { Abonne, Facture } from '../types';
import { AbonneCard } from './AbonneCard';

const getEtatCptLabel = (etat: string | number | undefined | null) => {
  if (!etat) return etat;

  const str = String(etat).toUpperCase();

  if (str.includes('EN MARCHE')) return 'في الخدمة'; // 10
  if (str.includes("PAS D'EAU") || str.includes("PAS D EAU")) return 'بدون ماء'; // 11
  if (str.includes('LIGNE INUTILISEE') || str.includes('LIGNE INUTILISÉE')) return 'خط غير مستخدم'; // 12, 19
  if (str.includes('DEPASSEMENT INDEX') || str.includes('DÉPASSEMENT INDEX')) return 'تجاوز المؤشر'; // 13
  if (str.includes('COMPTEUR COUPE') || str.includes('COMPTEUR COUPÉ')) return 'عداد مقطوع'; // 14
  if (str.includes('PUIT')) return 'بئر'; // 15
  if (str.includes('LOT DE TERRAIN')) return 'قطعة أرض'; // 16
  if (str.includes('NICHE FERMEE') || str.includes('NICHE FERMÉE')) return 'خزانة مغلقة'; // 17
  if (str.includes('MAISON INHABITEE') || str.includes('MAISON INHABITÉ')) return 'منزل غير مسكون'; // 18
  if (str.includes("A L'ARRET") || str.includes("A L ARRET") || str.includes("À L'ARRÊT")) return 'متوقف'; // 20
  if (str.includes('SANS COMPTEUR')) return 'بدون عداد'; // 30
  if (str.includes('RESILIE') || str.includes('RÉSILIÉ')) return 'ملغى'; // 40
  if (str.includes('NON BRANCHE') || str.includes('NON BRANCHÉ')) return 'غير موصول'; // 41

  const num = Number(etat);
  if (!isNaN(num)) {
    switch (num) {
      case 10: return 'في الخدمة';
      case 11: return 'بدون ماء';
      case 12: return 'خط غير مستخدم';
      case 13: return 'تجاوز المؤشر';
      case 14: return 'عداد مقطوع';
      case 15: return 'بئر';
      case 16: return 'قطعة أرض';
      case 17: return 'خزانة مغلقة';
      case 18: return 'منزل غير مسكون';
      case 19: return 'خط غير مستخدم';
      case 20: return 'متوقف';
      case 30: return 'بدون عداد';
      case 40: return 'ملغى';
      case 41: return 'غير موصول';
    }
  }

  return etat;
};

interface InvoicePrintProps {
  abonne: Abonne;
  facture: Facture;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ abonne, facture }) => {
  return (
    <div className="print-container">
      {/* Valeur : Nom de l'unité (Arabe) positionnée à droite */}
      <div
        style={{
          position: 'absolute',
          left: '12cm',
          top: '3.2cm',
          width: '5cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_unite_arabe || abonne.nom_unite}
      </div>

      {/* Valeur : Nom du secteur (Arabe) positionnée à droite */}
      <div
        style={{
          position: 'absolute',
          left: '12cm',
          top: '4cm',
          width: '5cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_secteur_arabe || abonne.nom_secteur}
      </div>

      {/* Valeur : Nom de la caisse (Arabe) positionnée à droite */}
      <div
        style={{
          position: 'absolute',
          left: '12cm',
          top: '4.8cm',
          width: '5cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '13px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_caisse_arabe || abonne.nom_caisse}
      </div>

      {/* --- BLOC CENTRAL : Facture et Période --- */}

      {/* Valeur : Numéro de facture formaté (NUMAB / yyyy-mm) */}
      <div
        style={{
          position: 'absolute',
          left: '7.2cm',
          top: '3.2cm',
          width: '4cm',
          textAlign: 'right',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold',
          direction: 'rtl'
        }}
      >
        {abonne.numab} / {facture.date_fact.slice(0, 7)}
      </div>

      {/* Valeur : Période (من ... إلى ...) restaurée */}
      <div
        style={{
          position: 'absolute',
          left: '7.2cm',
          top: '4cm',
          width: '5cm',
          textAlign: 'left',
          direction: 'rtl',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        من {facture.date_releve_prec.split('-').reverse().join('/')} إلى {facture.date_releve.split('-').reverse().join('/')}

      </div>

      {/* Valeur : Date de saisie (dd/mm/yyyy) */}
      <div
        style={{
          position: 'absolute',
          left: '7.2cm',
          top: '4.8cm',
          width: '4cm',
          textAlign: 'right',
          fontFamily: 'inherit',
          fontSize: '11px',
          fontWeight: 'bold',
          direction: 'rtl'
        }}
      >
        {facture.date_saisie.split('-').reverse().join('/')}
      </div>

      {/* --- BLOC GAUCHE : Dates Relevés --- */}

      {/* Valeur : Date de relevé (dd/mm/yyyy) */}
      <div
        style={{
          position: 'absolute',
          left: '1.5cm',
          top: '3.2cm',
          fontFamily: 'inherit',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_releve.split('-').reverse().join('/')}
      </div>

      {/* Valeur : Date du prochain relevé (dd/mm/yyyy) */}
      <div
        style={{
          position: 'absolute',
          left: '1.5cm',
          top: '4cm',
          fontFamily: 'inherit',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_prochain_releve.split('-').reverse().join('/')}
      </div>

      {/* Valeur : Date de la prochaine facture (dd/mm/yyyy) */}
      <div
        style={{
          position: 'absolute',
          left: '1.5cm',
          top: '4.8cm',
          fontFamily: 'inherit',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_prochaine_facture.split('-').reverse().join('/')}
      </div>


      {/* --- BLOC ABONNÉ (CADRE MILIEU) --- */}

      {/* GAUCHE : Compteur */}
      <div style={{ position: 'absolute', right: '13cm', top: '5.8cm', fontFamily: 'inherit', fontSize: '12px', direction: 'rtl' }}>
        {abonne.num_serie} {getEtatCptLabel(facture.etat_cpt)}
      </div>
      <div style={{ position: 'absolute', right: '13cm', top: '6.6cm', fontFamily: 'inherit', fontSize: '12px', direction: 'rtl' }}>
        {facture.ancien_index}
      </div>
      <div style={{ position: 'absolute', right: '13cm', top: '7.2cm', fontFamily: 'inherit', fontSize: '12px', direction: 'rtl' }}>
        {facture.nouveau_index}
      </div>
      <div style={{ position: 'absolute', right: '13cm', top: '7.8cm', fontFamily: 'inherit', fontSize: '12px', direction: 'rtl' }}>
        {facture.consommation} <sup>3</sup>م
      </div>

      {/* DROITE : Identification Client */}
      <div
        style={{
          position: 'absolute',
          left: '7cm',
          top: '5.8cm',
          width: '8.5cm',
          textAlign: 'right',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.code_unite} {abonne.code_secteur} {abonne.echelon} {abonne.numab} (TRN :{abonne.tournee})
      </div>

      <div
        style={{
          position: 'absolute',
          left: '10cm',
          top: '6.6cm',
          width: '8.5cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.raw_type_abonne} - {abonne.type_abonne_arabe || abonne.type_abonne}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '10cm',
          top: '7.1cm',
          width: '8.5cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_arabe || abonne.nom_prenom}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '10cm',
          top: '8cm',
          width: '8.6cm',
          textAlign: 'right',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.rue_arabe || abonne.adresse}
        {abonne.bloc_arabe ? ` - عمارة: ${abonne.bloc_arabe}` : ''}
        {abonne.ndom_arabe ? ` - رقم: ${abonne.ndom_arabe}` : ''}
      </div>

      {/* Code-barres pour NUMAB - Repositionné en bas à droite pour le paiement électronique */}
      <div style={{ position: 'absolute', left: '15.5cm', top: '5.6cm', height: '0.6cm', overflow: 'hidden' }}>
        <img
          src={`https://barcodeapi.org/api/128/${abonne.numab}`}
          alt="Barcode"
          style={{ height: '0.8cm', minWidth: '3.5cm', display: 'block' }}
        />
      </div>
    </div>
  );
};
