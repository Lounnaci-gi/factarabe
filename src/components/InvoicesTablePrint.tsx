import React from 'react';
import type { Abonne, Facture } from '../types';
import { formatDZD } from '../utils/calcFacture';
import { numberToArabicWords } from '../utils/arabicWords';
import adeLogo from '../ade.png';

interface InvoicesTablePrintProps {
  abonne: Abonne;
  factures: Facture[];
}

export const InvoicesTablePrint: React.FC<InvoicesTablePrintProps> = ({ abonne, factures }) => {
  const totalImpaye = factures.filter(f => !f.date_reglement).reduce((sum, f) => sum + f.montant, 0);
  const totalPaye = factures.filter(f => f.date_reglement).reduce((sum, f) => sum + f.montant, 0);
  
  // Récupérer l'état du compteur depuis la facture la plus récente
  const latestFacture = factures.length > 0 ? factures[factures.length - 1] : null;

  return (
    <div className="print-table-container" style={{ padding: '5px 20px 20px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <img src={adeLogo} alt="ADE Logo" style={{ height: '50px', objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '5px 0', borderBottom: '2px solid #333', marginBottom: '10px', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>كشف الفواتير</h2>
      </div>

      <div style={{ display: 'flex', gap: '40px', marginBottom: '25px', fontSize: '13px' }}>
        {/* Colonne de Droite */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <span style={{ color: '#64748b' }}>رقم الاشتراك: </span>
            <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{abonne.numab}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>السيد(ة): </span>
            <span style={{ fontWeight: 'bold' }}>{abonne.nom_arabe || abonne.nom_prenom}</span>
          </div>
          <div>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: '#64748b' }}>العنوان: </span>
            <span>
              {abonne.rue_arabe || abonne.adresse} 
              {abonne.bloc_arabe ? ` عمارة: ${abonne.bloc_arabe}` : ''}
              {abonne.ndom_arabe ? ` رقم: ${abonne.ndom_arabe}` : ''}
            </span>
          </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>نوع الاشتراك: </span>
            <span>{abonne.type_abonne_arabe || abonne.type_abonne}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>رقم العداد: </span>
            <span>{abonne.num_serie || '---'}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>حالة العداد: </span>
            <span>{latestFacture?.etat_cpt || '---'}</span>
          </div>
        </div>

        {/* Colonne du Milieu (Vide) */}
        <div style={{ flex: 1 }}></div>

        {/* Colonne de Gauche (Infos Administratives) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '20px', borderRight: '1px solid #eee' }}>
          <div>
            <span style={{ color: '#64748b' }}>الوحدة: </span>
            <span style={{ fontWeight: '500' }}>{abonne.nom_unite_arabe || abonne.nom_unite}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>القطاع: </span>
            <span style={{ fontWeight: '500' }}>{abonne.nom_secteur_arabe || abonne.nom_secteur}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>الصندوق: </span>
            <span style={{ fontWeight: '500' }}>{abonne.nom_caisse_arabe || abonne.nom_caisse}</span>
          </div>
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
            <td style={{ ...tdStyle, color: '#d32f2f' }}>{formatDZD(totalImpaye)}</td>
            <td style={{ ...tdStyle, color: '#2e7d32' }}>{formatDZD(totalPaye)}</td>
            <td colSpan={3} style={tdStyle}></td>
          </tr>
        </tfoot>
      </table>

      {totalImpaye > 0 && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', backgroundColor: '#fcfcfc', fontSize: '12px' }}>
          <strong>المبلغ الإجمالي غير المدفوع بالحروف:</strong>
          <div style={{ marginTop: '5px', color: '#1e40af', fontWeight: 'bold' }}>
            {numberToArabicWords(totalImpaye)}
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'left', fontStyle: 'italic', fontSize: '10px' }}>
        تم استخراج هذا المستند بتاريخ {new Date().toLocaleDateString('ar-DZ')} على الساعة {new Date().toLocaleTimeString('ar-DZ')}
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'right',
  backgroundColor: '#f2f2f2',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'right',
};
