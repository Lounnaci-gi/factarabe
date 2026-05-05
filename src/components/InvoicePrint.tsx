import React from 'react';
import type { Abonne, Facture } from '../types';
import { calcDetailFacture, formatDZD, type FactureCalc, calculerTimbre } from '../utils/calcFacture';

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

const getEtatCptLabel = (
  etat: string | number | undefined | null
): string | number | undefined | null => {
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
// Styles partagés (évite répétition)
// ─────────────────────────────────────────────────────────────

const colMontant = { fontFamily: 'inherit', fontSize: '11px' } as const;
const colPrix = { fontFamily: 'inherit', fontSize: '11px' } as const;
const colQte = { fontFamily: 'inherit', fontSize: '11px' } as const;

// Positions colonnes table Eau / Assainissement
const C_MONTANT = '17.5cm'; // Montant HT (colonne gauche)
const C_PRIX = '13.5cm'; // Prix unitaire
const C_QTE = '9cm'; // Quantité

// Positions colonnes section Taxes
const T_MONTANT = '17.5cm'; // Montant (DA)
const T_TAUX = '13.5cm';    // Taux
// L'assiette utilise désormais C_QTE pour l'alignement (10.5cm)

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

interface InvoicePrintProps {
  abonne: Abonne;
  facture: Facture;
  allFactures?: Facture[];
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ abonne, facture, allFactures }) => {
  const fc = toFactureCalc(facture);
  const detail = calcDetailFacture(fc);
  // Calcul dynamique des dus antérieurs : Somme des factures impayées strictement avant celle-ci
  const dusAnterieurs = allFactures
    ? allFactures
      .filter(f => f.date_fact < facture.date_fact && !f.date_reglement)
      .reduce((sum, f) => sum + f.montant, 0)
    : Number(facture.dus_anterieurs ?? 0);

  // Calcul du timbre : Si déjà payée (date_reglement présent), on garde le timbre original du DBF.
  // Si impayée, on calcule le timbre sur le total (TTC + Dus) selon la règle des 1%.
  const totalTTCPlusDus = detail.montantTTC + dusAnterieurs;
  const timbre = facture.date_reglement
    ? Number(facture.timbre ?? 0)
    : calculerTimbre(totalTTCPlusDus);
  const montantSansTimbre = detail.montantTTC + dusAnterieurs;
  const netAPayer = Math.round((montantSansTimbre + timbre) * 100) / 100;

  // Groupes d'affichage
  const isGroupeA = fc.type === 'E' && fc.typabon >= 10 && fc.typabon <= 19 && fc.typabon !== 15;
  const isTrUnique = fc.type === 'E' && (fc.typabon === 15 || fc.typabon >= 20);

  // Assiette TVA = Sous-Total HT (1)+(2)
  const tvaAssiette = detail.sousTotal12;
  // TVA total = tvaEau + tvaRfa + tvaRfass + tvaAss
  const tvaTotal = detail.tvaEau + detail.tvaRfa + detail.tvaRfass + detail.tvaAss;

  return (
    <div className="print-container">

      {/* ======================================================= */}
      {/* HAUT DROITE : Unité / Centre / Caisse                   */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', right: '4cm', top: '3.2cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.nom_unite_arabe || abonne.nom_unite}
      </div>
      <div style={{ position: 'absolute', right: '4cm', top: '4cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.nom_secteur_arabe || abonne.nom_secteur}
      </div>
      <div style={{ position: 'absolute', right: '4cm', top: '4.8cm', width: '5cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.nom_caisse_arabe || abonne.nom_caisse}
      </div>

      {/* ======================================================= */}
      {/* CENTRE : Numéro Facture / Période / Date Facture         */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '7cm', top: '3.2cm', width: '4cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.numab} / {facture.date_fact.slice(0, 7)}
      </div>
      <div style={{ position: 'absolute', left: '7cm', top: '4cm', width: '5cm', textAlign: 'left', direction: 'rtl', whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        من {facture.date_releve_prec.split('-').reverse().join('/')} إلى {facture.date_releve.split('-').reverse().join('/')}
      </div>
      <div style={{ position: 'absolute', left: '7cm', top: '4.8cm', width: '4cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {facture.date_saisie.split('-').reverse().join('/')}
      </div>

      {/* ======================================================= */}
      {/* GAUCHE : Dates Relevés                                   */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '2cm', top: '3.2cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {facture.date_releve.split('-').reverse().join('/')}
      </div>
      <div style={{ position: 'absolute', left: '2cm', top: '4cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {facture.date_prochain_releve.split('-').reverse().join('/')}
      </div>
      <div style={{ position: 'absolute', left: '2cm', top: '4.8cm', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {facture.date_prochaine_facture.split('-').reverse().join('/')}
      </div>

      {/* ======================================================= */}
      {/* ABONNÉ GAUCHE : Compteur                                 */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', left: '4cm', top: '5.8cm', fontFamily: 'inherit', fontSize: '11px', direction: 'ltr' }}>
        {abonne.num_serie} {getEtatCptLabel(facture.etat_cpt)}
      </div>
      <div style={{ position: 'absolute', left: '5cm', top: '6.5cm', fontFamily: 'inherit', fontSize: '11px' }}>
        {facture.ancien_index}
      </div>
      <div style={{ position: 'absolute', left: '5cm', top: '7.1cm', fontFamily: 'inherit', fontSize: '11px' }}>
        {facture.nouveau_index}
      </div>
      <div style={{ position: 'absolute', left: '5cm', top: '7.8cm', fontFamily: 'inherit', fontSize: '11px', direction: 'rtl' }}>
        {facture.consommation} <sup>3</sup>م
      </div>

      {/* ======================================================= */}
      {/* ABONNÉ DROITE : Identification Client                    */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', right: '6cm', top: '6cm', width: '8cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.code_unite} {abonne.code_secteur} {abonne.echelon} {abonne.numab} (TRN : {abonne.tournee})
      </div>
      <div style={{ position: 'absolute', right: '4cm', top: '6.7cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.raw_type_abonne} - {abonne.type_abonne_arabe || abonne.type_abonne}
      </div>
      <div style={{ position: 'absolute', right: '4cm', top: '7.5cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.nom_arabe || abonne.nom_prenom}
      </div>
      <div style={{ position: 'absolute', right: '4cm', top: '8.2cm', width: '8cm', textAlign: 'right', direction: 'rtl', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {abonne.rue_arabe || abonne.adresse}
        {abonne.bloc_arabe ? ` - عمارة: ${abonne.bloc_arabe}` : ''}
        {abonne.ndom_arabe ? ` - رقم: ${abonne.ndom_arabe}` : ''}
      </div>

      {/* ======================================================= */}
      {/* SECTION EAU                                              */}
      {/* ======================================================= */}

      {/* RFA — montant seul */}
      {detail.rfaHT > 0 && (
        <div style={{ position: 'absolute', right: C_MONTANT, top: '9.5cm', ...colMontant }}>
          {formatDZD(detail.rfaHT)}
        </div>
      )}

      {/* Tranches progressives T1→T4 (groupe A)
          CORRECTION PA : QE11→PA11, QE12→PA12, QE13→PA13, QE14→PA14 */}
      {isGroupeA && ([
        { qe: fc.qe11, pe: fc.pe11, pa: fc.pa11, topEau: '10.1cm', topAss: '14.8cm' },
        { qe: fc.qe12, pe: fc.pe12, pa: fc.pa12, topEau: '10.7cm', topAss: '15.4cm' },
        { qe: fc.qe13, pe: fc.pe13, pa: fc.pa13, topEau: '11.3cm', topAss: '16.0cm' },
        { qe: fc.qe14, pe: fc.pe14, pa: fc.pa14, topEau: '11.9cm', topAss: '16.6cm' },
      ]).map(({ qe, pe, pa, topEau, topAss }, i) => qe > 0 && (
        <React.Fragment key={i}>
          {/* Eau */}
          <div style={{ position: 'absolute', right: C_QTE, top: topEau, ...colQte }}>{qe}</div>
          <div style={{ position: 'absolute', right: C_PRIX, top: topEau, ...colPrix }}>{formatDZD(pe)}</div>
          <div style={{ position: 'absolute', right: C_MONTANT, top: topEau, ...colMontant }}>{formatDZD(qe * pe)}</div>
          {/* Assainissement (si PA > 0) */}
          {pa > 0 && (
            <>
              <div style={{ position: 'absolute', right: C_QTE, top: topAss, ...colQte }}>{qe}</div>
              <div style={{ position: 'absolute', right: C_PRIX, top: topAss, ...colPrix }}>{formatDZD(pa)}</div>
              <div style={{ position: 'absolute', right: C_MONTANT, top: topAss, ...colMontant }}>{formatDZD(qe * pa)}</div>
            </>
          )}
        </React.Fragment>
      ))}

      {/* Tranche unique eau (puits / industriel / grand compte) */}
      {isTrUnique && fc.qeun > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '12.5cm', ...colQte }}>{fc.qeun}</div>
          <div style={{ position: 'absolute', right: C_PRIX, top: '12.5cm', ...colPrix }}>{formatDZD(fc.peun)}</div>
          <div style={{ position: 'absolute', right: C_MONTANT, top: '12.5cm', ...colMontant }}>{formatDZD(fc.qeun * fc.peun)}</div>
        </>
      )}

      {/* Sous-Total Eau (1) = eauHT + rfaHT */}
      <div style={{ position: 'absolute', right: '14.5cm', top: '13.1cm', fontFamily: 'inherit', fontSize: '11px', direction: 'rtl', fontWeight: 'normal' }}>

      </div>
      <div style={{ position: 'absolute', right: C_MONTANT, top: '13.1cm', ...colMontant, fontWeight: 'normal' }}>
        {formatDZD(detail.sousTotal1)}
      </div>

      {/* ======================================================= */}
      {/* SECTION ASSAINISSEMENT                                   */}
      {/* ======================================================= */}

      {/* RFASS — montant seul */}
      {detail.rfassHT > 0 && (
        <div style={{ position: 'absolute', right: C_MONTANT, top: '14.0cm', ...colMontant }}>
          {formatDZD(detail.rfassHT)}
        </div>
      )}

      {/* Tranche unique assainissement PAUN (groupes C / E) */}
      {isTrUnique && fc.paun > 0 && fc.qeun > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '17.2cm', ...colQte }}>{fc.qeun}</div>
          <div style={{ position: 'absolute', right: C_PRIX, top: '17.2cm', ...colPrix }}>{formatDZD(fc.paun)}</div>
          <div style={{ position: 'absolute', right: C_MONTANT, top: '17.2cm', ...colMontant }}>{formatDZD(fc.qeun * fc.paun)}</div>
        </>
      )}

      {/* Assainissement taux % (groupe A/D sans PAUN) */}
      {fc.type === 'E' && fc.ass > 0 && fc.paun === 0 && fc.pa12 === 0 && detail.assHT > 0 && (
        <div style={{ position: 'absolute', right: C_MONTANT, top: '17.2cm', ...colMontant }}>
          {formatDZD(detail.assHT)}
        </div>
      )}

      {/* Sous-Total Assainissement (2) = assHT + rfassHT */}
      <div style={{ position: 'absolute', right: '14.5cm', top: '17.9cm', fontFamily: 'inherit', fontSize: '11px', direction: 'rtl', fontWeight: 'normal' }}>

      </div>
      <div style={{ position: 'absolute', right: C_MONTANT, top: '17.9cm', ...colMontant, fontWeight: 'normal' }}>
        {formatDZD(detail.sousTotal2)}
      </div>

      {/* ======================================================= */}
      {/* SOUS-TOTAL HT (1)+(2)                                    */}
      {/* ======================================================= */}

      <div style={{ position: 'absolute', right: '14.5cm', top: '18.6cm', fontFamily: 'inherit', fontSize: '11px', direction: 'rtl', fontWeight: 'normal' }}>

      </div>
      <div style={{ position: 'absolute', right: C_MONTANT, top: '18.6cm', ...colMontant, fontWeight: 'normal' }}>
        {formatDZD(detail.sousTotal12)}
      </div>

      {/* ======================================================= */}
      {/* SECTION TAXES ET REDEVANCES                              */}
      {/* ======================================================= */}

      {/* TVA : assiette = sousTotal12, taux = tveau, montant = tvaTotal */}
      {tvaTotal > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '19.7cm', ...colMontant }}>{formatDZD(tvaAssiette)}</div>
          <div style={{ position: 'absolute', right: T_TAUX, top: '19.7cm', ...colMontant }}>{formatDZD(fc.tveau)}</div>
          <div style={{ position: 'absolute', right: T_MONTANT, top: '19.7cm', ...colMontant }}>{formatDZD(tvaTotal)}</div>
        </>
      )}

      {/* RDG : assiette = qte (m³), taux = rdg (DZD/m³) */}
      {detail.rdgMontant > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '20.3cm', ...colMontant }}>{fc.qte}</div>
          <div style={{ position: 'absolute', right: T_TAUX, top: '20.3cm', ...colMontant }}>{formatDZD(fc.rdg)}</div>
          <div style={{ position: 'absolute', right: T_MONTANT, top: '20.3cm', ...colMontant }}>{formatDZD(detail.rdgMontant)}</div>
        </>
      )}

      {/* RQE : assiette = eauHT, taux = rqe% */}
      {detail.rqeMontant > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '20.9cm', ...colMontant }}>{formatDZD(detail.eauHT)}</div>
          <div style={{ position: 'absolute', right: T_TAUX, top: '20.9cm', ...colMontant }}>{formatDZD(fc.rqe)}</div>
          <div style={{ position: 'absolute', right: T_MONTANT, top: '20.9cm', ...colMontant }}>{formatDZD(detail.rqeMontant)}</div>
        </>
      )}

      {/* REE : assiette = eauHT, taux = ree% */}
      {detail.reeMontant > 0 && (
        <>
          <div style={{ position: 'absolute', right: C_QTE, top: '21.5cm', ...colMontant }}>{formatDZD(detail.eauHT)}</div>
          <div style={{ position: 'absolute', right: T_TAUX, top: '21.5cm', ...colMontant }}>{formatDZD(fc.ree)}</div>
          <div style={{ position: 'absolute', right: T_MONTANT, top: '21.5cm', ...colMontant }}>{formatDZD(detail.reeMontant)}</div>
        </>
      )}

      {/* Sous-Total Taxes (3) */}
      <div style={{ position: 'absolute', right: T_MONTANT, top: '22.1cm', ...colMontant, fontWeight: 'normal' }}>
        {formatDZD(detail.sousTotal3)}
      </div>

      {/* ======================================================= */}
      {/* TOTAUX FINAUX                                            */}
      {/* ======================================================= */}

      {/* Montant de la Facture TTC (1)+(2)+(3) */}
      <div style={{ position: 'absolute', right: C_QTE, top: '22.8cm', width: '2.5cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
        {formatDZD(detail.montantTTC)}
      </div>

      {/* Dus antérieurs */}
      <div style={{ position: 'absolute', right: C_QTE, top: '23.9cm', width: '2.5cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
        {formatDZD(dusAnterieurs)}
      </div>

      {/* Montant sans timbre = TTC + Dus antérieurs */}
      <div style={{ position: 'absolute', right: C_QTE, top: '24.5cm', width: '2.5cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
        {formatDZD(montantSansTimbre)}
      </div>

      {/* Timbre fiscal */}
      {timbre > 0 && (
        <div style={{ position: 'absolute', right: C_QTE, top: '25.1cm', width: '2.5cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px' }}>
          {formatDZD(timbre)}
        </div>
      )}

      {/* Net à Payer */}
      <div style={{ position: 'absolute', right: C_QTE, top: '25.8cm', width: '2.5cm', textAlign: 'right', fontFamily: 'inherit', fontSize: '11px', fontWeight: 'normal' }}>
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