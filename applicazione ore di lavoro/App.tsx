import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import CompanySetup from './components/CompanySetup';
import TimesheetForm from './components/TimesheetForm';
import ReportView from './components/ReportView';
import { Company, WorkEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BuildingIcon, ClockIcon, CalendarIcon, SaveIcon, UploadIcon } from './components/Icons';

enum View {
    TIMESHEET = 'timesheet',
    COMPANIES = 'companies',
    REPORT = 'report'
}

const EditEntryForm: React.FC<{
    entry: WorkEntry;
    companies: Company[];
    onSave: (entry: WorkEntry) => void;
    onCancel: () => void;
}> = ({ entry, companies, onSave, onCancel }) => {
    const [formData, setFormData] = useState(entry);

    useEffect(() => {
        setFormData(entry);
    }, [entry]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes('Hours') ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="edit-companyId" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Ditta</label>
                <select id="edit-companyId" name="companyId" value={formData.companyId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Data</label>
                <input type="date" id="edit-date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-regularHours" className="block text-sm font-medium">Ore Normali</label>
                    <input type="number" step="0.25" id="edit-regularHours" name="regularHours" value={formData.regularHours} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="edit-overtimeHours" className="block text-sm font-medium">Ore Straordinario</label>
                    <input type="number" step="0.25" id="edit-overtimeHours" name="overtimeHours" value={formData.overtimeHours} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
                </div>
            </div>
             <div>
                <label htmlFor="edit-breakHours" className="block text-sm font-medium">Ore Pausa</label>
                <input type="number" step="0.25" id="edit-breakHours" name="breakHours" value={formData.breakHours} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 dark:border-slate-500">Annulla</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Salva Modifiche</button>
            </div>
        </form>
    );
};

const EditCompanyForm: React.FC<{
    company: Company;
    onSave: (company: Company) => void;
    onCancel: () => void;
}> = ({ company, onSave, onCancel }) => {
    const [formData, setFormData] = useState(company);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="edit-company-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome Ditta</label>
                <input type="text" id="edit-company-name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" required />
            </div>
            <div>
                <label htmlFor="edit-company-rate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Prezzo Orario (€/h)</label>
                <input type="number" step="0.01" id="edit-company-rate" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm" required />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 dark:border-slate-500">Annulla</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Salva Modifiche</button>
            </div>
        </form>
    );
};


