import React from 'react';
import { ContractData } from './types';

interface LeftPanelProps {
  data: ContractData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ data, onChange, onPrint }) => {
  return (
    <div className="sidebar no-print">
      <h2>Éditeur de Contrat</h2>
      <div className="form-group">
        <label>Nom de la société (Client)</label>
        <input type="text" name="nom_societe" value={data.nom_societe} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Représentant (Client)</label>
        <input type="text" name="nom_client" value={data.nom_client} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Adresse</label>
        <input type="text" name="adresse" value={data.adresse} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" name="email" value={data.email} onChange={onChange} />
      </div>
      <hr style={{ borderColor: '#374151', margin: '1.5rem 0' }} />
      <div className="form-group">
        <label>Nom de domaine principal</label>
        <input type="text" name="nom_de_domaine" value={data.nom_de_domaine} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Domaines de redirection (optionnel)</label>
        <input 
          type="text" 
          name="domaines_redirection" 
          value={data.domaines_redirection} 
          onChange={onChange} 
          placeholder="Ex: domaine.fr, domaine.net"
        />
      </div>
      <div className="form-group">
        <label>Prix création</label>
        <input type="text" name="prix_realisation" value={data.prix_realisation} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Prix maintenance annuel</label>
        <input type="text" name="prix_annuel" value={data.prix_annuel} onChange={onChange} />
      </div>
      <hr style={{ borderColor: '#374151', margin: '1.5rem 0' }} />
      <div className="form-group">
        <label>Lieu de signature</label>
        <input type="text" name="lieu" value={data.lieu} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>Date de signature</label>
        <input type="text" name="date" value={data.date} onChange={onChange} />
      </div>

      <button type="button" className="btn-print" onClick={onPrint}>
        Imprimer / PDF
      </button>
      <p style={{marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center'}}>
        Cliquez pour ouvrir la boîte de dialogue d'impression et choisissez "Enregistrer au format PDF".
      </p>
    </div>
  );
};