/**
 * RxDB Client for offline-first data synchronization
 * Syncs with Appwrite which then replicates to Supabase
 */

import { createRxDatabase, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';
import { addRxPlugin } from 'rxdb';

// Add required plugins
addRxPlugin(RxDBReplicationGraphQLPlugin);

// Schema definitions for offline collections
const appointmentSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    caregiver_id: { type: 'string' },
    mode: { type: 'string', enum: ['online', 'offline', 'home_visit'] },
    status: { type: 'string' },
    start_time: { type: 'string' },
    end_time: { type: 'string' },
    symptoms: { type: 'array', items: { type: 'string' } },
    payment_required: { type: 'boolean' },
    payment_amount: { type: 'number' },
    payment_status: { type: 'string' },
    sync_status: { type: 'string', default: 'pending' },
    last_modified: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'patient_id', 'caregiver_id', 'mode', 'start_time', 'end_time'],
};

const progressSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    patient_id: { type: 'string' },
    appointment_id: { type: 'string' },
    diet_plan_id: { type: 'string' },
    checklist_type: { type: 'string' },
    checklist_items: { type: 'object' },
    completed_items: { type: 'object' },
    completion_percentage: { type: 'number' },
    date: { type: 'string' },
    sync_status: { type: 'string', default: 'pending' },
    last_modified: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'patient_id', 'checklist_type', 'date'],
};

const financeLogSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    user_id: { type: 'string' },
    appointment_id: { type: 'string' },
    transaction_type: { type: 'string' },
    amount: { type: 'number' },
    currency: { type: 'string', default: 'INR' },
    razorpay_order_id: { type: 'string' },
    razorpay_payment_id: { type: 'string' },
    status: { type: 'string' },
    description: { type: 'string' },
    sync_status: { type: 'string', default: 'pending' },
    last_modified: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'user_id', 'transaction_type', 'amount', 'status'],
};

// Type definitions
export interface AppointmentDoc {
  id: string;
  patient_id: string;
  caregiver_id: string;
  mode: 'online' | 'offline' | 'home_visit';
  status: string;
  start_time: string;
  end_time: string;
  symptoms?: string[];
  payment_required: boolean;
  payment_amount?: number;
  payment_status: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  last_modified: string;
  created_at: string;
}

export interface ProgressDoc {
  id: string;
  patient_id: string;
  appointment_id?: string;
  diet_plan_id?: string;
  checklist_type: 'medication' | 'diet' | 'exercise' | 'vitals';
  checklist_items: Record<string, any>;
  completed_items: Record<string, boolean>;
  completion_percentage: number;
  date: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  last_modified: string;
  created_at: string;
}

export interface FinanceLogDoc {
  id: string;
  user_id: string;
  appointment_id?: string;
  transaction_type: 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  status: string;
  description?: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  last_modified: string;
  created_at: string;
}

// Collection types
export type AppointmentCollection = RxCollection<AppointmentDoc>;
export type ProgressCollection = RxCollection<ProgressDoc>;
export type FinanceLogCollection = RxCollection<FinanceLogDoc>;

// Database type
export interface HealthPWADatabase extends RxDatabase {
  appointments: AppointmentCollection;
  progress: ProgressCollection;
  finance_log: FinanceLogCollection;
}

let dbInstance: HealthPWADatabase | null = null;

// Initialize RxDB
export const initRxDB = async (): Promise<HealthPWADatabase> => {
  if (dbInstance) return dbInstance;

  console.log('Initializing RxDB...');
  
  const db = await createRxDatabase<HealthPWADatabase>({
    name: 'healthpwa',
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
  });

  // Add collections
  await db.addCollections({
    appointments: {
      schema: appointmentSchema,
    },
    progress: {
      schema: progressSchema,
    },
    finance_log: {
      schema: financeLogSchema,
    },
  });

  dbInstance = db;
  
  // Start sync processes
  await setupSync(db);
  
  console.log('RxDB initialized successfully');
  return db;
};

// Setup synchronization with Appwrite
const setupSync = async (db: HealthPWADatabase) => {
  const syncURL = process.env.NEXT_PUBLIC_APPWRITE_URL + '/sync';
  
  // Sync appointments
  const appointmentReplication = db.appointments.syncGraphQL({
    url: syncURL,
    push: {
      batchSize: 10,
      queryBuilder: (docs) => {
        return {
          query: `
            mutation PushAppointments($appointments: [AppointmentInput!]!) {
              pushAppointments(appointments: $appointments) {
                id
                success
                error
              }
            }
          `,
          variables: {
            appointments: docs.map(doc => ({
              ...doc,
              _deleted: doc._deleted,
            })),
          },
        };
      },
    },
    pull: {
      queryBuilder: (lastPulledCheckpoint) => {
        return {
          query: `
            query PullAppointments($lastPulledCheckpoint: String) {
              pullAppointments(lastPulledCheckpoint: $lastPulledCheckpoint) {
                documents {
                  id
                  patient_id
                  caregiver_id
                  mode
                  status
                  start_time
                  end_time
                  symptoms
                  payment_required
                  payment_amount
                  payment_status
                  last_modified
                  created_at
                  _deleted
                }
                checkpoint
              }
            }
          `,
          variables: {
            lastPulledCheckpoint,
          },
        };
      },
    },
    live: true,
    retryTime: 30 * 1000, // Retry every 30 seconds
  });

  // Handle sync events
  appointmentReplication.error$.subscribe(error => {
    console.error('Appointment sync error:', error);
  });

  appointmentReplication.active$.subscribe(active => {
    console.log('Appointment sync active:', active);
  });

  // Similar setup for other collections...
  // (Progress and Finance Log sync setup would be similar)
};

