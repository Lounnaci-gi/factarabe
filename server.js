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
    for await (const r of dbfFactures) {
      const n = r.NUMAB ? r.NUMAB.toString().trim().toUpperCase() : '';
      if (n) {
        if (!facturesMap.has(n)) facturesMap.set(n, []);
        
        let dFactRaw = r.DATFACT ? r.DATFACT.toString().trim() : '';
        let dFact = '';
        let periodeLabel = r.NUMREC ? r.NUMREC.toString().trim() : Math.random().toString(36).substr(2, 9);
        
        if (dFactRaw.length === 8) {
          dFact = `${dFactRaw.slice(0,4)}-${dFactRaw.slice(4,6)}-${dFactRaw.slice(6,8)}`;
          
          const year = dFactRaw.slice(0,4);
          const month = dFactRaw.slice(4,6);
          const periode = r.PERIODE ? r.PERIODE.toString().trim() : '';
          
          if (periode === '1') {
            const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
            const monthIndex = parseInt(month, 10) - 1;
            const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month;
            periodeLabel = `${monthName} ${year}`;
          } else if (periode === '3') {
            let trim = "";
            if (month === '03') trim = "1er Trim";
            else if (month === '06') trim = "2ème Trim";
            else if (month === '09') trim = "3ème Trim";
            else if (month === '12') trim = "4ème Trim";
            else trim = `Mois ${month}`;
            periodeLabel = `${trim} ${year}`;
          }
        }
        
        let dReg = r.DATREG ? r.DATREG.toString().trim() : '';
        if (dReg.length === 8) dReg = `${dReg.slice(0,4)}-${dReg.slice(4,6)}-${dReg.slice(6,8)}`;
        
        let rawEtatCpt = r.ETATCPT ? r.ETATCPT.toString().trim() : '';
        let etatCptStr = rawEtatCpt ? (tabcodesMap.get("E" + rawEtatCpt) || `État ${rawEtatCpt}`) : "N/A";
        
        facturesMap.get(n).push({
          id: r.NUMREC ? r.NUMREC.toString().trim() : Math.random().toString(36).substr(2, 9),
          numab: n,
          montant: Number(r.MONTTC) || 0,
          date_fact: dFact,
          date_reglement: dReg || null,
          montant_paye: r.PAIEMENT === 'C' ? (Number(r.MONTTC) || 0) : 0,
          etat_cpt: etatCptStr,
          periode_label: periodeLabel
        });
      }
    }

    isAbonnesLoaded = true;
    console.log(`✅ ABONNE.DBF chargé : ${abonnesMap.size} abonnés trouvés !`);
    console.log(`✅ RUE.DBF chargé : ${ruesMap.size} rues trouvées !`);
    console.log(`✅ TABCODE.DBF chargé : ${tabcodesMap.size} codes trouvés !`);
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
    type_abonne_arabe: t.type_abonne_arabe || null,
    num_serie: numSerie,
    tournee: abonneRecord.TOURNEE ? abonneRecord.TOURNEE.toString().trim() : "N/A"
  };

  const factures = facturesMap.get(numab) || [];

  res.json({
    abonne,
    factures
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
  if (type_abonne_arabe !== undefined) translationsDB[numab].type_abonne_arabe = type_abonne_arabe;

  saveTranslations();
  console.log(`✅ Traductions sauvegardées pour ${numab}:`, translationsDB[numab]);
  res.json({ success: true, numab, traduction: translationsDB[numab] });
});

app.listen(3001, () => {
  console.log('🚀 Serveur Backend API démarré sur http://localhost:3001');
});
