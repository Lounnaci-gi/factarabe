import React from 'react';
import type { Abonne, Facture } from '../types';
import { formatDZD } from '../utils/calcFacture';

interface InvoicesTablePrintProps {
  abonne: Abonne;
  factures: Facture[];
}

export const InvoicesTablePrint: React.FC<InvoicesTablePrintProps> = ({ abonne, factures }) => {
  return (
    <div className="print-table-container" style={{ padding: '20px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ margin: 0 }}>كشف الفواتير</h2>
          <h3 style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>Historique des Factures</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{abonne.nom_arabe || abonne.nom_prenom}</div>
          <div>رقم الاشتراك: {abonne.numab}</div>
          <div>{abonne.type_abonne_arabe || abonne.type_abonne}</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={thStyle}>الفترة</th>
            <th style={thStyle}>المرجع</th>
            <th style={thStyle}>غير مدفوعة</th>
            <th style={thStyle}>مدفوعة</th>
            <th style={thStyle}>تاريخ الدفع</th>
            <th style={thStyle}>الطريقة</th>
            <th style={thStyle}>رقم الوصل</th>
          </tr>
        </thead>
        <tbody>
          {factures.map((f, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tdStyle}>{f.periode_label}</td>
              <td style={tdStyle}>{f.id}</td>
              <td style={{ ...tdStyle, color: f.date_reglement ? '#ccc' : '#d32f2f', fontWeight: f.date_reglement ? 'normal' : 'bold' }}>
                {!f.date_reglement ? formatDZD(f.montant) : '-'}
              </td>
              <td style={{ ...tdStyle, color: f.date_reglement ? '#2e7d32' : '#ccc' }}>
                {f.date_reglement ? formatDZD(f.montant) : '-'}
              </td>
              <td style={tdStyle}>{f.date_reglement ? f.date_reglement.split('-').reverse().join('/') : '-'}</td>
              <td style={tdStyle}>
                {(() => {
                  const p = f.paiement;
                  if (p === 'ES') return 'نقدا';
                  if (p === 'CB') return 'صك بنكي';
                  if (p === 'CP') return 'صك بريدي';
                  if (p === 'VB') return 'تحويل بنكي';
                  if (p === 'VP') return 'تحويل بريدي';
                  if (p === 'EP') return 'دفع إلكتروني';
                  if (p === 'TP') return 'دفع عبر جهاز TPE';
                  if (p === 'MP') return 'دفع عبر الهاتف المحمول';
                  if (p === 'PT') return 'دفع بريدي';
                  return p || '-';
                })()}
              </td>
              <td style={tdStyle}>{f.numrec || '-'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
            <td colSpan={2} style={tdStyle}>المجموع الإجمالي</td>
            <td style={{ ...tdStyle, color: '#d32f2f' }}>
              {formatDZD(factures.filter(f => !f.date_reglement).reduce((sum, f) => sum + f.montant, 0))}
            </td>
            <td style={{ ...tdStyle, color: '#2e7d32' }}>
              {formatDZD(factures.filter(f => f.date_reglement).reduce((sum, f) => sum + f.montant, 0))}
            </td>
            <td colSpan={3} style={tdStyle}></td>
          </tr>
        </tfoot>
      </table>

      <div style={{ marginTop: '30px', textAlign: 'left', fontStyle: 'italic', fontSize: '10px' }}>
        تم استخراج هذا المستند بتاريخ {new Date().toLocaleDateString('ar-DZ')} على الساعة {new Date().toLocaleTimeString('ar-DZ')}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
};
