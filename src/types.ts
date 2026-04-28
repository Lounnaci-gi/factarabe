export interface Facture {
  id: string;
  numab: string;
  montant: number;
  date_fact: string;
  date_reglement: string | null;
  montant_paye: number;
  etat_cpt: string;
  periode_label: string;
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
  num_serie: string;
  tournee: string;
}

export interface DossierRecherche {
  abonne: Abonne;
  factures: Facture[];
}
