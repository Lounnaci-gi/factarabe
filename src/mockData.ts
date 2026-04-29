import type { DossierRecherche } from './types';

/**
 * Service de recherche des dossiers abonnés via l'API Backend.
 * Ce service remplace l'ancienne simulation locale par des appels au serveur Express.
 */
export const performSeek = async (numab: string): Promise<DossierRecherche | null> => {
  try {
    // Utilisation de l'hostname actuel pour supporter l'accès réseau (ex: 192.168.x.x:3001)
    const res = await fetch(`http://${window.location.hostname}:3001/api/abonne/${numab}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        console.warn(`Abonné ${numab} non trouvé.`);
      }
      return null;
    }
    
    return await res.json();
  } catch (err) {
    console.error("Erreur de connexion à l'API Backend (vérifiez que server.js est lancé) :", err);
    return null;
  }
};