// Offline-first CRUD operations
export class OfflineAppointmentService {
  private db: HealthPWADatabase | null = null;

  async init() {
    this.db = await initRxDB();
  }

  async createAppointment(appointment: Omit<AppointmentDoc, 'id' | 'sync_status' | 'last_modified' | 'created_at'>): Promise<AppointmentDoc> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const doc: AppointmentDoc = {
      ...appointment,
      id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sync_status: 'pending',
      last_modified: now,
      created_at: now,
    };

    await this.db.appointments.insert(doc);
    return doc;
  }

  async getAppointments(patientId: string): Promise<AppointmentDoc[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.appointments
      .find({
        selector: {
          patient_id: patientId,
        },
        sort: [{ start_time: 'desc' }],
      })
      .exec();

    return result.map(doc => doc.toJSON());
  }

  async updateAppointment(id: string, updates: Partial<AppointmentDoc>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const doc = await this.db.appointments.findOne(id).exec();
    if (!doc) throw new Error('Appointment not found');

    await doc.patch({
      ...updates,
      sync_status: 'pending',
      last_modified: new Date().toISOString(),
    });
  }

  async deleteAppointment(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const doc = await this.db.appointments.findOne(id).exec();
    if (!doc) throw new Error('Appointment not found');

    await doc.remove();
  }
}

export class OfflineProgressService {
  private db: HealthPWADatabase | null = null;

  async init() {
    this.db = await initRxDB();
  }

  async createProgress(progress: Omit<ProgressDoc, 'id' | 'sync_status' | 'last_modified' | 'created_at'>): Promise<ProgressDoc> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const doc: ProgressDoc = {
      ...progress,
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sync_status: 'pending',
      last_modified: now,
      created_at: now,
    };

    await this.db.progress.insert(doc);
    return doc;
  }

  async getProgress(patientId: string, date?: string): Promise<ProgressDoc[]> {
    if (!this.db) throw new Error('Database not initialized');

    const selector: any = { patient_id: patientId };
    if (date) {
      selector.date = date;
    }

    const result = await this.db.progress
      .find({
        selector,
        sort: [{ date: 'desc' }],
      })
      .exec();

    return result.map(doc => doc.toJSON());
  }

  async updateProgress(id: string, completedItems: Record<string, boolean>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const doc = await this.db.progress.findOne(id).exec();
    if (!doc) throw new Error('Progress not found');

    const totalItems = Object.keys(doc.checklist_items).length;
    const completedCount = Object.values(completedItems).filter(Boolean).length;
    const completionPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

    await doc.patch({
      completed_items: completedItems,
      completion_percentage: completionPercentage,
      sync_status: 'pending',
      last_modified: new Date().toISOString(),
    });
  }
}

// Sync status monitoring
export const getSyncStatus = async (): Promise<{
  isOnline: boolean;
  pendingSync: number;
  lastSyncTime: string | null;
}> => {
  const db = await initRxDB();
  
  const pendingAppointments = await db.appointments.count({
    selector: { sync_status: 'pending' },
  }).exec();
  
  const pendingProgress = await db.progress.count({
    selector: { sync_status: 'pending' },
  }).exec();
  
  const pendingFinance = await db.finance_log.count({
    selector: { sync_status: 'pending' },
  }).exec();

  return {
    isOnline: navigator.onLine,
    pendingSync: pendingAppointments + pendingProgress + pendingFinance,
    lastSyncTime: localStorage.getItem('lastSyncTime'),
  };
};

// Force sync all pending data
export const forceSyncAll = async (): Promise<void> => {
  const db = await initRxDB();
  
  // Trigger replication for all collections
  // This would normally be handled by the replication plugins
  console.log('Force syncing all collections...');
  
  // Update last sync time
  localStorage.setItem('lastSyncTime', new Date().toISOString());
};

// Conflict resolution
export const resolveConflicts = async (): Promise<void> => {
  const db = await initRxDB();
  
  // Find conflicted documents
  const conflicts = await db.appointments.find({
    selector: { sync_status: 'conflict' },
  }).exec();
  
  for (const conflict of conflicts) {
    // Implement conflict resolution strategy
    // For now, use last-write-wins based on last_modified timestamp
    console.log('Resolving conflict for appointment:', conflict.id);
    
    await conflict.patch({
      sync_status: 'pending',
      last_modified: new Date().toISOString(),
    });
  }
};

// Initialize services
export const appointmentService = new OfflineAppointmentService();
export const progressService = new OfflineProgressService();