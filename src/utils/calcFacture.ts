/**
 * calcFacture.ts
 * Logique de calcul du montant TTC des factures d'eau (ADE)
 * Couvre tous les types de documents et groupes d'abonnés identifiés.
 */

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FactureCalc {
  // Type de document
  type: string;       // 'E' | 'A' | 'B' | 'C' | 'D' | 'G' | 'X' | '2' | '4' | '6' | '7' | ...

  // Type d'abonné
  typabon: number;    // 10-49

  // Quantités et prix par tranche (TYPE='E', groupe A)
  qe11: number; pe11: number;
  qe12: number; pe12: number;
  qe13: number; pe13: number;
  qe14: number; pe14: number;

  // Tranche unique (TYPE='E', groupes C/D/E)
  qeun: number; peun: number;

  // Prix assainissement par tranche (PA11..PA14 — réservé usage futur)
  pa11: number; pa12: number;
  pa13: number; pa14: number;
  paun: number;   // prix unitaire assainissement (groupes C et E)

  // Redevances fixes
  rfa: number;    // redevance fixe abonnement eau
  tvrfa: number;  // taux TVA sur RFA (%)
  rfass: number;  // redevance fixe abonnement assainissement

  // Taux
  tveau: number;  // taux TVA eau (%) — ou montant forfaitaire HT si type≠'E' et PEUN=1
  tvass: number;  // taux TVA assainissement (%)
  ass: number;    // taux assainissement (%) — groupes A et D
  rqe: number;    // taux redevance qualité eau (%)
  ree: number;    // taux redevance économie eau (%)
  rdg: number;    // redevance gestion (DZD/m³)

  // Quantité totale consommée
  qte: number;
}

interface DetailFacture {
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

  // Redevances annexes
  rqeMontant: number;
  reeMontant: number;
  rdgMontant: number;

  // Total
  montantHT: number;
  montantTTC: number;
}

// ─────────────────────────────────────────────────────────────
// Détection du groupe TYPABON
// ─────────────────────────────────────────────────────────────

type Groupe = 'A' | 'B' | 'C' | 'D' | 'E_GROUP';

const getGroupe = (typabon: number): Groupe => {
  if (typabon === 15)                       return 'B';        // Puits
  if (typabon >= 10 && typabon <= 19)       return 'A';        // Domestique (tranches)
  if (typabon >= 20 && typabon <= 29)       return 'C';        // Industriel
  if (typabon >= 30 && typabon <= 39)       return 'D';        // Sans compteur
  if (typabon >= 40 && typabon <= 49)       return 'E_GROUP';  // Grand compte
  return 'A'; // fallback
};

// ─────────────────────────────────────────────────────────────
// Calcul Eau HT selon groupe
// ─────────────────────────────────────────────────────────────

const calcEauHT = (f: FactureCalc, groupe: Groupe): number => {
  switch (groupe) {
    case 'A':
      // Tranches progressives
      return (f.qe11 * f.pe11)
           + (f.qe12 * f.pe12)
           + (f.qe13 * f.pe13)
           + (f.qe14 * f.pe14);

    case 'B':
      // Puits : T1 seulement
      return f.qe11 * f.pe11;

    case 'C':
    case 'E_GROUP':
      // Tranche unique
      return f.qte === 0 ? 0 : f.qeun * f.peun;

    case 'D':
      // Sans compteur : forfait TVEAU si pas de consommation
      return f.qte === 0 ? f.tveau : f.qeun * f.peun;

    default:
      return 0;
  }
};

// ─────────────────────────────────────────────────────────────
// Calcul ASS HT selon groupe
// ─────────────────────────────────────────────────────────────

const calcAssHT = (eauHT: number, f: FactureCalc, groupe: Groupe): number => {
  // Puits : pas d'assainissement
  if (groupe === 'B') return 0;

  // Groupes C et E : prix unitaire par m³
  if (groupe === 'C' || groupe === 'E_GROUP') {
    return f.qte === 0 ? 0 : f.qeun * f.paun;
  }

  // Groupe A : essayer PA par tranche en priorité, sinon taux %
  if (groupe === 'A') {
    const assParTranches =
      (f.qe11 * f.pa11) +
      (f.qe12 * f.pa12) +
      (f.qe13 * f.pa13) +
      (f.qe14 * f.pa14);
    if (assParTranches > 0) return assParTranches;
  }

  // Groupes A et D (fallback) : taux % sur Eau HT
  return eauHT * (f.ass / 100);
};

