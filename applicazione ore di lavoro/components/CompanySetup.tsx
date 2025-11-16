import React, { useState } from 'react';
import { Company } from '../types';
import { BuildingIcon, PlusIcon, TrashIcon, EditIcon } from './Icons';

interface CompanySetupProps {
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  deleteCompany: (id: string) => void;
  onEdit: (company: Company) => void;
}

const CompanySetup: React.FC<CompanySetupProps> = ({ companies, addCompany, deleteCompany, onEdit }) => {
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && hourlyRate) {
      addCompany({
        name,
        hourlyRate: parseFloat(hourlyRate),
      });
      setName('');
      setHourlyRate('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 flex items-center text-slate-700 dark:text-slate-200"><BuildingIcon className="w-6 h-6 mr-2" />Aggiungi Nuova Ditta</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome della Ditta*</label>
            <input
              id="companyName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Prezzo Orario (€/h)*</label>
            <input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PlusIcon className="w-5 h-5 mr-2" /> Salva Ditta
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Ditte Esistenti</h3>
        <ul className="space-y-3">
          {companies.length > 0 ? companies.map((company) => (
            <li key={company.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
              <div>
                <p className="font-semibold">{company.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">€{company.hourlyRate.toFixed(2)}/ora</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => onEdit(company)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-slate-600 rounded-full" aria-label={`Modifica ${company.name}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => deleteCompany(company.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-slate-600 rounded-full" aria-label={`Cancella ${company.name}`}>
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          )) : (
            <p className="text-slate-500 dark:text-slate-400">Nessuna ditta ancora inserita.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CompanySetup;