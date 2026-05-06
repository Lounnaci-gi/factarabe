import React from 'react';
import type { Facture } from '../types';
import { formatDZD } from '../utils/calcFacture';

interface PaymentStatsProps {
  factures: Facture[];
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ factures }) => {
  const total = factures.length;
  if (total === 0) return null;

  const paidCount = factures.filter(f => f.date_reglement).length;
  const unpaidCount = total - paidCount;

  const paidPercent = Math.round((paidCount / total) * 100);
  const unpaidPercent = 100 - paidPercent;

  const paidAmount = factures.filter(f => f.date_reglement).reduce((sum, f) => sum + f.montant, 0);
  const unpaidAmount = factures.filter(f => !f.date_reglement).reduce((sum, f) => sum + f.montant, 0);

  // SVG Donut params
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const paidOffset = circumference - (paidPercent / 100) * circumference;

  return (
    <div className="card" style={{ direction: 'rtl', display: 'flex', gap: '24px', alignItems: 'center', padding: '20px' }}>
      {/* Chart Column */}
      <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background Circle (Unpaid) */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#FEF2F2"
            strokeWidth="12"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#EF4444"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
          />
          {/* Paid Segment */}
          <circle
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="#10B981"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={paidOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#374151'
        }}>
          {paidPercent}%
        </div>
      </div>

      {/* Info Column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>إحصائيات الدفع (بالعدد والمبلغ)</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Paid Section */}
          <div style={{ backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '8px', borderRight: '4px solid #10B981' }}>
            <div style={{ color: '#15803D', fontSize: '12px' }}>فواتير مدفوعة ({paidCount})</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534' }}>{formatDZD(paidAmount)}</div>
            <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>نسبة: {paidPercent}%</div>
          </div>

          {/* Unpaid Section */}
          <div style={{ backgroundColor: '#FEF2F2', padding: '10px', borderRadius: '8px', borderRight: '4px solid #EF4444' }}>
            <div style={{ color: '#B91C1C', fontSize: '12px' }}>فواتير غير مدفوعة ({unpaidCount})</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#991B1B' }}>{formatDZD(unpaidAmount)}</div>
            <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '2px' }}>نسبة: {unpaidPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