// ─────────────────────────────────────────────────────────────
// TVA Eau — calculée par tranche pour groupe A (comme EPEOR)
// ─────────────────────────────────────────────────────────────

const calcTvaEauHT = (eauHT: number, f: FactureCalc, groupe: Groupe): number => {
  if (groupe === 'A') {
    // Arrondi par tranche pour reproduire le comportement exact du système EPEOR
    // (évite l'écart de 1 centime dû à l'accumulation d'arrondis)
    return (
      Math.round(f.qe11 * f.pe11 * f.tveau) / 100 +
      Math.round(f.qe12 * f.pe12 * f.tveau) / 100 +
      Math.round(f.qe13 * f.pe13 * f.tveau) / 100 +
      Math.round(f.qe14 * f.pe14 * f.tveau) / 100
    );
  }
  return eauHT * (f.tveau / 100);
};

// ─────────────────────────────────────────────────────────────
// Calcul principal — retourne le détail complet
// ─────────────────────────────────────────────────────────────

export const calcDetailFacture = (f: FactureCalc): DetailFacture => {

  // ── TYPE ≠ 'E' : formule simplifiée ──────────────────────
  if (f.type !== 'E') {
    const baseHT   = f.qeun * f.peun;
    const tvaEau   = baseHT * (f.tveau / 100);
    const montantTTC = Math.round((baseHT + tvaEau) * 100) / 100;

    return {
      eauHT:       baseHT,
      tvaEau,
      rfaHT:       0,
      tvaRfa:      0,
      rfassHT:     0,
      tvaRfass:    0,
      assHT:       0,
      tvaAss:      0,
      rqeMontant:  0,
      reeMontant:  0,
      rdgMontant:  0,
      montantHT:   baseHT,
      montantTTC,
    };
  }

  // ── TYPE = 'E' : formule complète ────────────────────────
  const groupe  = getGroupe(f.typabon);
  const eauHT   = calcEauHT(f, groupe);
  const assHT   = calcAssHT(eauHT, f, groupe);
  const hasRDG  = groupe !== 'B';

  const tvaEau     = calcTvaEauHT(eauHT, f, groupe);  // arrondi par tranche pour groupe A
  const rfaHT      = f.rfa;
  const tvaRfa     = rfaHT  * (f.tvrfa  / 100);
  const rfassHT    = f.rfass > 0 ? f.rfass : 0;
  const tvaRfass   = rfassHT * (f.tvass  / 100);
  const tvaAss     = assHT  * (f.tvass  / 100);
  const rqeMontant = hasRDG ? eauHT * (f.rqe / 100) : 0;
  const reeMontant = hasRDG ? eauHT * (f.ree / 100) : 0;
  const rdgMontant = hasRDG ? f.qte * f.rdg          : 0;

  const montantHT =
    eauHT + rfaHT + rfassHT + assHT
    + rqeMontant + reeMontant + rdgMontant;

  const montantTTC = Math.round((
    eauHT    + tvaEau
  + rfaHT    + tvaRfa
  + rfassHT  + tvaRfass
  + assHT    + tvaAss
  + rqeMontant
  + reeMontant
  + rdgMontant
  ) * 100) / 100;

  return {
    eauHT,
    tvaEau,
    rfaHT,
    tvaRfa,
    rfassHT,
    tvaRfass,
    assHT,
    tvaAss,
    rqeMontant,
    reeMontant,
    rdgMontant,
    montantHT,
    montantTTC,
  };
};

// ─────────────────────────────────────────────────────────────
// Helper : formatage monétaire DZD
// ─────────────────────────────────────────────────────────────

export const formatDZD = (value: number): string =>
  new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