const App: React.FC = () => {
    const [companies, setCompanies] = useLocalStorage<Company[]>('companies', []);
    const [workEntries, setWorkEntries] = useLocalStorage<WorkEntry[]>('workEntries', []);
    const [activeView, setActiveView] = useState<View>(View.COMPANIES);
    const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addCompany = (company: Omit<Company, 'id'>) => {
        const newCompany: Company = { ...company, id: new Date().toISOString() };
        setCompanies(prev => [...prev, newCompany]);
    };

    const updateCompany = (updatedCompany: Company) => {
        setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
        setEditingCompany(null);
    };

    const deleteCompany = (id: string) => {
        if (window.confirm('Sei sicuro di voler eliminare questa ditta? Verranno eliminate anche tutte le registrazioni associate.')) {
            setCompanies(prev => prev.filter(c => c.id !== id));
            setWorkEntries(prev => prev.filter(w => w.companyId !== id));
            alert('Ditta eliminata con successo.');
        }
    };

    const addWorkEntry = (entry: Omit<WorkEntry, 'id'>) => {
        const newEntry: WorkEntry = { ...entry, id: new Date().toISOString() };
        setWorkEntries(prev => [...prev, newEntry]);
    };
    
    const updateWorkEntry = (updatedEntry: WorkEntry) => {
        setWorkEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
        setEditingEntry(null);
    };

    const deleteWorkEntry = (id: string) => {
        if(window.confirm('Sei sicuro di voler eliminare questa registrazione?')) {
            setWorkEntries(prev => prev.filter(entry => entry.id !== id));
        }
    }

    const exportData = () => {
        try {
            const data = {
                companies: companies,
                workEntries: workEntries,
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const date = new Date().toISOString().split('T')[0];
            link.download = `lupo_mac_pro_backup_${date}.json`;
            link.click();
        } catch (error) {
            console.error("Failed to export data", error);
            alert("Esportazione dati fallita.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Il contenuto del file non è valido.");
                }
                const data = JSON.parse(text);

                if (!data || !Array.isArray(data.companies) || !Array.isArray(data.workEntries)) {
                    throw new Error("Formato del file di backup non valido.");
                }

                if (window.confirm('Sei sicuro di voler importare i dati? Questa operazione sovrascriverà tutti i dati attuali.')) {
                    setCompanies(data.companies);
                    setWorkEntries(data.workEntries);
                    alert('Dati importati con successo!');
                }
            } catch (error) {
                console.error("Failed to import data", error);
                alert(`Importazione dati fallita. Assicurati che il file sia un backup valido. Errore: ${(error as Error).message}`);
            } finally {
                if(event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };


    const renderView = () => {
        switch(activeView) {
            case View.COMPANIES:
                return <CompanySetup companies={companies} addCompany={addCompany} deleteCompany={deleteCompany} onEdit={setEditingCompany} />;
            case View.REPORT:
                return <ReportView companies={companies} workEntries={workEntries} onEditEntry={setEditingEntry} onDeleteEntry={deleteWorkEntry} />;
            case View.TIMESHEET:
            default:
                return <TimesheetForm companies={companies} addWorkEntry={addWorkEntry} onSave={() => setActiveView(View.REPORT)} />;
        }
    };
    
    const NavButton: React.FC<{ to: View, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
        const isActive = activeView === to;
        const baseClasses = "flex flex-col sm:flex-row items-center justify-center gap-2 flex-grow px-4 py-3 font-bold text-sm sm:text-base transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-blue-500";
        const activeClasses = "bg-blue-600 text-white shadow-inner";
        const inactiveClasses = "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600";

        return (
            <button
                onClick={() => setActiveView(to)}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <nav className="sticky top-0 z-10 flex shadow-lg bg-slate-200 dark:bg-slate-800 no-print">
                <NavButton to={View.COMPANIES} icon={<BuildingIcon className="w-5 h-5"/>} label="Gestione Ditte" />
                <NavButton to={View.TIMESHEET} icon={<ClockIcon className="w-5 h-5"/>} label="Registra Ore" />
                <NavButton to={View.REPORT} icon={<CalendarIcon className="w-5 h-5"/>} label="Riepilogo Mensile" />
            </nav>
            <main className="flex-grow p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {renderView()}
                </div>
            </main>
            <footer className="bg-slate-800 dark:bg-slate-950 text-white text-center p-3 text-sm no-print">
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                    <button onClick={exportData} className="flex items-center justify-center w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700">
                        <SaveIcon className="w-5 h-5 mr-2"/> Esporta Tutti i Dati
                    </button>
                    <button onClick={handleImportClick} className="flex items-center justify-center w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <UploadIcon className="w-5 h-5 mr-2"/> Importa Dati
                    </button>
                    <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                 </div>
                <p>&copy; {new Date().getFullYear()} LUPO MAC PRO. I dati vengono salvati automaticamente nel browser.</p>
            </footer>

            {editingCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Modifica Ditta</h2>
                           <button onClick={() => setEditingCompany(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">&times;</button>
                        </div>
                        <EditCompanyForm company={editingCompany} onSave={updateCompany} onCancel={() => setEditingCompany(null)} />
                    </div>
                </div>
            )}

            {editingEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Modifica Registrazione</h2>
                           <button onClick={() => setEditingEntry(null)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">&times;</button>
                        </div>
                        <EditEntryForm entry={editingEntry} onSave={updateWorkEntry} onCancel={() => setEditingEntry(null)} companies={companies} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;