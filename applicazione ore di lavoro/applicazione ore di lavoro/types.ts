
export interface Company {
  id: string;
  name: string;
  hourlyRate: number;
}

export interface WorkEntry {
  id:string;
  companyId: string;
  date: string; // YYYY-MM-DD
  regularHours: number;
  overtimeHours: number;
  breakHours: number;
  machineCode: string;
  notes: string;
  photo?: string; // base64 encoded image
}

export interface CalculatedEntry extends WorkEntry {
    companyName: string;
    hourlyRate: number;
    netHours: number;
    earnings: number;
}
