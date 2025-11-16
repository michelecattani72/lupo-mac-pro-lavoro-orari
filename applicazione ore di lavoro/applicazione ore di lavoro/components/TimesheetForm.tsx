import React, { useState, useEffect, useRef } from 'react';
import { Company, WorkEntry } from '../types.ts';
import { SaveIcon, MicIcon } from './Icons.tsx';

// Fix: Add a local interface for SpeechRecognition to resolve TypeScript error.
// The Web Speech API types are not included in default TS DOM typings.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface TimesheetFormProps {
  companies: Company[];
  addWorkEntry: (entry: Omit<WorkEntry, 'id'>) => void;
  onSave: () => void;
}

// @ts-ignore
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const TimesheetForm: React.FC<TimesheetFormProps> = ({ companies, addWorkEntry, onSave }) => {
  const [companyId, setCompanyId] = useState<string>(companies[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [regularHours, setRegularHours] = useState('');
  const [overtimeHours, setOvertimeHours] = useState('');
  const [breakHours, setBreakHours] = useState('');
  const [machineCode, setMachineCode] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoName, setPhotoName] = useState('');

  const [isListening, setIsListening] = useState(false);
  // Fix: The type `SpeechRecognition` was shadowed by a constant with the same name.
  // The constant is renamed to `SpeechRecognitionAPI` to avoid conflict.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'it-IT';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setNotes(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (isListening) setIsListening(false);
    };

    recognition.onend = () => {
      if(isListening) setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoName(file.name);
      const base64 = await fileToBase64(file);
      setPhoto(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !date || (!regularHours && !overtimeHours)) {
        alert("Per favore compila Ditta, Data, e almeno un campo ore.");
        return;
    }
    addWorkEntry({
      companyId,
      date,
      regularHours: parseFloat(regularHours) || 0,
      overtimeHours: parseFloat(overtimeHours) || 0,
      breakHours: parseFloat(breakHours) || 0,
      machineCode,
      notes,
      photo,
    });
    onSave();
  };

  if (companies.length === 0) {
    return (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-md" role="alert">
            <p className="font-bold">Attenzione</p>
            <p>Devi prima aggiungere almeno una ditta nella sezione "Gestione Ditte" per poter registrare le ore.</p>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Registrazione Giornaliera</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companySelect" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Ditta di Lavoro*</label>
          <select
            id="companySelect"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required>
                <option value="" disabled>Seleziona una ditta</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Data*</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="regularHours" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Ore Lavorate Normali</label>
            <input
              id="regularHours"
              type="number"
              step="0.25"
              placeholder="es. 8"
              value={regularHours}
              onChange={(e) => setRegularHours(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="overtimeHours" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Ore di Straordinario</label>
            <input
              id="overtimeHours"
              type="number"
              step="0.25"
              placeholder="es. 2.5"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
            <label htmlFor="breakHours" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Ore Pausa Pranzo</label>
            <input
              id="breakHours"
              type="number"
              step="0.25"
              placeholder="es. 1.0"
              value={breakHours}
              onChange={(e) => setBreakHours(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        <div>
          <label htmlFor="machineCode" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Macchinario / Codice Lavoro</label>
          <input
            id="machineCode"
            type="text"
            value={machineCode}
            onChange={(e) => setMachineCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Note e Prove</label>
          <div className="relative">
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
            />
            {SpeechRecognitionAPI && (
                <button type="button" onClick={handleToggleListening} className={`absolute top-2 right-2 p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300'}`}>
                    <MicIcon className="w-5 h-5"/>
                </button>
            )}
          </div>
          {!SpeechRecognitionAPI && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                La dettatura vocale non è supportata da questo browser. Prova a usare Google Chrome.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Allega Fotografia</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Carica un file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                </label>
                <p className="pl-1">o trascina qui</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">{photoName || 'PNG, JPG, GIF fino a 10MB'}</p>
            </div>
          </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <SaveIcon className="w-5 h-5 mr-2" /> Salva Registrazione
        </button>
      </form>
    </div>
  );
};

export default TimesheetForm;