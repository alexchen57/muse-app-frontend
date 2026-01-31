import Dexie, { Table } from 'dexie';
import { MusicMetadata } from '../types/music';
import { HeartRateData, MWLData } from '../types/device';
import { StateHistory } from '../types/state';

export class MuseDatabase extends Dexie {
  music!: Table<MusicMetadata>;
  heartRate!: Table<HeartRateData>;
  mwl!: Table<MWLData>;
  stateHistory!: Table<StateHistory>;

  constructor() {
    super('MuseDB');
    this.version(1).stores({
      music: 'id, fileName, bpm, uploadDate',
      heartRate: 'timestamp, heartRate',
      mwl: 'timestamp, mwlIndex',
      stateHistory: 'id, state, startTime, endTime',
    });
  }
}

export const db = new MuseDatabase();
