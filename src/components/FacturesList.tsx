import React, { useState } from 'react';
import type { Facture } from '../types';

interface FacturesListProps {
  factures: Facture[];
  onPrint: (facture: Facture) => void;
}

export const FacturesList: React.FC<FacturesListProps> = ({ factures, onPrint }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = factures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(factures.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="card">
      <div className="card-title">
        <span>Historique des Factures</span>
        <span className="text-muted" style={{ fontSize: '12px' }}>{factures.length} factures au total</span>
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
              <th style={{ textAlign: 'center' }}>Action</th>
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
              currentItems.map((f, index) => {
                const isPayee = f.montant_paye >= f.montant || f.date_reglement !== null;
                
                return (
                  <tr key={`${f.id}-${index}`}>
                    <td className="text-bold">
                      {f.periode_label}
                      <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal' }}>Réf: {f.id}</div>
                    </td>
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
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-icon" 
                        title="Imprimer cette facture"
                        onClick={() => onPrint(f)} 
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Précédent
          </button>
          
          <span className="pagination-info">
            Page {currentPage} sur {totalPages}
          </span>

          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};
