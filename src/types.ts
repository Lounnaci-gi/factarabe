export interface Facture {
  id: string;
  numab: string;
  montant: number;
  date_fact: string;
  date_reglement: string | null;
  date_releve: string;
  date_releve_prec: string;
  date_prochain_releve: string;
  date_saisie: string;
  montant_paye: number;
  etat_cpt: string;
  periode_label: string;
  raw_periode: string;
  ancien_index: number;
  nouveau_index: number;
  consommation: number;
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
  raw_type_abonne: string;
  type_abonne_arabe: string | null;
  num_serie: string;
  tournee: string;
  code_unite: string;
  nom_unite: string;
  code_secteur: string;
  nom_secteur: string;
  code_caisse: string;
  nom_caisse: string;
  nom_unite_arabe: string | null;
  nom_secteur_arabe: string | null;
  nom_caisse_arabe: string | null;
}

export interface DossierRecherche {
  abonne: Abonne;
  factures: Facture[];
}
