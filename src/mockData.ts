import type { DossierRecherche } from './types';

// Simulation de l'accès aux fichiers NTX/SQL
export const mockDatabase: Record<string, DossierRecherche> = {
  '001000': {
    abonne: {
      numab: '001000',
      nom_prenom: 'JEAN DUPONT',
      nom_arabe: 'جان دوبون',
      adresse: '12 RUE DES ROSES',
      ville: 'ALGER',
    },
    factures: [
      {
        id: 'F-2023-01',
        numab: '001000',
        montant: 120.50,
        date_fact: '2023-01-15',
        date_reglement: '2023-01-20',
        montant_paye: 120.50,
      },
      {
        id: 'F-2023-02',
        numab: '001000',
        montant: 95.00,
        date_fact: '2023-04-15',
        date_reglement: '2023-04-18',
        montant_paye: 95.00,
      }
    ]
  },
  '001001': {
    abonne: {
      numab: '001001',
      nom_prenom: 'MOHAMED SALAH',
      nom_arabe: null, // Traduction manquante pour tester la UI
      adresse: 'CITE 200 LOGTS BT A',
      ville: 'ORAN',
    },
    factures: [
      {
        id: 'F-2023-01',
        numab: '001001',
        montant: 85.00,
        date_fact: '2023-01-10',
        date_reglement: '2023-02-05',
        montant_paye: 85.00,
      },
      {
        id: 'F-2023-02',
        numab: '001001',
        montant: 140.00,
        date_fact: '2023-04-10',
        date_reglement: null, // Impayée
        montant_paye: 0,
      }
    ]
  }
};

export const performSeek = async (numab: string): Promise<DossierRecherche | null> => {
  try {
    const res = await fetch(`http://localhost:3001/api/abonne/${numab}`);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Erreur API :", err);
    return null;
  }
};
