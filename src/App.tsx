import React, { useState } from 'react';
import { performSeek } from './mockData';
import type { DossierRecherche } from './types';
import { SearchBar } from './components/SearchBar';
import { AbonneCard } from './components/AbonneCard';
import { FacturesList } from './components/FacturesList';
import { InvoicePrint } from './components/InvoicePrint';
import { InvoicesTablePrint } from './components/InvoicesTablePrint';
import { PaymentStats } from './components/PaymentStats';
import { PaymentDurationChart } from './components/PaymentDurationChart';
import type { Facture } from './types';

export default function App() {
  const [data, setData] = useState<DossierRecherche | null>(null);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isPrintingTable, setIsPrintingTable] = useState(false);
  const [printFilter, setPrintFilter] = useState<'all' | 'impayee'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = React.useCallback(async (numab: string) => {
    setIsLoading(true);
    setError(null);
    
    // Appel du service (qui simule le NTX)
    try {
      const response = await fetch(`http://${window.location.hostname}:3001/api/abonne/${numab}`);
      if (!response.ok) throw new Error("Abonné non trouvé");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setData(null);
      setError(`Aucun abonné trouvé pour le code : ${numab}`);
    }
    
    setIsLoading(false);
  }, []);

  const handlePrintTable = (filter: 'all' | 'impayee') => {
    setSelectedFacture(null);
    setPrintFilter(filter);
    setIsPrintingTable(true);
    setTimeout(() => window.print(), 100);
  };

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
            <PaymentStats factures={data.factures} />
            <PaymentDurationChart factures={data.factures} />
          </div>
          <FacturesList 
            factures={data.factures} 
            onPrint={(f) => {
              setIsPrintingTable(false);
              setSelectedFacture(f);
              setTimeout(() => window.print(), 100);
            }} 
            onPrintTable={handlePrintTable}
          />
        </div>
      )}

      {/* Composant d'impression (masqué à l'écran) */}
      {data && selectedFacture && !isPrintingTable && (
        <InvoicePrint 
          abonne={data.abonne} 
          facture={selectedFacture} 
          allFactures={data.factures} 
        />
      )}

      {data && isPrintingTable && (
        <div className="print-container" style={{ width: '100%', height: 'auto', position: 'static' }}>
          <InvoicesTablePrint 
            abonne={data.abonne} 
            factures={
              printFilter === 'all' 
                ? data.factures 
                : printFilter === 'payee'
                  ? data.factures.filter(f => f.date_reglement)
                  : data.factures.filter(f => !f.date_reglement)
            } 
          />
        </div>
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
