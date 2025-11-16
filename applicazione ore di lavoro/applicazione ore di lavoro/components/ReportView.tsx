import React, { useMemo, useState } from 'react';
import { Company, WorkEntry, CalculatedEntry } from '../types';
import { PrinterIcon, SaveIcon, EditIcon, TrashIcon } from './Icons';
import ReportModal from './ReportModal';

interface ReportViewProps {
  companies: Company[];
  workEntries: WorkEntry[];
  onEditEntry: (entry: WorkEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const ReportView: React.FC<ReportViewProps> = ({ companies, workEntries, onEditEntry, onDeleteEntry }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c])), [companies]);

  const calculatedEntries = useMemo((): CalculatedEntry[] => {
    return workEntries
      .map(entry => {
        const company = companyMap.get(entry.companyId);
        if (!company) return null;

        const paidRegularHours = Math.max(0, (entry.regularHours || 0) - (entry.breakHours || 0));
        const netHours = paidRegularHours + (entry.overtimeHours || 0);
        const earnings = (paidRegularHours * company.hourlyRate) + ((entry.overtimeHours || 0) * company.hourlyRate * 1.5);

        return {
          ...entry,
          companyName: company.name,
          hourlyRate: company.hourlyRate,
          netHours,
          earnings,
        };
      })
      .filter((e): e is CalculatedEntry => e !== null)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workEntries, companyMap]);

  const filteredByMonth = useMemo(() => {
    return calculatedEntries.filter(entry => entry.date.startsWith(selectedMonth));
  }, [calculatedEntries, selectedMonth]);

  const filteredEntries = useMemo(() => {
    if (selectedCompanyId === 'all') {
      return filteredByMonth;
    }
    return filteredByMonth.filter(entry => entry.companyId === selectedCompanyId);
  }, [filteredByMonth, selectedCompanyId]);


  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => {
        acc.regularHours += entry.regularHours;
        acc.overtimeHours += entry.overtimeHours;
        acc.breakHours += entry.breakHours;
        acc.totalHours += entry.netHours;
        acc.earnings += entry.earnings;
        return acc;
      },
      { regularHours: 0, overtimeHours: 0, breakHours: 0, totalHours: 0, earnings: 0 }
    );
  }, [filteredEntries]);
  
  const monthTotalAllCompanies = useMemo(() => {
    return filteredByMonth.reduce((sum, entry) => sum + entry.earnings, 0);
  }, [filteredByMonth]);

  const annualTotal = useMemo(() => {
    if (!selectedMonth) return 0;
    const year = selectedMonth.slice(0, 4);
    return calculatedEntries
        .filter(entry => entry.date.startsWith(year))
        .reduce((sum, entry) => sum + entry.earnings, 0);
  }, [calculatedEntries, selectedMonth]);

    const groupedEntries = useMemo(() => {
        return filteredEntries.reduce((acc, entry) => {
            const companyId = entry.companyId;
            if (!acc[companyId]) {
                acc[companyId] = [];
            }
            acc[companyId].push(entry);
            return acc;
        }, {} as Record<string, CalculatedEntry[]>);
    }, [filteredEntries]);


  const availableMonths = useMemo(() => {
    const months = new Set(workEntries.map(e => e.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [workEntries]);

  const handleSave = () => {
    if (filteredEntries.length === 0) {
      alert("Nessun dato da salvare per il mese selezionato.");
      return;
    }

    const headers = [
      "Data", "Ditta", "Ore Normali", "Ore Straordinario", "Ore Pausa", 
      "Codice Macchinario", "Note", "Compenso (€)"
    ];

    const rows = filteredEntries.map(entry => [
      new Date(entry.date + 'T00:00:00').toLocaleDateString('it-IT'),
      entry.companyName,
      entry.regularHours.toFixed(2),
      entry.overtimeHours.toFixed(2),
      entry.breakHours.toFixed(2),
      `"${entry.machineCode.replace(/"/g, '""')}"`,
      `"${entry.notes.replace(/"/g, '""')}"`,
      entry.earnings.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    const monthName = new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    link.download = `report_lupo_mac_pro_${monthName.replace(/\s/g, '_')}.csv`;
    link.click();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-grow flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select 
            id="month-select"
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
              </option>
            ))}
             {availableMonths.length === 0 && <option value="">Nessun dato</option>}
          </select>
          <select 
            id="company-select"
            value={selectedCompanyId} 
            onChange={e => setSelectedCompanyId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
             <option value="all">Tutte le Ditte</option>
             {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 no-print">
            <button onClick={() => setIsReportModalOpen(true)} className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <PrinterIcon className="w-5 h-5 mr-2"/> Genera Report
            </button>
            <button onClick={handleSave} className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700">
                <SaveIcon className="w-5 h-5 mr-2"/> Salva
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Totale Ore Normali</h4>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totals.regularHours.toFixed(2)}</p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Totale Ore Straordinario</h4>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{totals.overtimeHours.toFixed(2)}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Totale Ore Pausa</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.breakHours.toFixed(2)}</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Totale Ore Lavorate</h4>
          <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{totals.totalHours.toFixed(2)}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg shadow text-center">
          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">Totale Compenso in Euro</h4>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">€{totals.earnings.toFixed(2)}</p>
        </div>
      </div>

      <div id="printable-area">
        <h3 className="text-2xl font-bold p-4 text-center text-slate-700 dark:text-slate-200">Riepilogo Mensile - {new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</h3>
        {Object.keys(groupedEntries).length > 0 ? Object.keys(groupedEntries).map(companyId => {
            const entries = groupedEntries[companyId];
            const company = companyMap.get(companyId);
            const companyMonthlyTotal = entries.reduce((acc, entry) => acc + entry.earnings, 0);
            return (
                <div key={companyId} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto mb-8 break-inside-avoid">
                    <h4 className="text-xl font-bold p-4 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100">{company?.name}</h4>
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ore (Reg/Stra)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Pausa</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Compenso</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Note / Macchinario</th>
                        <th scope="col" className="relative px-6 py-3 no-print"><span className="sr-only">Azioni</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {entries.map(entry => (
                        <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{new Date(entry.date + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'short', day: '2-digit', month: '2-digit'})}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{`${entry.regularHours.toFixed(2)} / ${entry.overtimeHours.toFixed(2)}`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.breakHours.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">€{entry.earnings.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-normal text-sm max-w-xs break-words">
                            {entry.machineCode && <strong>{entry.machineCode}</strong>}
                            {entry.machineCode && entry.notes && <br />}
                            {entry.notes}
                            {entry.photo && <a href={entry.photo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block mt-1">Vedi Foto</a>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium no-print">
                                <button onClick={() => onEditEntry(entry)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDeleteEntry(entry.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5"/></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold">
                        <tr>
                            <td colSpan={3} className="px-6 py-3 text-right text-sm text-slate-700 dark:text-slate-200 uppercase">Totale Mese {company?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">€{companyMonthlyTotal.toFixed(2)}</td>
                            <td colSpan={2} className=""></td>
                        </tr>
                    </tfoot>
                    </table>
                </div>
            )
        }) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                Nessuna registrazione per il mese selezionato.
            </div>
        )}
        
        {Object.keys(groupedEntries).length > 0 && (
          <div className="mt-8 pt-4 border-t-2 border-slate-300 dark:border-slate-600 space-y-2 text-slate-800 dark:text-slate-100 break-inside-avoid">
              <h4 className="text-xl font-bold text-right mb-4">Riepilogo Generale</h4>
              <div className="flex justify-end">
                  <div className="w-full max-w-md space-y-2">
                      {selectedCompanyId !== 'all' && companyMap.has(selectedCompanyId) && (
                          <div className="flex justify-between items-center bg-yellow-100 dark:bg-yellow-900 p-3 rounded-md text-yellow-800 dark:text-yellow-100">
                              <span className="font-semibold">Totale Mese ({companyMap.get(selectedCompanyId)?.name}):</span>
                              <span className="font-bold text-lg">€{totals.earnings.toFixed(2)}</span>
                          </div>
                      )}
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                          <span className="font-semibold">Totale Fatturato Mese (Tutte le Ditte):</span>
                          <span className="font-bold text-lg">€{monthTotalAllCompanies.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                          <span className="font-semibold">Totale Fatturato Anno {selectedMonth.slice(0, 4)} (Tutte le Ditte):</span>
                          <span className="font-bold text-lg">€{annualTotal.toFixed(2)}</span>
                      </div>
                  </div>
              </div>
          </div>
        )}

      </div>

       {isReportModalOpen && (
        <ReportModal
            onClose={() => setIsReportModalOpen(false)}
            selectedMonth={selectedMonth}
            filteredEntries={filteredEntries}
            totals={totals}
            annualTotal={annualTotal}
        />
      )}
    </div>
  );
};

export default ReportView;