/**
 * calcFacture.ts
 * Logique de calcul du montant TTC des factures d'eau (ADE / EPEOR)
 *
 * Corrections v2 :
 * - PA mapping groupe A : QE11→PA12, QE12→PA13, QE13→PA14, QE14→PAUN
 * - montantHT (Sous-Total HT affiché) = EauHT + RFA + AssHT + RFASS
 *   (RQE/REE/RDG sont dans la section taxes, pas dans le HT)
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FactureCalc {
  type: string;

  typabon: number;

  qe11: number; pe11: number;
  qe12: number; pe12: number;
  qe13: number; pe13: number;
  qe14: number; pe14: number;

  qeun: number; peun: number;

  // PA mapping (groupe A) :
  //   pa11 = prix ass tranche 1 (0-25 m³)
  //   pa12 = prix ass tranche 2 (26-55 m³)
  //   pa13 = prix ass tranche 3 (56-82 m³)
  //   pa14 = prix ass tranche 4 (>=83 m³)
  //   paun = prix ass tranche unique
  pa11: number; pa12: number;
  pa13: number; pa14: number;
  paun: number;

  rfa: number;
  tvrfa: number;
  rfass: number;

  tveau: number;
  tvass: number;
  ass: number;
  rqe: number;
  ree: number;
  rdg: number;

  qte: number;
}

export interface DetailFacture {
  // Eau
  eauHT: number;
  tvaEau: number;

  // Redevance fixe eau
  rfaHT: number;
  tvaRfa: number;

  // Redevance fixe assainissement
  rfassHT: number;
  tvaRfass: number;

  // Assainissement
  assHT: number;
  tvaAss: number;

  // Redevances annexes (section taxes)
  rqeMontant: number;
  reeMontant: number;
  rdgMontant: number;

  // Sous-Total Eau (1) = EauHT + RFA
  sousTotal1: number;

  // Sous-Total Assainissement (2) = AssHT + RFASS
  sousTotal2: number;

  // Sous-Total HT affiché ligne (1)+(2)
  sousTotal12: number;

  // Sous-Total Taxes affiché ligne (3)
  sousTotal3: number;

  // Total TTC = sousTotal12 + sousTotal3
  montantTTC: number;
}

// ─────────────────────────────────────────────────────────────
// Détection du groupe TYPABON
// ─────────────────────────────────────────────────────────────

type Groupe = 'A' | 'B' | 'C' | 'D' | 'E_GROUP';

const getGroupe = (typabon: number): Groupe => {
  if (typabon === 15) return 'B';
  if (typabon >= 10 && typabon <= 19) return 'A';
  if (typabon >= 20 && typabon <= 29) return 'C';
  if (typabon >= 30 && typabon <= 39) return 'D';
  if (typabon >= 40 && typabon <= 49) return 'E_GROUP';
  return 'A';
};

// ─────────────────────────────────────────────────────────────
// Calcul Eau HT
// ─────────────────────────────────────────────────────────────

const calcEauHT = (f: FactureCalc, groupe: Groupe): number => {
  switch (groupe) {
    case 'A':
      return (f.qe11 * f.pe11) + (f.qe12 * f.pe12)
        + (f.qe13 * f.pe13) + (f.qe14 * f.pe14);
    case 'B':
      return f.qe11 * f.pe11;
    case 'C':
    case 'E_GROUP':
      return f.qte === 0 ? 0 : f.qeun * f.peun;
    case 'D':
      return f.qte === 0 ? f.tveau : f.qeun * f.peun;
    default:
      return 0;
  }
};

// ─────────────────────────────────────────────────────────────
// Calcul ASS HT
// CORRECTION : groupe A → QE11 × PA12, QE12 × PA13, QE13 × PA14, QE14 × PAUN
// ─────────────────────────────────────────────────────────────

const calcAssHT = (eauHT: number, f: FactureCalc, groupe: Groupe): number => {
  if (groupe === 'B') return 0;

  if (groupe === 'C' || groupe === 'E_GROUP') {
    return f.qte === 0 ? 0 : f.qeun * f.paun;
  }

  if (groupe === 'A') {
    // PA mapping direct : qe11*pa11, qe12*pa12, qe13*pa13, qe14*pa14
    // Arrondi par tranche pour éviter les écarts de centimes
    const assParTranches =
      Math.round(f.qe11 * f.pa11 * 100) / 100 +
      Math.round(f.qe12 * f.pa12 * 100) / 100 +
      Math.round(f.qe13 * f.pa13 * 100) / 100 +
      Math.round(f.qe14 * f.pa14 * 100) / 100;
    if (assParTranches > 0) return assParTranches;
  }

  // Fallback : taux % sur Eau HT (ancien système ou groupe D)
  return eauHT * (f.ass / 100);
};

// ─────────────────────────────────────────────────────────────
// TVA Eau (arrondi par tranche pour groupe A)
// ─────────────────────────────────────────────────────────────

const calcTvaEauHT = (eauHT: number, f: FactureCalc, groupe: Groupe): number => {
  if (groupe === 'A') {
    return (
      Math.round(f.qe11 * f.pe11 * f.tveau) / 100 +
      Math.round(f.qe12 * f.pe12 * f.tveau) / 100 +
      Math.round(f.qe13 * f.pe13 * f.tveau) / 100 +
      Math.round(f.qe14 * f.pe14 * f.tveau) / 100
    );
  }
  return Math.round(eauHT * f.tveau) / 100;
};

// ─────────────────────────────────────────────────────────────
// TVA Assainissement (arrondi par tranche pour groupe A)
// ─────────────────────────────────────────────────────────────

const calcTvaAssHT = (assHT: number, f: FactureCalc, groupe: Groupe): number => {
  if (groupe === 'A') {
    return (
      Math.round(f.qe11 * f.pa11 * f.tvass) / 100 +
      Math.round(f.qe12 * f.pa12 * f.tvass) / 100 +
      Math.round(f.qe13 * f.pa13 * f.tvass) / 100 +
      Math.round(f.qe14 * f.pa14 * f.tvass) / 100
    );
  }
  return Math.round(assHT * f.tvass) / 100;
};

// ─────────────────────────────────────────────────────────────
// Calcul principal
// ─────────────────────────────────────────────────────────────

export const calcDetailFacture = (f: FactureCalc): DetailFacture => {

  // ── TYPE ≠ 'E' ─────────────────────────────────────────
  if (f.type !== 'E') {
    const baseHT = f.qeun * f.peun;
    const tvaEau = baseHT * (f.tveau / 100);
    const montantTTC = Math.round((baseHT + tvaEau) * 100) / 100;
    return {
      eauHT: baseHT, tvaEau,
      rfaHT: 0, tvaRfa: 0,
      rfassHT: 0, tvaRfass: 0,
      assHT: 0, tvaAss: 0,
      rqeMontant: 0, reeMontant: 0, rdgMontant: 0,
      sousTotal1: baseHT,
      sousTotal2: 0,
      sousTotal12: baseHT,
      sousTotal3: tvaEau,
      montantTTC,
    };
  }

  // ── TYPE = 'E' ──────────────────────────────────────────
  const groupe = getGroupe(f.typabon);
  const eauHT = calcEauHT(f, groupe);
  const assHT = calcAssHT(eauHT, f, groupe);
  const hasRDG = groupe !== 'B';

  const tvaEau = calcTvaEauHT(eauHT, f, groupe);
  const rfaHT = f.rfa;
  const tvaRfa = Math.round(rfaHT * (f.tvrfa / 100) * 100) / 100;
  const rfassHT = f.rfass > 0 ? f.rfass : 0;
  const tvaRfass = Math.round(rfassHT * (f.tvass / 100) * 100) / 100;
  const tvaAss = calcTvaAssHT(assHT, f, groupe);
  const rqeMontant = hasRDG ? Math.round(eauHT * (f.rqe / 100) * 100) / 100 : 0;
  const reeMontant = hasRDG ? Math.round(eauHT * (f.ree / 100) * 100) / 100 : 0;
  const rdgMontant = hasRDG ? Math.round(f.qte * f.rdg * 100) / 100 : 0;

  // Sous-Total Eau (1)
  const sousTotal1 = eauHT + rfaHT;

  // Sous-Total Assainissement (2)
  const sousTotal2 = assHT + rfassHT;

  // Sous-Total HT (1)+(2) : affiché sur la facture SANS RQE/REE/RDG
  const sousTotal12 = sousTotal1 + sousTotal2;

  // TVA s'applique sur sousTotal12 (même taux pour eau, rfa, ass, rfass)
  const tvaTotal = tvaEau + tvaRfa + tvaRfass + tvaAss;

  // Sous-Total Taxes (3)
  const sousTotal3 = Math.round((tvaTotal + rqeMontant + reeMontant + rdgMontant) * 100) / 100;

  // Total TTC = (1)+(2)+(3)
  const montantTTC = Math.round((sousTotal12 + sousTotal3) * 100) / 100;

  return {
    eauHT, tvaEau,
    rfaHT, tvaRfa,
    rfassHT, tvaRfass,
    assHT, tvaAss,
    rqeMontant, reeMontant, rdgMontant,
    sousTotal1,
    sousTotal2,
    sousTotal12,
    sousTotal3,
    montantTTC,
  };
};

// ─────────────────────────────────────────────────────────────
// Helper : montant TTC uniquement
// ─────────────────────────────────────────────────────────────

export const calcMontantTC = (f: FactureCalc): number =>
  calcDetailFacture(f).montantTTC;

// ─────────────────────────────────────────────────────────────
// Formatage monétaire DZD
// ─────────────────────────────────────────────────────────────

export const formatDZD = (value: number): string =>
  new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

// ─────────────────────────────────────────────────────────────
// Calcul du timbre fiscal (1% arrondi au supérieur, max 2500)
// ─────────────────────────────────────────────────────────────

export const calculerTimbre = (montantTTC: number): number => {
  if (montantTTC <= 0) return 0;
  const timbre = Math.ceil(montantTTC * 0.01);
  return Math.min(timbre, 2500);
};