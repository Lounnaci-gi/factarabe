import React, { useState } from 'react';
import type { Facture } from '../types';
import { calcDetailFacture, formatDZD, calculerTimbre } from '../utils/calcFacture';
import type { FactureCalc } from '../utils/calcFacture';

// ─── Conversion Facture → FactureCalc ────────────────────────
const toFC = (f: Facture): FactureCalc => ({
  type: f.calc_data?.type || '',
  typabon: Number(f.calc_data?.typabon ?? 10),
  qe11: Number(f.calc_data?.qe11 ?? 0), pe11: Number(f.calc_data?.pe11 ?? 0),
  qe12: Number(f.calc_data?.qe12 ?? 0), pe12: Number(f.calc_data?.pe12 ?? 0),
  qe13: Number(f.calc_data?.qe13 ?? 0), pe13: Number(f.calc_data?.pe13 ?? 0),
  qe14: Number(f.calc_data?.qe14 ?? 0), pe14: Number(f.calc_data?.pe14 ?? 0),
  qeun: Number(f.calc_data?.qeun ?? 0), peun: Number(f.calc_data?.peun ?? 0),
  pa11: Number(f.calc_data?.pa11 ?? 0), pa12: Number(f.calc_data?.pa12 ?? 0),
  pa13: Number(f.calc_data?.pa13 ?? 0), pa14: Number(f.calc_data?.pa14 ?? 0),
  paun: Number(f.calc_data?.paun ?? 0),
  rfa:   Number(f.calc_data?.rfa   ?? 0),
  tvrfa: Number(f.calc_data?.tvrfa ?? 0),
  rfass: Number(f.calc_data?.rfass ?? 0),
  tveau: Number(f.calc_data?.tveau ?? 0),
  tvass: Number(f.calc_data?.tvass ?? 0),
  ass:   Number(f.calc_data?.ass   ?? 0),
  rqe:   Number(f.calc_data?.rqe   ?? 0),
  ree:   Number(f.calc_data?.ree   ?? 0),
  rdg:   Number(f.calc_data?.rdg   ?? 0),
  qte:   Number(f.calc_data?.qte   ?? 0),
});

// ─── Mapping état compteur ────────────────────────────────────
const getEtatCptLabel = (etat: string | number | undefined | null) => {
  if (!etat) return etat;
  const num = Number(etat);
  if (isNaN(num)) return etat;
  const map: Record<number, string> = {
    10: 'في الخدمة', 11: 'بدون ماء', 12: 'خط غير مستخدم',
    13: 'تجاوز المؤشر', 14: 'عداد مقطوع', 15: 'بئر',
    16: 'قطعة أرض', 17: 'خزانة مغلقة', 18: 'منزل غير مسكون',
    19: 'خط غير مستخدم', 20: 'متوقف', 30: 'بدون عداد',
    40: 'ملغى', 41: 'غير موصول',
  };
  return map[num] ?? etat;
};

// ─── Panneau détail tranches ──────────────────────────────────
interface FactureDetailProps {
  facture: Facture;
  allFactures: Facture[];
}

