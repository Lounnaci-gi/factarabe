import React from 'react';
import type { Abonne, Facture } from '../types';

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
          left: '11.5cm',
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
          left: '11.5cm',
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
          left: '11.5cm',
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
      <div style={{ position: 'absolute', left: '1.5cm', top: '7.2cm', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {facture.etat_cpt}
      </div>
      <div style={{ position: 'absolute', left: '1.5cm', top: '8.0cm', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold' }}>
        {facture.ancien_index}
      </div>
      <div style={{ position: 'absolute', left: '1.5cm', top: '8.8cm', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold' }}>
        {facture.nouveau_index}
      </div>
      <div style={{ position: 'absolute', left: '1.5cm', top: '9.6cm', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>
        {facture.consommation} m³
      </div>

      {/* DROITE : Identification Client */}
      <div
        style={{
          position: 'absolute',
          left: '7cm',
          top: '5.6cm',
          width: '8.5cm',
          textAlign: 'right',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '1px'
        }}
      >
        {abonne.code_unite} {abonne.code_secteur} {abonne.echelon} {abonne.numab} (TRN :{abonne.tournee})
      </div>

      <div
        style={{
          position: 'absolute',
          left: '7cm',
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
          left: '7cm',
          top: '6.6cm',
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
          left: '7cm',
          top: '7.6cm',
          width: '8.5cm',
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
      <div style={{ position: 'absolute', left: '16.2cm', top: '23.8cm', height: '0.8cm', overflow: 'hidden' }}>
        <img
          src={`https://barcodeapi.org/api/128/${abonne.numab}`}
          alt="Barcode"
          style={{ height: '1.2cm', minWidth: '3.5cm', display: 'block' }}
        />
      </div>
    </div>
  );
};
