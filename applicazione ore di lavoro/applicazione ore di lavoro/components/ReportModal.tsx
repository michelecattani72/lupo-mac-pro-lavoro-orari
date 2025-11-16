import React, { useEffect, useMemo } from 'react';
import { CalculatedEntry } from '../types';
import { PrinterIcon } from './Icons';

interface ReportModalProps {
    onClose: () => void;
    selectedMonth: string;
    filteredEntries: CalculatedEntry[];
    totals: {
        regularHours: number;
        overtimeHours: number;
        totalHours: number;
        earnings: number;
    };
    annualTotal: number;
}

const ReportModal: React.FC<ReportModalProps> = ({ onClose, selectedMonth, filteredEntries, totals, annualTotal }) => {
    
    // This effect correctly handles print-specific styles by adding/removing a class on the body
    // only during the print operation. This is more robust than toggling on mount/unmount.
    useEffect(() => {
        const beforePrint = () => document.body.classList.add('modal-is-printing');
        const afterPrint = () => document.body.classList.remove('modal-is-printing');

        window.addEventListener('beforeprint', beforePrint);
        window.addEventListener('afterprint', afterPrint);

        return () => {
            window.removeEventListener('beforeprint', beforePrint);
            window.removeEventListener('afterprint', afterPrint);
            document.body.classList.remove('modal-is-printing'); // Cleanup on unmount
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };
    
    const monthName = new Date(selectedMonth + '-02').toLocaleString('it-IT', { month: 'long', year: 'numeric' });

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


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 no-print" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-6xl max-h-full overflow-y-auto">
                <div id="printable-report-modal">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Report Mensile: {monthName}</h2>
                       <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 text-3xl font-bold no-print">&times;</button>
                    </div>

                    <div className="space-y-8">
                        {Object.keys(groupedEntries).length > 0 ? Object.keys(groupedEntries).map(companyId => {
                            const entries = groupedEntries[companyId];
                            const companyName = entries[0]?.companyName || 'Sconosciuta';
                            const companyMonthlyTotal = entries.reduce((acc, entry) => acc + entry.earnings, 0);

                            return (
                                <div key={companyId} className="break-inside-avoid">
                                    <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">{companyName}</h3>
                                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                            <thead className="bg-slate-50 dark:bg-slate-700">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Data</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ore (Reg/Stra)</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Pausa</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Compenso</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Note / Macchinario</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                                {entries.map(entry => (
                                                <tr key={entry.id}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{new Date(entry.date + 'T00:00:00').toLocaleDateString('it-IT', {weekday: 'short', day: '2-digit', month: '2-digit'})}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{`${entry.regularHours.toFixed(2)} / ${entry.overtimeHours.toFixed(2)}`}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{entry.breakHours.toFixed(2)}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">€{entry.earnings.toFixed(2)}</td>
                                                    <td className="px-4 py-4 whitespace-normal text-sm max-w-xs break-words">
                                                    {entry.machineCode && <strong>{entry.machineCode}</strong>}
                                                    {entry.machineCode && entry.notes && <br />}
                                                    {entry.notes}
                                                    {entry.photo && <a href={entry.photo} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block mt-1">Vedi Foto</a>}
                                                    </td>
                                                </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold">
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200 uppercase">Totale {companyName}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">€{companyMonthlyTotal.toFixed(2)}</td>
                                                    <td className="px-4 py-4"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                Nessuna registrazione per il mese selezionato.
                            </div>
                        )}
                    </div>
                    
                    {filteredEntries.length > 0 && (
                      <div className="mt-8 pt-6 border-t-2 border-slate-300 dark:border-slate-600 space-y-2 text-slate-800 dark:text-slate-100 break-inside-avoid">
                          <h4 className="text-xl font-bold text-right mb-4">Riepilogo Generale</h4>
                          <div className="flex justify-end">
                              <div className="w-full max-w-md space-y-2">
                                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-3 rounded-md">
                                      <span className="font-semibold">Totale Fatturato Mese (Tutte le Ditte):</span>
                                      <span className="font-bold text-lg">€{totals.earnings.toFixed(2)}</span>
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

                <div className="mt-6 flex justify-end gap-3 no-print">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 dark:border-slate-500">Chiudi</button>
                    <button type="button" onClick={handlePrint} className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <PrinterIcon className="w-5 h-5 mr-2"/> Stampa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
