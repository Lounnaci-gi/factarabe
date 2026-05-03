import React, { useState } from 'react';
import type { Facture } from '../types';

const getEtatCptLabel = (etat: string | number | undefined | null) => {
  if (!etat) return etat;
  const num = Number(etat);
  if (isNaN(num)) return etat;
  
  switch (num) {
    case 10: return 'في الخدمة'; // EN MARCHE
    case 11: return 'بدون ماء'; // PAS D'EAU
    case 12: return 'خط غير مستخدم'; // LIGNE INUTILISEE
    case 13: return 'تجاوز المؤشر'; // DEPASSEMENT INDEX
    case 14: return 'عداد مقطوع'; // COMPTEUR COUPE
    case 15: return 'بئر'; // PUIT
    case 16: return 'قطعة أرض'; // LOT DE TERRAIN
    case 17: return 'خزانة مغلقة'; // NICHE FERMEE
    case 18: return 'منزل غير مسكون'; // MAISON INHABITEE
    case 19: return 'خط غير مستخدم'; // LIGNE INUTILISEE
    case 20: return 'متوقف'; // A l'ARRET
    case 30: return 'بدون عداد'; // SANS COMPTEUR
    case 40: return 'ملغى'; // RESILIE
    case 41: return 'غير موصول'; // NON BRANCHE
    default: return etat;
  }
};

interface FacturesListProps {
  factures: Facture[];
  onPrint: (facture: Facture) => void;
}

export const FacturesList: React.FC<FacturesListProps> = ({ factures, onPrint }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'payee' | 'impayee'>('all');
  const itemsPerPage = 15;

  // Filtrage des factures
  const filteredFactures = factures.filter(f => {
    const isPayee = f.montant_paye >= f.montant || f.date_reglement !== null;
    if (statusFilter === 'payee') return isPayee;
    if (statusFilter === 'impayee') return !isPayee;
    return true;
  });

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFactures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span>Historique des Factures</span>
          <span className="text-muted" style={{ fontSize: '12px', marginLeft: '12px' }}>
            {filteredFactures.length} affichées sur {factures.length}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', color: '#6B7280' }}>Filtrer par :</label>
          <select 
            className="rtl-input" 
            style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'payee' | 'impayee');
              setCurrentPage(1); // Reset pagination
            }}
          >
            <option value="all">Toutes les factures</option>
            <option value="payee">Factures Payées</option>
            <option value="impayee">Factures Impayées</option>
          </select>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Période / Réf</th>
              <th>Date Facturation</th>
              <th>Ancien</th>
              <th>Nouveau</th>
              <th>Conso</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>État Cpt</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactures.length === 0 ? (
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
                    <td>{f.ancien_index}</td>
                    <td>{f.nouveau_index}</td>
                    <td className="text-bold" style={{ color: '#2563EB' }}>{f.consommation} m³</td>
                    <td className="text-bold" style={{ textAlign: 'right', paddingRight: '32px' }}>
                      {f.montant.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DZD
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
                      <span className="badge" style={{ backgroundColor: '#e2e8f0', color: '#475569', direction: 'rtl', display: 'inline-block' }}>
                        {getEtatCptLabel(f.etat_cpt)}
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
