import React from 'react';
import type { Abonne, Facture } from '../types';

interface InvoicePrintProps {
  abonne: Abonne;
  facture: Facture;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ abonne, facture }) => {
  return (
    <div className="print-container">
      {/* Valeur : المدية positionnée à 14cm (gauche) et 3cm (haut) */}
      <div
        style={{
          position: 'absolute',
          left: '14cm',
          top: '3cm',
          direction: 'rtl',
          fontFamily: 'inherit',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        المدية
      </div>

      {/* Les autres éléments seront ajoutés ici selon vos instructions */}
    </div>
  );
};
