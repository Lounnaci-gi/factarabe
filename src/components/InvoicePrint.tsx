import React from 'react';
import type { Abonne, Facture } from '../types';
import { calcDetailFacture, formatDZD, type FactureCalc } from '../utils/calcFacture';

// ─────────────────────────────────────────────────────────────
// Mapping Facture → FactureCalc
// ─────────────────────────────────────────────────────────────

const toFactureCalc = (facture: Facture): FactureCalc => ({
  type: facture.calc_data?.type || '',
  typabon: Number(facture.calc_data?.typabon ?? 10),

  qe11: Number(facture.calc_data?.qe11 ?? 0), pe11: Number(facture.calc_data?.pe11 ?? 0),
  qe12: Number(facture.calc_data?.qe12 ?? 0), pe12: Number(facture.calc_data?.pe12 ?? 0),
  qe13: Number(facture.calc_data?.qe13 ?? 0), pe13: Number(facture.calc_data?.pe13 ?? 0),
  qe14: Number(facture.calc_data?.qe14 ?? 0), pe14: Number(facture.calc_data?.pe14 ?? 0),

  qeun: Number(facture.calc_data?.qeun ?? 0), peun: Number(facture.calc_data?.peun ?? 0),

  pa11: Number(facture.calc_data?.pa11 ?? 0), pa12: Number(facture.calc_data?.pa12 ?? 0),
  pa13: Number(facture.calc_data?.pa13 ?? 0), pa14: Number(facture.calc_data?.pa14 ?? 0),
  paun: Number(facture.calc_data?.paun ?? 0),

  rfa: Number(facture.calc_data?.rfa ?? 0),
  tvrfa: Number(facture.calc_data?.tvrfa ?? 0),
  rfass: Number(facture.calc_data?.rfass ?? 0),

  tveau: Number(facture.calc_data?.tveau ?? 0),
  tvass: Number(facture.calc_data?.tvass ?? 0),
  ass: Number(facture.calc_data?.ass ?? 0),
  rqe: Number(facture.calc_data?.rqe ?? 0),
  ree: Number(facture.calc_data?.ree ?? 0),
  rdg: Number(facture.calc_data?.rdg ?? 0),

  qte: Number(facture.calc_data?.qte ?? 0),
});

// ─────────────────────────────────────────────────────────────
// Label état compteur
// ─────────────────────────────────────────────────────────────

const getEtatCptLabel = (etat: string | number | undefined | null): string | number | undefined | null => {
  if (!etat) return etat;
  const str = String(etat).toUpperCase();

  if (str.includes('EN MARCHE')) return 'في الخدمة';
  if (str.includes("PAS D'EAU") || str.includes("PAS D EAU")) return 'بدون ماء';
  if (str.includes('LIGNE INUTILISEE') || str.includes('LIGNE INUTILISÉE')) return 'خط غير مستخدم';
  if (str.includes('DEPASSEMENT INDEX') || str.includes('DÉPASSEMENT INDEX')) return 'تجاوز المؤشر';
  if (str.includes('COMPTEUR COUPE') || str.includes('COMPTEUR COUPÉ')) return 'عداد مقطوع';
  if (str.includes('PUIT')) return 'بئر';
  if (str.includes('LOT DE TERRAIN')) return 'قطعة أرض';
  if (str.includes('NICHE FERMEE') || str.includes('NICHE FERMÉE')) return 'خزانة مغلقة';
  if (str.includes('MAISON INHABITEE') || str.includes('MAISON INHABITÉ')) return 'منزل غير مسكون';
  if (str.includes("A L'ARRET") || str.includes("A L ARRET") || str.includes("À L'ARRÊT")) return 'متوقف';
  if (str.includes('SANS COMPTEUR')) return 'بدون عداد';
  if (str.includes('RESILIE') || str.includes('RÉSILIÉ')) return 'ملغى';
  if (str.includes('NON BRANCHE') || str.includes('NON BRANCHÉ')) return 'غير موصول';

  const num = Number(etat);
  if (!isNaN(num)) {
    const map: Record<number, string> = {
      10: 'في الخدمة', 11: 'بدون ماء', 12: 'خط غير مستخدم',
      13: 'تجاوز المؤشر', 14: 'عداد مقطوع', 15: 'بئر',
      16: 'قطعة أرض', 17: 'خزانة مغلقة', 18: 'منزل غير مسكون',
      19: 'خط غير مستخدم', 20: 'متوقف', 30: 'بدون عداد',
      40: 'ملغى', 41: 'غير موصول',
    };
    if (map[num]) return map[num];
  }
  return etat;
};

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

