import fs from 'fs/promises';
import path from 'path';

export interface ClientEvent {
  id: string;
  title: string;
  date: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  packageName: string;
  status: 'onboarding' | 'shooting' | 'photo-editing' | 'video-editing' | 'delivered';
  events: ClientEvent[];
  notes?: string;
  totalAmount?: number;
  amountPaid?: number;
  paymentHistory?: PaymentTransaction[];
}

export interface Resource {
  id: string;
  name: string;
  pricePerDay: number;
  unit: string;
  icon: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface PackageDayItem {
  resourceId: string;
  qty: number;
}

export interface PackageDay {
  title: string;
  image: string; // e.g. "/uploads/haldi.png"
  items: PackageDayItem[];
}

export interface Package {
  id: string;
  name: string;
  days: PackageDay[];
  addons: string[]; // addon ids
  autoPrice: number;
  finalPrice: number;
  status: 'published' | 'draft';
}

export interface CustomPackageDetails {
  days: PackageDay[];
  addons: string[];
  totalPrice: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  eventDate?: string;
  packageName?: string;
  packageId?: string;
  type: 'predefined' | 'custom' | 'general';
  customDetails?: {
    days: {
      title: string;
      items: { resourceId: string; qty: number }[];
    }[];
    addons: string[];
    totalPrice: number;
  };
  specialNotes?: string;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
}

export interface Admin {
  email: string;
  passwordHash: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'camera' | 'lens' | 'drone' | 'lighting' | 'audio' | 'other';
  description?: string;
  image?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'youtube' | 'photo';
  url: string;
  thumbnail?: string;
  description?: string;
}

// Helper to get file paths
const getDataFilePath = (fileName: string): string => {
  return path.join(process.cwd(), 'data', fileName);
};

// Generic read helper
async function readJsonFile<T>(fileName: string, defaultValue: T): Promise<T> {
  const filePath = getDataFilePath(fileName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error: any) {
    // If file doesn't exist, try to write default value and return it
    if (error.code === 'ENOENT') {
      await writeJsonFile(fileName, defaultValue);
      return defaultValue;
    }
    console.error(`Error reading ${fileName}:`, error);
    return defaultValue;
  }
}

// Generic write helper
async function writeJsonFile<T>(fileName: string, data: T): Promise<boolean> {
  const filePath = getDataFilePath(fileName);
  try {
    // Ensure the data directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
}

// Exported DB Functions
export async function getAdmin(): Promise<Admin | null> {
  const admins = await readJsonFile<Admin | null>('admin.json', null);
  return admins;
}

export async function getResources(): Promise<Resource[]> {
  return readJsonFile<Resource[]>('resources.json', []);
}

export async function saveResources(resources: Resource[]): Promise<boolean> {
  return writeJsonFile<Resource[]>('resources.json', resources);
}

export async function getAddons(): Promise<Addon[]> {
  return readJsonFile<Addon[]>('addons.json', []);
}

export async function saveAddons(addons: Addon[]): Promise<boolean> {
  return writeJsonFile<Addon[]>('addons.json', addons);
}

export async function getPackages(): Promise<Package[]> {
  return readJsonFile<Package[]>('packages.json', []);
}

export async function savePackages(packages: Package[]): Promise<boolean> {
  return writeJsonFile<Package[]>('packages.json', packages);
}

export async function getInquiries(): Promise<Inquiry[]> {
  return readJsonFile<Inquiry[]>('inquiries.json', []);
}

export async function saveInquiries(inquiries: Inquiry[]): Promise<boolean> {
  return writeJsonFile<Inquiry[]>('inquiries.json', inquiries);
}

export async function getEquipment(): Promise<Equipment[]> {
  return readJsonFile<Equipment[]>('equipment.json', []);
}

export async function saveEquipment(equipment: Equipment[]): Promise<boolean> {
  return writeJsonFile<Equipment[]>('equipment.json', equipment);
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  return readJsonFile<PortfolioItem[]>('portfolio.json', []);
}

export async function savePortfolio(portfolio: PortfolioItem[]): Promise<boolean> {
  return writeJsonFile<PortfolioItem[]>('portfolio.json', portfolio);
}

export async function getClients(): Promise<Client[]> {
  return readJsonFile<Client[]>('clients.json', []);
}

export async function saveClients(clients: Client[]): Promise<boolean> {
  return writeJsonFile<Client[]>('clients.json', clients);
}

// Extract and flatten events from all clients for the calendar view
export async function getEvents(): Promise<(ClientEvent & { clientName: string, clientId: string })[]> {
  const clients = await getClients();
  const allEvents: (ClientEvent & { clientName: string, clientId: string })[] = [];
  
  clients.forEach(client => {
    if (client.events) {
      client.events.forEach(evt => {
        allEvents.push({
          ...evt,
          clientName: client.name,
          clientId: client.id
        });
      });
    }
  });
  
  return allEvents;
}
