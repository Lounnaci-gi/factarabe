import React from 'react';
import type { Facture } from '../types';

interface PaymentDurationChartProps {
  factures: Facture[];
}

export const PaymentDurationChart: React.FC<PaymentDurationChartProps> = ({ factures }) => {
  // On ne s'intéresse qu'aux factures payées
  const paidFactures = factures
    .filter(f => f.date_reglement)
    .sort((a, b) => a.date_fact.localeCompare(b.date_fact));

  if (paidFactures.length === 0) return null;

  // Calcul des délais en jours
  const data = paidFactures.map(f => {
    const start = new Date(f.date_fact);
    const end = new Date(f.date_reglement!);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      label: f.periode_label,
      days: diffDays
    };
  });

  // Stats
  const avgDays = Math.round(data.reduce((sum, d) => sum + d.days, 0) / data.length);
  const maxDays = Math.max(...data.map(d => d.days));

  // On limite aux 10 dernières pour la lisibilité
  const displayData = data.slice(-10);

  return (
    <div className="card" style={{ direction: 'rtl', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>مدة التسديد (بالأيام)</div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>متوسط المدة: <span style={{ fontWeight: 'bold', color: '#3B82F6' }}>{avgDays} يوم</span></div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '12px', 
        height: '150px', 
        paddingBottom: '25px',
        borderBottom: '1px solid #E2E8F0',
        position: 'relative'
      }}>
        {displayData.map((d, i) => {
          const heightPercent = Math.max(10, (d.days / maxDays) * 100);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
              {/* Tooltip-like value */}
              <div style={{ 
                fontSize: '10px', 
                fontWeight: 'bold', 
                color: d.days > 60 ? '#EF4444' : '#10B981'
              }}>
                {d.days}
              </div>
              
              {/* Bar */}
              <div style={{ 
                width: '100%', 
                height: `${heightPercent}%`, 
                backgroundColor: d.days > 60 ? '#FEE2E2' : '#D1FAE5',
                borderTop: `3px solid ${d.days > 60 ? '#EF4444' : '#10B981'}`,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease'
              }} />

              {/* Label */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-25px', 
                fontSize: '9px', 
                color: '#64748b', 
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'center'
              }}>
                {d.label}
              </div>
            </div>
          );
        })}

        {/* Y-Axis Label */}
        <div style={{ 
          position: 'absolute', 
          right: '-30px', 
          top: '0', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          fontSize: '9px',
          color: '#94A3B8'
        }}>
          <span>{maxDays}</span>
          <span>0</span>
        </div>
      </div>
      
      <div style={{ marginTop: '35px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
        * يوضح هذا المبيان المدة الزمنية المستغرقة بين تاريخ إصدار الفاتورة وتاريخ تسديدها (آخر 10 فواتير).
      </div>
    </div>
  );
};