interface InvoicePrintProps {
  abonne: Abonne;
  facture: Facture;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ abonne, facture }) => {
  const fc = toFactureCalc(facture);
  const detail = calcDetailFacture(fc);
  const timbre = Number(facture.timbre ?? 0);
  const netAPayer = Math.round((detail.montantTTC + timbre) * 100) / 100;

  return (
    <div className="print-container">

      {/* ======================================================= */}
      {/* BLOC HAUT DROITE : Unité / Secteur / Caisse             */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', right: '4cm', top: '3.2cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.nom_unite_arabe || abonne.nom_unite}
      </div>

      <div style={{ position: 'absolute', right: '4cm', top: '4cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.nom_secteur_arabe || abonne.nom_secteur}
      </div>

      <div style={{ position: 'absolute', right: '4cm', top: '4.8cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold' }}>
        {abonne.nom_caisse_arabe || abonne.nom_caisse}
      </div>

      {/* ======================================================= */}
      {/* BLOC CENTRAL : Numéro Facture / Période / Date Saisie   */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '7cm', top: '3.2cm', width: '4cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.numab} / {facture.date_fact.slice(0, 7)}
      </div>

      <div style={{ position: 'absolute', left: '7cm', top: '4cm', width: '5cm', textAlign: 'left', direction: 'rtl', whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        من {facture.date_releve_prec.split('-').reverse().join('/')} إلى {facture.date_releve.split('-').reverse().join('/')}
      </div>

      <div style={{ position: 'absolute', left: '7cm', top: '4.8cm', width: '4cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {facture.date_saisie.split('-').reverse().join('/')}
      </div>

      {/* ======================================================= */}
      {/* BLOC GAUCHE : Dates Relevés                             */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '2cm', top: '3.2cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {facture.date_releve.split('-').reverse().join('/')}
      </div>

      <div style={{ position: 'absolute', left: '2cm', top: '4cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {facture.date_prochain_releve.split('-').reverse().join('/')}
      </div>

      <div style={{ position: 'absolute', left: '2cm', top: '4.8cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {facture.date_prochaine_facture.split('-').reverse().join('/')}
      </div>

      {/* ======================================================= */}
      {/* BLOC ABONNÉ — COLONNE GAUCHE : Compteur                 */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '4cm', top: '5.8cm', fontFamily: 'inherit', fontSize: '12px', direction: 'ltr' }}>
        {abonne.num_serie} {getEtatCptLabel(facture.etat_cpt)}
      </div>

      <div style={{ position: 'absolute', left: '5cm', top: '6.5cm', fontFamily: 'inherit', fontSize: '12px' }}>
        {facture.ancien_index}
      </div>

      <div style={{ position: 'absolute', left: '5cm', top: '7.1cm', fontFamily: 'inherit', fontSize: '12px' }}>
        {facture.nouveau_index}
      </div>

      <div style={{ position: 'absolute', left: '5cm', top: '7.8cm', fontFamily: 'inherit', fontSize: '12px', direction: 'rtl' }}>
        {facture.consommation} <sup>3</sup>م
      </div>

      {/* ======================================================= */}
      {/* BLOC ABONNÉ — COLONNE DROITE : Identification Client    */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', right: '6cm', top: '5.8cm', width: '8cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.code_unite} {abonne.code_secteur} {abonne.echelon} {abonne.numab} (TRN : {abonne.tournee})
      </div>

      <div style={{ position: 'absolute', right: '4cm', top: '6.5cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.raw_type_abonne} - {abonne.type_abonne_arabe || abonne.type_abonne}
      </div>

      <div style={{ position: 'absolute', right: '4cm', top: '7.1cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold' }}>
        {abonne.nom_arabe || abonne.nom_prenom}
      </div>

      <div style={{ position: 'absolute', right: '4cm', top: '7.9cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {abonne.rue_arabe || abonne.adresse}
        {abonne.bloc_arabe ? ` - عمارة: ${abonne.bloc_arabe}` : ''}
        {abonne.ndom_arabe ? ` - رقم: ${abonne.ndom_arabe}` : ''}
      </div>

      {/* ======================================================= */}
      {/* BLOC TRANCHES EAU (TYPE='E' groupe A uniquement)        */}
      {/* ======================================================= */}

      {fc.type === 'E' && fc.typabon >= 10 && fc.typabon <= 19 && fc.typabon !== 15 && (
        <>
          {fc.qe11 > 0 && (
            <>
              <div style={{ position: 'absolute', right: '10cm', top: '10cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe11}</div>
              <div style={{ position: 'absolute', right: '14cm', top: '10cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.pe11)}</div>
              <div style={{ position: 'absolute', right: '17cm', top: '10cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.qe11 * fc.pe11)}</div>
              <div style={{ position: 'absolute', right: '10cm', top: '14cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe11}</div>
            </>
          )}
          {fc.qe12 > 0 && (
            <>
              <div style={{ position: 'absolute', right: '10cm', top: '10.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe12}</div>
              <div style={{ position: 'absolute', right: '14cm', top: '10.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.pe12)}</div>
              <div style={{ position: 'absolute', right: '17cm', top: '10.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.qe12 * fc.pe12)}</div>
              <div style={{ position: 'absolute', right: '10cm', top: '14.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe12}</div>
            </>
          )}
          {fc.qe13 > 0 && (
            <>
              <div style={{ position: 'absolute', right: '10cm', top: '11cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe13}</div>
              <div style={{ position: 'absolute', right: '14cm', top: '11cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.pe13)}</div>
              <div style={{ position: 'absolute', right: '17cm', top: '11cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.qe13 * fc.pe13)}</div>
              <div style={{ position: 'absolute', right: '10cm', top: '15cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe13}</div>
            </>
          )}
          {fc.qe14 > 0 && (
            <>
              <div style={{ position: 'absolute', right: '10cm', top: '11.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe14}</div>
              <div style={{ position: 'absolute', right: '14cm', top: '11.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.pe14)}</div>
              <div style={{ position: 'absolute', right: '17cm', top: '11.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{formatDZD(fc.qe14 * fc.pe14)}</div>
              <div style={{ position: 'absolute', right: '10cm', top: '15.5cm', fontFamily: 'inherit', fontSize: '11px' }}>{fc.qe14}</div>
            </>
          )}
        </>
      )}

      {/* ======================================================= */}
      {/* MONTANTS CALCULÉS                                        */}
      {/* ======================================================= */}

      {/* Sous-total Eau HT */}
      <div style={{ position: 'absolute', right: '17cm', top: '12cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {formatDZD(detail.eauHT + detail.rfaHT)}
      </div>

      {/* RFA */}
      {detail.rfaHT > 0 && (
        <div style={{ position: 'absolute', right: '17cm', top: '9.5cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(detail.rfaHT)}
        </div>
      )}

      {/* Sous-total Assainissement HT */}
      {detail.assHT > 0 && (
        <div style={{ position: 'absolute', right: '1cm', top: '17.8cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
          {formatDZD(detail.assHT)}
        </div>
      )}

      {/* RFASS */}
      {detail.rfassHT > 0 && (
        <div style={{ position: 'absolute', right: '17cm', top: '13.5cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(detail.rfassHT)}
        </div>
      )}

      {/* Sous-total HT (1)+(2) */}
      <div style={{ position: 'absolute', right: '1cm', top: '19.2cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'bold' }}>
        {formatDZD(detail.montantHT)}
      </div>

      {/* TVA Eau */}
      {detail.tvaEau > 0 && (
        <>
          <div style={{ position: 'absolute', right: '7cm', top: '20.5cm', fontFamily: 'inherit', fontSize: '11px' }}>
            {fc.tveau}%
          </div>
          <div style={{ position: 'absolute', right: '1cm', top: '20.5cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
            {formatDZD(detail.tvaEau)}
          </div>
        </>
      )}

      {/* RDG */}
      {detail.rdgMontant > 0 && (
        <div style={{ position: 'absolute', right: '1cm', top: '21.8cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(detail.rdgMontant)}
        </div>
      )}

      {/* RQE */}
      {detail.rqeMontant > 0 && (
        <div style={{ position: 'absolute', right: '1cm', top: '22.4cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(detail.rqeMontant)}
        </div>
      )}

      {/* REE */}
      {detail.reeMontant > 0 && (
        <div style={{ position: 'absolute', right: '1cm', top: '23.0cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(detail.reeMontant)}
        </div>
      )}

      {/* Montant de la Facture TTC */}
      <div style={{ position: 'absolute', right: '1cm', top: '24.5cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '12px', fontWeight: 'bold' }}>
        {formatDZD(detail.montantTTC)}
      </div>

      {/* Timbre */}
      {timbre > 0 && (
        <div style={{ position: 'absolute', right: '1cm', top: '25.8cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(timbre)}
        </div>
      )}

      {/* Net à Payer */}
      <div style={{ position: 'absolute', right: '1cm', top: '26.5cm', width: '4cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold' }}>
        {formatDZD(netAPayer)}
      </div>

      {/* ======================================================= */}
      {/* CODE-BARRES                                              */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '15cm', top: '5.8cm', height: '0.4cm', overflow: 'hidden' }}>
        <img
          src={`https://barcodeapi.org/api/128/${abonne.numab}`}
          alt="Barcode"
          style={{ height: '0.8cm', minWidth: '3.5cm', display: 'block' }}
        />
      </div>

    </div>
  );
};
