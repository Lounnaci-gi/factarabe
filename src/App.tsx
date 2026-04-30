import React, { useState } from 'react';
import { performSeek } from './mockData';
import type { DossierRecherche } from './types';
import { SearchBar } from './components/SearchBar';
import { AbonneCard } from './components/AbonneCard';
import { FacturesList } from './components/FacturesList';
import { InvoicePrint } from './components/InvoicePrint';
import type { Facture } from './types';

export default function App() {
  const [data, setData] = useState<DossierRecherche | null>(null);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = React.useCallback(async (numab: string) => {
    setIsLoading(true);
    setError(null);
    
    // Appel du service (qui simule le NTX)
    const result = await performSeek(numab);
    
    if (result) {
      setData(result);
    } else {
      setData(null);
      setError(`Aucun abonné trouvé pour le code : ${numab}`);
    }
    
    setIsLoading(false);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>H2O Smart Facture</h1>
        <p>Interface haute performance de gestion des abonnés</p>
      </header>

      {/* Barre de Recherche Permanente */}
      <SearchBar onSearch={handleSearch} />

      {/* Affichage des Erreurs ou Chargement */}
      {isLoading && (
        <div style={{ textAlign: 'center', color: '#6B7280', marginTop: '20px' }}>
          Recherche en cours...
        </div>
      )}
      
      {!isLoading && error && (
        <div style={{ textAlign: 'center', color: '#991B1B', marginTop: '20px' }}>
          {error}
        </div>
      )}

      {/* Affichage du Dossier si trouvé */}
      {!isLoading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '20px', animation: 'fadeIn 0.3s ease-in-out' }}>
          <AbonneCard key={data.abonne.numab} abonne={data.abonne} />
          <FacturesList 
            factures={data.factures} 
            onPrint={(f) => {
              setSelectedFacture(f);
              setTimeout(() => window.print(), 100);
            }} 
          />
        </div>
      )}

      {/* Composant d'impression (masqué à l'écran) */}
      {data && selectedFacture && (
        <InvoicePrint abonne={data.abonne} facture={selectedFacture} />
      )}

      {/* Mini animation CSS intégrée pour la démo */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
