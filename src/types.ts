export interface Facture {
  id: string;
  numab: string;
  montant: number;
  date_fact: string;
  date_reglement: string | null; // null si non payée
  montant_paye: number;
  etat_cpt: string;
}

export interface Abonne {
  numab: string;
  nom_prenom: string;
  nom_arabe: string | null; // null si traduction manquante
  adresse: string;
  ville: string;
  rue_arabe: string | null;
  bloc_arabe: string | null;
  ndom_arabe: string | null;
  type_abonne: string;
  type_abonne_arabe: string | null;
}

export interface DossierRecherche {
  abonne: Abonne;
  factures: Facture[];
}
