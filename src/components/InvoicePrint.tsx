import React from 'react';
import type { Abonne, Facture } from '../types';

interface InvoicePrintProps {
  abonne: Abonne;
  facture: Facture;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ abonne, facture }) => {
  return (
    <div className="print-container">
      {/* Valeur : Nom de l'unité (Arabe) positionnée à 14cm (gauche) et 3cm (haut) */}
      <div
        style={{
          position: 'absolute',
          left: '16.5cm',
          top: '3.2cm',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_unite_arabe || abonne.nom_unite}
      </div>

      {/* Valeur : Nom du secteur (Arabe) positionnée à 14cm (gauche) et 4cm (haut) */}
      <div
        style={{
          position: 'absolute',
          left: '16.5cm',
          top: '4cm',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_secteur_arabe || abonne.nom_secteur}
      </div>

      {/* Valeur : Période (من ... إلى ...) positionnée à 8cm (gauche) et 4cm (haut) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '8cm', 
          top: '4cm',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        من {facture.date_releve_prec.split('-').reverse().join('/')} إلى {facture.date_releve.split('-').reverse().join('/')}
      </div>

      {/* Valeur : Date de saisie (dd/mm/yyyy) à 8cm (gauche) et 5cm (haut) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '8cm', 
          top: '5cm',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_saisie.split('-').reverse().join('/')}
      </div>

      {/* Valeur : Nom de la caisse (Arabe) positionnée à 14cm (gauche) et 5cm (haut) */}
      <div
        style={{
          position: 'absolute',
          left: '16.5cm',
          top: '5cm',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        {abonne.nom_caisse_arabe || abonne.nom_caisse}
      </div>

      {/* Valeur : Date de relevé (dd/mm/yyyy) à 2cm (gauche) et 3cm (haut) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '2cm', 
          top: '3cm',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_releve.split('-').reverse().join('/')}
      </div>

      {/* Valeur : Date du prochain relevé (dd/mm/yyyy) à 2cm (gauche) et 4cm (haut) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '2cm', 
          top: '4cm',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {facture.date_prochain_releve.split('-').reverse().join('/')}
      </div>

      {/* Numéro de facture formaté (NUMAB / yyyymm) à 10cm (gauche) et 3cm (haut) */}
      <div
        style={{
          position: 'absolute',
          left: '8cm',
          top: '3.2cm',
          fontFamily: 'inherit',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {abonne.numab} / {facture.date_fact.slice(0, 7)}
      </div>

      {/* Les autres éléments seront ajoutés ici selon vos instructions */}
    </div>
  );
};