const FactureDetail: React.FC<FactureDetailProps> = ({ facture, allFactures }) => {
  const fc     = toFC(facture);
  const d      = calcDetailFacture(fc);
  const isE    = fc.type === 'E';
  const typ    = fc.typabon;
  const isA    = isE && typ >= 10 && typ <= 19 && typ !== 15;
  const isB    = isE && typ === 15;
  const isCD   = isE && (typ >= 20 || typ === 30);
  // Calcul dynamique des dus antérieurs
  const dusAnterieurs = allFactures
    .filter(f => f.date_fact < facture.date_fact && !f.date_reglement)
    .reduce((sum, f) => sum + f.montant, 0);

  const timbre = facture.date_reglement
    ? Number(facture.timbre ?? 0)
    : calculerTimbre(d.montantTTC + dusAnterieurs);

  const netAPayer = Math.round((d.montantTTC + dusAnterieurs + timbre) * 100) / 100;

  const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '3px 14px', color: '#64748b', fontSize: '12px', direction: 'rtl', textAlign: 'right' }}>
        {label}
      </td>
      <td style={{ padding: '3px 14px', fontWeight: bold ? 'bold' : 'normal', textAlign: 'right', fontSize: '12px', fontFamily: 'monospace', minWidth: '120px' }}>
        {value}
      </td>
    </tr>
  );

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '4px 8px 10px 8px', padding: '10px 16px', direction: 'rtl' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e0f2fe' }}>
            <th style={{ padding: '5px 14px', fontSize: '12px', textAlign: 'right', color: '#0369a1', fontWeight: '600' }}>البيان</th>
            <th style={{ padding: '5px 14px', fontSize: '12px', textAlign: 'right', color: '#0369a1', fontWeight: '600', minWidth: '120px' }}>المبلغ (دج)</th>
          </tr>
        </thead>
        <tbody>
          {/* ── Tranches eau Groupe A ── */}
          {isA && fc.qe11 > 0 && <Row label={`الشريحة 1 — ${fc.qe11} م³ × ${formatDZD(fc.pe11)}`} value={formatDZD(fc.qe11 * fc.pe11)} />}
          {isA && fc.qe12 > 0 && <Row label={`الشريحة 2 — ${fc.qe12} م³ × ${formatDZD(fc.pe12)}`} value={formatDZD(fc.qe12 * fc.pe12)} />}
          {isA && fc.qe13 > 0 && <Row label={`الشريحة 3 — ${fc.qe13} م³ × ${formatDZD(fc.pe13)}`} value={formatDZD(fc.qe13 * fc.pe13)} />}
          {isA && fc.qe14 > 0 && <Row label={`الشريحة 4 — ${fc.qe14} م³ × ${formatDZD(fc.pe14)}`} value={formatDZD(fc.qe14 * fc.pe14)} />}

          {/* ── Tranche unique (Puits / Industriel / Grand compte / hors-E) ── */}
          {(isB || isCD || !isE) && fc.qeun > 0 && (
            <Row label={`ماء — ${fc.qeun} م³ × ${formatDZD(fc.peun)}`} value={formatDZD(fc.qeun * fc.peun)} />
          )}

          {/* ── Sous-total Eau HT ── */}
          <Row label="مجموع الماء HT" value={formatDZD(d.eauHT)} bold />

          {/* ── RFA ── */}
          {d.rfaHT > 0 && <Row label="اشتراك ثابت ماء (RFA)" value={formatDZD(d.rfaHT)} />}

          {/* ── Sous-total Eau ── */}
          {(d.sousTotal1 > 0) && (
            <Row label="مجموع الماء (1) HT" value={formatDZD(d.sousTotal1)} bold />
          )}

          {/* ── Assainissement ── */}
          {d.assHT > 0   && <Row label="صرف صحي HT"               value={formatDZD(d.assHT)} />}
          {d.rfassHT > 0 && <Row label="اشتراك ثابت صرف (RFASS)"  value={formatDZD(d.rfassHT)} />}

          {/* ── Sous-total Assainissement ── */}
          {(d.sousTotal2 > 0) && (
            <Row label="مجموع التطهير (2) HT" value={formatDZD(d.sousTotal2)} bold />
          )}

          {/* ── Redevances annexes ── */}
          {d.rdgMontant > 0 && <Row label="رسم التسيير (RDG)"             value={formatDZD(d.rdgMontant)} />}
          {d.rqeMontant > 0 && <Row label="رسم جودة الماء (RQE)"          value={formatDZD(d.rqeMontant)} />}
          {d.reeMontant > 0 && <Row label="رسم ترشيد الاستهلاك (REE)"     value={formatDZD(d.reeMontant)} />}

          {/* ── Total HT ── */}
          <tr style={{ background: '#f0fdf4', borderTop: '2px solid #86efac' }}>
            <td style={{ padding: '5px 14px', fontWeight: 'bold', fontSize: '12px', direction: 'rtl', textAlign: 'right', color: '#166534' }}>
              المجموع (1)+(2) خارج الرسم HT
            </td>
            <td style={{ padding: '5px 14px', fontWeight: 'bold', fontSize: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#166534' }}>
              {formatDZD(d.sousTotal12)}
            </td>
          </tr>

          {/* ── TVA ── */}
          {d.tvaEau > 0 && <Row label={`TVA ماء (${fc.tveau}%)`}  value={formatDZD(d.tvaEau)} />}
          {d.tvaAss > 0 && <Row label={`TVA صرف (${fc.tvass}%)`}  value={formatDZD(d.tvaAss)} />}

          {/* ── Total TTC ── */}
          <tr style={{ background: '#eff6ff', borderTop: '2px solid #93c5fd' }}>
            <td style={{ padding: '5px 14px', fontWeight: 'bold', fontSize: '13px', direction: 'rtl', textAlign: 'right', color: '#1e40af' }}>
              المبلغ الإجمالي TTC
            </td>
            <td style={{ padding: '5px 14px', fontWeight: 'bold', fontSize: '13px', textAlign: 'right', fontFamily: 'monospace', color: '#1e40af' }}>
              {formatDZD(d.montantTTC)}
            </td>
          </tr>

          {/* ── Timbre ── */}
          {timbre > 0 && <Row label="طابع" value={formatDZD(timbre)} />}

          {/* ── Dues Antérieurs ── */}
          {dusAnterieurs > 0 && (
            <Row label="ديون سابقة (Dues Antérieurs)" value={formatDZD(dusAnterieurs)} />
          )}

          {/* ── Net à payer ── */}
          <tr style={{ background: '#fef3c7', borderTop: '2px solid #fbbf24' }}>
            <td style={{ padding: '6px 14px', fontWeight: 'bold', fontSize: '14px', direction: 'rtl', textAlign: 'right', color: '#92400e' }}>
              صافي المبلغ الواجب دفعه
            </td>
            <td style={{ padding: '6px 14px', fontWeight: 'bold', fontSize: '14px', textAlign: 'right', fontFamily: 'monospace', color: '#92400e' }}>
              {formatDZD(netAPayer)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ─── Props ────────────────────────────────────────────────────
interface FacturesListProps {
  factures: Facture[];
  onPrint: (facture: Facture) => void;
  onPrintTable: () => void;
}

// ─── Composant principal ──────────────────────────────────────
export const FacturesList: React.FC<FacturesListProps> = ({ factures, onPrint, onPrintTable }) => {
  const [currentPage,  setCurrentPage]  = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'payee' | 'impayee'>('all');
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const itemsPerPage = 15;

  // Filtrage
  const filteredFactures = factures.filter(f => {
    const isPayee = f.montant_paye >= f.montant || f.date_reglement !== null;
    if (statusFilter === 'payee')   return isPayee;
    if (statusFilter === 'impayee') return !isPayee;
    return true;
  });

  // Pagination
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = filteredFactures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginate = (n: number) => setCurrentPage(n);

  return (
    <div className="card">
      {/* En-tête avec filtre */}
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
            onChange={e => {
              setStatusFilter(e.target.value as 'all' | 'payee' | 'impayee');
              setCurrentPage(1);
            }}
          >
            <option value="all">Toutes les factures</option>
            <option value="payee">Factures Payées</option>
            <option value="impayee">Factures Impayées</option>
          </select>
          <button
            className="pagination-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
            onClick={onPrintTable}
          >
            🖨️ Imprimer Liste
          </button>
        </div>
      </div>

      {/* Tableau */}
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
              <th>Date de Paiement</th>
              <th>État Cpt</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactures.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: '#9CA3AF' }}>
                  Aucune facture trouvée.
                </td>
              </tr>
            ) : (
              currentItems.map((f, index) => {
                const isPayee = f.montant_paye >= f.montant || f.date_reglement !== null;
                const isExpanded = expandedId === f.id;
                return (
                  <React.Fragment key={`fr-${f.id}-${index}`}>
                    <tr
                      style={{ cursor: 'pointer', background: isExpanded ? '#f0f9ff' : undefined }}
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                    >
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
                          <span className="badge badge-success">Payée</span>
                        ) : (
                          <span className="badge badge-error">Impayée</span>
                        )}
                      </td>
                      <td>
                        {isPayee && f.date_reglement ? f.date_reglement : '-'}
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
                          onClick={e => { e.stopPropagation(); onPrint(f); }}
                        >
                          🖨️
                        </button>
                      </td>
                    </tr>

                    {/* ── Panneau de détail tranches ── */}
                    {isExpanded && (
                      <tr key={f.id + '-detail'}>
                        <td colSpan={10} style={{ padding: '0', background: 'transparent' }}>
                          <FactureDetail facture={f} allFactures={factures} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
            Précédent
          </button>
          <span className="pagination-info">Page {currentPage} sur {totalPages}</span>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};
