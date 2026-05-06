import express from 'express';
import cors from 'cors';
import { DBFFile } from 'dbffile';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRANSLATIONS_FILE = path.join(__dirname, 'translations.json');

// Charge ou initialise le fichier de traductions
let translationsDB = {};
if (fs.existsSync(TRANSLATIONS_FILE)) {
  try { translationsDB = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf-8')); } catch { translationsDB = {}; }
}

const saveTranslations = () => {
  fs.writeFileSync(TRANSLATIONS_FILE, JSON.stringify(translationsDB, null, 2), 'utf-8');
};

const app = express();
app.use(cors());
app.use(express.json());

// Mettre en mémoire cache la base Abonnés (10MB c'est très rapide)
let abonnesMap = new Map();
let ruesMap = new Map();
let tabcodesMap = new Map();
let facturesMap = new Map();
let abonmentsMap = new Map();
let unitesMap = new Map();
let caissesMap = new Map();
let isAbonnesLoaded = false;

async function loadAbonnes() {
  try {
    console.log("Chargement de ABONNE.DBF en mémoire...");
    const dbf = await DBFFile.open('D:\\EPEOR\\ABONNE.DBF', { encoding: 'win1256' }); // Encodage Arabe Windows
    const records = await dbf.readRecords(dbf.recordCount);

    for (const record of records) {
      // NUMAB est la clé
      const numab = record.NUMAB ? record.NUMAB.toString().trim().toUpperCase() : '';
      if (numab) {
        abonnesMap.set(numab, record);
      }
    }

    // Chargement de RUE.DBF
    const dbfRue = await DBFFile.open('D:\\EPEOR\\RUE.DBF', { encoding: 'win1256' });
    const rues = await dbfRue.readRecords(dbfRue.recordCount);
    for (const rue of rues) {
      const codrue = rue.CODRUE ? rue.CODRUE.toString().trim() : '';
      if (codrue) {
        ruesMap.set(codrue, rue);
      }
    }

    // Chargement de TABCODE.DBF pour les libellés
    const dbfTabcode = await DBFFile.open('D:\\EPEOR\\TABCODE.DBF', { encoding: 'win1256' });
    const tabcodes = await dbfTabcode.readRecords(dbfTabcode.recordCount);
    for (const tabcode of tabcodes) {
      const codeAffec = tabcode.CODE_AFFEC ? tabcode.CODE_AFFEC.toString().trim().toUpperCase() : '';
      if (codeAffec) {
        tabcodesMap.set(codeAffec, tabcode.LIBELLE);
      }
    }

    // Chargement de ABONMENT.DBF pour les numéros de série
    const dbfAbonment = await DBFFile.open('D:\\EPEOR\\ABONMENT.DBF', { encoding: 'win1256' });
    const abonments = await dbfAbonment.readRecords(dbfAbonment.recordCount);
    for (const abonment of abonments) {
      const numab = abonment.NUMAB ? abonment.NUMAB.toString().trim().toUpperCase() : '';
      if (numab) {
        abonmentsMap.set(numab, abonment);
      }
    }

    console.log("Chargement de FACTURES.DBF en mémoire (cela prend ~25 secondes)...");
    const dbfFactures = await DBFFile.open('D:\\EPEOR\\FACTURES.DBF', { encoding: 'win1256' });
    let firstFact = true;
    for await (const r of dbfFactures) {
      if (firstFact) {
        console.log("Structure d'une facture :", Object.keys(r));
        firstFact = false;
      }
      let n = r.NUMAB ? r.NUMAB.toString().replace(/\x00/g, '').trim().toUpperCase() : '';
      if (n) {
        if (!facturesMap.has(n)) facturesMap.set(n, []);

        let dFactRaw = r.DATFACT ? r.DATFACT.toString().trim() : '';
        let dFact = '';
        let periodeLabel = r.NUMREC ? r.NUMREC.toString().trim() : Math.random().toString(36).substr(2, 9);

        if (dFactRaw.length === 8) {
          dFact = `${dFactRaw.slice(0, 4)}-${dFactRaw.slice(4, 6)}-${dFactRaw.slice(6, 8)}`;

          const year = dFactRaw.slice(0, 4);
          const month = dFactRaw.slice(4, 6);
          const typeFact = r.TYPE ? r.TYPE.toString().trim() : '';
          const periode = r.PERIODE ? r.PERIODE.toString().trim() : '';

          const monthNames = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
          const monthIndex = parseInt(month, 10) - 1;
          const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month;

          if (typeFact !== 'E') {
            periodeLabel = `${monthName} ${year}`;
          } else {
            if (periode === '1') {
              periodeLabel = `${monthName} ${year}`;
            } else if (periode === '3') {
              let trim = "";
              if (month === '03') trim = "الثلاثي الأول";
              else if (month === '06') trim = "الثلاثي الثاني";
              else if (month === '09') trim = "الثلاثي الثالث";
              else if (month === '12') trim = "الثلاثي الرابع";
              else trim = `شهر ${month}`;
              periodeLabel = `${trim} ${year}`;
            }
          }
        }

        let dReg = r.DATREG ? r.DATREG.toString().trim() : '';
        if (dReg.length === 8) dReg = `${dReg.slice(0, 4)}-${dReg.slice(4, 6)}-${dReg.slice(6, 8)}`;

        let dRelRaw = r.DATERELEVE ? r.DATERELEVE.toString().trim() : '';
        let dRel = '';
        if (dRelRaw.length === 8) dRel = `${dRelRaw.slice(0, 4)}-${dRelRaw.slice(4, 6)}-${dRelRaw.slice(6, 8)}`;

        let dSaisieRaw = r.DATSAISIE ? r.DATSAISIE.toString().trim() : '';
        let dSaisie = '';
        if (dSaisieRaw.length === 8) dSaisie = `${dSaisieRaw.slice(0, 4)}-${dSaisieRaw.slice(4, 6)}-${dSaisieRaw.slice(6, 8)}`;

        let rawEtatCpt = r.ETATCPT ? r.ETATCPT.toString().trim() : '';
        const etatMap = {
          '10': 'في الخدمة', '11': 'بدون ماء', '12': 'خط غير مستخدم',
          '13': 'تجاوز المؤشر', '14': 'عداد مقطوع', '15': 'بئر',
          '16': 'قطعة أرض', '17': 'خزانة مغلقة', '18': 'منزل غير مسكون',
          '19': 'خط غير مستخدم', '20': 'متوقف', '30': 'بدون عداد',
          '40': 'ملغى', '41': 'غير موصول',
        };
        let etatCptStr = rawEtatCpt ? (etatMap[rawEtatCpt] || tabcodesMap.get("E" + rawEtatCpt) || `حالة ${rawEtatCpt}`) : "N/A";

        const reference = `${dFactRaw.slice(0, 4)}-${dFactRaw.slice(4, 6)}/${r.TYPE ? r.TYPE.toString().trim() : ''}`;

        facturesMap.get(n).push({
          id: reference,
          numab: n,
          montant: Number(r.MONTTC) || 0,
          date_fact: dFact,
          date_reglement: dReg || null,
          date_releve: dRel || dFact, // Fallback sur date facturation si relevé vide
          date_saisie: dSaisie || dFact,
          montant_paye: r.PAIEMENT === 'C' ? (Number(r.MONTTC) || 0) : 0,
          etat_cpt: etatCptStr,
          periode_label: periodeLabel,
          raw_periode: r.PERIODE ? r.PERIODE.toString().trim() : '',
          ancien_index: Number(r.ANCIENX) || 0,
          nouveau_index: Number(r.NOUVELX) || 0,
          consommation: Number(r.QTE) || 0,
          timbre: Number(r.TIMBRE) || 0,
          paiement: r.MODALITE ? r.MODALITE.toString().replace(/\x00/g, '').trim() : '',
          numrec: r.NUMREC ? r.NUMREC.toString().trim() : '',
          calc_data: {
            type: r.TYPE ? r.TYPE.toString().trim() : '',
            typabon: Number(r.TYPABON) || 0,
            qe11: Number(r.QE11) || 0, pe11: Number(r.PE11) || 0,
            qe12: Number(r.QE12) || 0, pe12: Number(r.PE12) || 0,
            qe13: Number(r.QE13) || 0, pe13: Number(r.PE13) || 0,
            qe14: Number(r.QE14) || 0, pe14: Number(r.PE14) || 0,
            qeun: Number(r.QEUN) || 0, peun: Number(r.PEUN) || 0,
            pa11: Number(r.PA11) || 0, pa12: Number(r.PA12) || 0,
            pa13: Number(r.PA13) || 0, pa14: Number(r.PA14) || 0,
            paun: Number(r.PAUN) || 0,
            rfa: Number(r.RFA) || 0,
            tvrfa: Number(r.TVRFA) || 0,
            rfass: Number(r.RFASS) || 0,
            tveau: Number(r.TVEAU) || 0,
            tvass: Number(r.TVASS) || 0,
            ass: Number(r.ASS) || 0,
            rqe: Number(r.RQE) || 0,
            ree: Number(r.REE) || 0,
            rdg: Number(r.RDG) || 0,
            qte: Number(r.QTE) || 0,
          }
        });
      }

    }

    // Chargement de UNITE.DBF pour les noms d'unités
    const dbfUnite = await DBFFile.open('D:\\EPEOR\\UNITE.DBF', { encoding: 'win1256' });
    const unites = await dbfUnite.readRecords(dbfUnite.recordCount);
    for (const unite of unites) {
      const codeUnite = unite.UNITE ? unite.UNITE.toString().trim().replace(/^0+/, '') : '';
      if (codeUnite) {
        unitesMap.set(codeUnite, unite);
      }
    }

    // Chargement de CAISSE.DBF
    const dbfCaisse = await DBFFile.open('D:\\EPEOR\\CAISSE.DBF', { encoding: 'win1256' });
    const caisses = await dbfCaisse.readRecords(dbfCaisse.recordCount);
    for (const caisse of caisses) {
      const codeCaisse = caisse.CODCAIS ? caisse.CODCAIS.toString().trim() : '';
      if (codeCaisse) {
        caissesMap.set(codeCaisse, caisse);
      }
    }

    // ─── Construction automatique des clés globales TYPABON_XX ───────────────
    // Scanne les traductions existantes par abonné pour remplir les clés globales
    // partagées, de sorte que tous les abonnés du même type bénéficient des
    // traductions déjà saisies sans avoir à les re-saisir.
    let typabonCount = 0;
    for (const [key, trans] of Object.entries(translationsDB)) {
      if (trans && typeof trans === 'object' && trans.type_abonne_arabe) {
        const abonneRec = abonnesMap.get(key);
        if (abonneRec) {
          const rawTyp = abonneRec.TYPABON ? abonneRec.TYPABON.toString().trim() : null;
          if (rawTyp && !translationsDB[`TYPABON_${rawTyp}`]) {
            translationsDB[`TYPABON_${rawTyp}`] = trans.type_abonne_arabe;
            typabonCount++;
          }
        }
      }
    }
    if (typabonCount > 0) {
      console.log(`✅ ${typabonCount} clé(s) globale(s) TYPABON_XX construites depuis les traductions existantes.`);
    }
    // ─────────────────────────────────────────────────────────────────────────

    isAbonnesLoaded = true;
    console.log(`✅ ABONNE.DBF chargé : ${abonnesMap.size} abonnés trouvés !`);
    console.log(`✅ RUE.DBF chargé : ${ruesMap.size} rues trouvées !`);
    console.log(`✅ TABCODE.DBF chargé : ${tabcodesMap.size} codes trouvés !`);
    console.log(`✅ UNITE.DBF chargé : ${unitesMap.size} unités trouvées !`);
    console.log(`✅ CAISSE.DBF chargé : ${caissesMap.size} caisses trouvées !`);
    console.log(`✅ FACTURES.DBF chargé : factures pour ${facturesMap.size} abonnés !`);
  } catch (error) {
    console.error("Erreur de chargement des bases:", error);
  }
}

// Lancer le chargement au démarrage
loadAbonnes();

app.get('/api/abonne/:numab', async (req, res) => {
  if (!isAbonnesLoaded) {
    return res.status(503).json({ error: "Base de données en cours de chargement..." });
  }

  const numab = req.params.numab.toUpperCase();
  const abonneRecord = abonnesMap.get(numab);

  if (!abonneRecord) {
    return res.status(404).json({ error: "Aucun abonné trouvé." });
  }

  // Mapper les champs de votre DBF vers l'interface React
  // (J'essaie de deviner les colonnes classiques : NOM_PRENOM, ADRESSE, etc.)
  const codrue = abonneRecord.CODRUE ? abonneRecord.CODRUE.toString().trim() : '';
  const nomRue = ruesMap.get(codrue)?.NOUVNOM || '?';

  let adresseStr = typeof nomRue === 'string' ? nomRue.trim() : '?';
  const bloc = abonneRecord.BLOC ? abonneRecord.BLOC.toString().trim() : '';
  const ndom = abonneRecord.NDOM ? abonneRecord.NDOM.toString().trim() : '';

  if (bloc) adresseStr += ` | BLOC: ${bloc}`;
  if (ndom) adresseStr += ` | DOM: ${ndom}`;

  const nomRueArabe = ruesMap.get(codrue)?.NOUVNOMA;

  const rawTypabon = abonneRecord.TYPABON ? abonneRecord.TYPABON.toString().trim() : '';
  const typeAbonneStr = rawTypabon ? (tabcodesMap.get("T" + rawTypabon) || `Type ${rawTypabon}`) : "Non spécifié";

  const numSerie = abonmentsMap.get(numab)?.NUMSER ? abonmentsMap.get(numab).NUMSER.toString().trim() : "Inconnu";

  const t = translationsDB[numab] || {};

  const abonne = {
    numab: numab,
    nom_prenom: abonneRecord.RAISOC || "Nom inconnu",
    nom_arabe: t.nom_arabe || abonneRecord.RAISOCA || null,
    adresse: adresseStr,
    ville: "---",
    rue_arabe: t.rue_arabe || (typeof nomRueArabe === 'string' && nomRueArabe.trim() !== '' ? nomRueArabe.trim() : null),
    bloc_arabe: t.bloc_arabe || null,
    ndom_arabe: t.ndom_arabe || null,
    type_abonne: typeAbonneStr,
    raw_type_abonne: rawTypabon,
    type_abonne_arabe: t.type_abonne_arabe || (rawTypabon ? translationsDB[`TYPABON_${rawTypabon}`] : null) || null,
    num_serie: numSerie,
    tournee: abonneRecord.TOURNEE ? abonneRecord.TOURNEE.toString().trim() : "N/A",
    echelon: abonneRecord.ECHELON ? abonneRecord.ECHELON.toString().trim() : "N/A",
    code_unite: (() => {
      const val = abonneRecord.UNITE || abonneRecord.CODUNI || abonneRecord.COD_UNI || "";
      return val.toString().trim() || "N/A";
    })(),
    nom_unite: (() => {
      const rawCode = (abonneRecord.UNITE || abonneRecord.CODUNI || abonneRecord.COD_UNI || "").toString().trim();
      const uCode = rawCode.replace(/^0+/, '');
      if (!uCode) return "N/A";
      const unitRec = unitesMap.get(uCode);
      return unitRec ? (unitRec.DENOM ? unitRec.DENOM.toString().trim() : "Nom manquant") : `Unité ${uCode} non trouvée`;
    })(),
    code_secteur: abonneRecord.SECTEUR ? abonneRecord.SECTEUR.toString().trim() : "N/A",
    nom_secteur: (() => {
      const sCode = abonneRecord.SECTEUR ? abonneRecord.SECTEUR.toString().trim() : null;
      return sCode ? (tabcodesMap.get("S" + sCode) || `Secteur ${sCode}`) : "N/A";
    })(),
    nom_unite_arabe: (() => {
      const rawCode = (abonneRecord.UNITE || abonneRecord.CODUNI || "").toString().trim();
      const code = rawCode.replace(/^0+/, '');
      return (t.nom_unite_arabe) || translationsDB[`UNIT_${code}`] || null;
    })(),
    nom_secteur_arabe: (() => {
      const code = (abonneRecord.SECTEUR || "").toString().trim();
      return (t.nom_secteur_arabe) || translationsDB[`SECT_${code}`] || null;
    })(),
    code_caisse: abonneRecord.CODCAIS ? abonneRecord.CODCAIS.toString().trim() : "N/A",
    nom_caisse: abonneRecord.CODCAIS ? (caissesMap.get(abonneRecord.CODCAIS.toString().trim())?.LIBCAIS || "Caisse inconnue") : "N/A",
    nom_caisse_arabe: t.nom_caisse_arabe || translationsDB[`CAISSE_${abonneRecord.CODCAIS?.toString().trim()}`] || null,
  };

  const factures = facturesMap.get(numab) || [];
  
  // Trier les factures par date pour cet abonné uniquement
  factures.sort((a, b) => a.date_fact.localeCompare(b.date_fact));
  
  // Calculer la date de relevé précédente
  for (let i = 0; i < factures.length; i++) {
    if (i > 0) {
      factures[i].date_releve_prec = factures[i-1].date_releve;
    } else {
      // Si première facture et période 3, on recule de 92 jours
      if (factures[i].raw_periode === '3') {
        const d = new Date(factures[i].date_releve);
        d.setDate(d.getDate() - 92);
        factures[i].date_releve_prec = d.toISOString().split('T')[0];
      } else {
        factures[i].date_releve_prec = factures[i].date_releve;
      }
    }
    
    // Calcul de la date du prochain relevé (+91 jours)
    const nextRel = new Date(factures[i].date_releve);
    nextRel.setDate(nextRel.getDate() + 91);
    factures[i].date_prochain_releve = nextRel.toISOString().split('T')[0];

    // Calcul de la date de la prochaine facture (+91 jours de la date de saisie)
    const nextFact = new Date(factures[i].date_saisie);
    nextFact.setDate(nextFact.getDate() + 91);
    factures[i].date_prochaine_facture = nextFact.toISOString().split('T')[0];
  }

  res.json({
    abonne,
    factures: factures // De la plus ancienne à la plus récente
  });
});

// POST : Sauvegarde les traductions arabes d'un abonné
app.post('/api/abonne/:numab/traduction', (req, res) => {
  const numab = req.params.numab.toUpperCase();
  const { nom_arabe, rue_arabe, bloc_arabe, ndom_arabe, type_abonne_arabe } = req.body;

  if (!translationsDB[numab]) translationsDB[numab] = {};

  if (nom_arabe !== undefined) translationsDB[numab].nom_arabe = nom_arabe;
  if (rue_arabe !== undefined) translationsDB[numab].rue_arabe = rue_arabe;
  if (bloc_arabe !== undefined) translationsDB[numab].bloc_arabe = bloc_arabe;
  if (ndom_arabe !== undefined) translationsDB[numab].ndom_arabe = ndom_arabe;
  if (type_abonne_arabe !== undefined) {
    translationsDB[numab].type_abonne_arabe = type_abonne_arabe;
    // Sauvegarde globale pour le type d'abonné (partagé entre tous les abonnés du même type)
    const abonneRec = abonnesMap.get(numab);
    const rawTyp = abonneRec?.TYPABON ? abonneRec.TYPABON.toString().trim() : null;
    if (rawTyp && type_abonne_arabe) translationsDB[`TYPABON_${rawTyp}`] = type_abonne_arabe;
  }
  
  if (req.body.nom_unite_arabe !== undefined) {
    translationsDB[numab].nom_unite_arabe = req.body.nom_unite_arabe;
    // Sauvegarde globale pour l'unité
    const abonne = abonnesMap.get(numab);
    const rawCode = (abonne?.UNITE || abonne?.CODUNI || "").toString().trim();
    const uCode = rawCode.replace(/^0+/, '');
    if (uCode) translationsDB[`UNIT_${uCode}`] = req.body.nom_unite_arabe;
  }
  
  if (req.body.nom_secteur_arabe !== undefined) {
    translationsDB[numab].nom_secteur_arabe = req.body.nom_secteur_arabe;
    // Sauvegarde globale pour le secteur
    const abonne = abonnesMap.get(numab);
    const sCode = (abonne?.SECTEUR || "").toString().trim();
    if (sCode) translationsDB[`SECT_${sCode}`] = req.body.nom_secteur_arabe;
  }

  if (req.body.nom_caisse_arabe !== undefined) {
    translationsDB[numab].nom_caisse_arabe = req.body.nom_caisse_arabe;
    // Sauvegarde globale pour la caisse
    const abonne = abonnesMap.get(numab);
    const cCode = abonne?.CODCAIS?.toString().trim();
    if (cCode) translationsDB[`CAISSE_${cCode}`] = req.body.nom_caisse_arabe;
  }

  saveTranslations();
  console.log(`✅ Traductions sauvegardées pour ${numab}:`, translationsDB[numab]);
  res.json({ success: true, numab, traduction: translationsDB[numab] });
});

const server = app.listen(3001, () => {
  console.log('🚀 Serveur Backend API démarré sur http://localhost:3001');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('❌ ERREUR : Le port 3001 est déjà utilisé par un autre processus.');
    console.error('   → Fermez l\'autre instance du serveur et relancez : npm start server');
  } else {
    console.error('❌ Erreur serveur :', err.message);
  }
  process.exit(1);
});
