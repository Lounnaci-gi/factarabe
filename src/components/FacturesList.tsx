import React from 'react';
import type { Facture } from '../types';

interface FacturesListProps {
  factures: Facture[];
}

export const FacturesList: React.FC<FacturesListProps> = ({ factures }) => {
  return (
    <div className="card">
      <div className="card-title">
        <span>Historique des Factures</span>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Période / Réf</th>
              <th>Date Facturation</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>État Cpt</th>
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF' }}>
                  Aucune facture trouvée.
                </td>
              </tr>
            ) : (
              factures.map((f) => {
                const isPayee = f.montant_paye >= f.montant || f.date_reglement !== null;
                
                return (
                  <tr key={f.id}>
                    <td className="text-bold">{f.id}</td>
                    <td>{f.date_fact}</td>
                    <td className="text-bold" style={{ textAlign: 'right', paddingRight: '32px' }}>
                      {f.montant.toFixed(2)} DZD
                    </td>
                    <td>
                      {isPayee ? (
                        <span className="badge badge-success">
                          Payée le {f.date_reglement}
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          Impayée
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
                        {f.etat_cpt}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
