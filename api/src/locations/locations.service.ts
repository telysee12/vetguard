import { Injectable } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

type HuyeDatasetObject = Record<string, Record<string, string[]>>; // sector -> cell -> villages
type HuyeDatasetArray = Record<string, [string, string[]][]>; // sector -> [cell, villages][]
type HuyeDataset = HuyeDatasetObject;

@Injectable()
export class LocationsService {
  private readonly huye: HuyeDataset;

  constructor() {
    // Try dist path first (when built), then fallback to src path (dev)
    const candidates = [
      join(__dirname, 'data', 'huye-villages.json'),
      join(__dirname, '..', '..', 'src', 'locations', 'data', 'huye-villages.json'),
    ];
    const filePath = candidates.find(p => existsSync(p));
    if (!filePath) {
      throw new Error('huye-villages.json not found in expected locations');
    }
    const json = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(json) as HuyeDatasetObject | HuyeDatasetArray;
    // Coerce to object-map shape regardless of input format
    const asObject: HuyeDatasetObject = {} as HuyeDatasetObject;
    for (const sector of Object.keys(parsed)) {
      const value = (parsed as any)[sector];
      if (Array.isArray(value)) {
        // array form: [cell, villages][]
        const map: Record<string, string[]> = {};
        for (const entry of value as [string, string[]][]) {
          const [cell, villages] = entry;
          map[cell] = villages;
        }
        (asObject as any)[sector] = map;
      } else {
        // already object map
        (asObject as any)[sector] = value as Record<string, string[]>;
      }
    }
    this.huye = asObject as HuyeDataset;
  }

  private normalize(s: string): string {
    return s.normalize('NFKC').trim().toLowerCase();
  }

  getVillagesByCell(cellName: string): string[] {
    const n = this.normalize(cellName);

    // search across all sectors' cells for a normalized match
    for (const sectorName of Object.keys(this.huye)) {
      const cells = this.huye[sectorName] || {};
      for (const cellKey of Object.keys(cells)) {
        if (this.normalize(cellKey) === n) {
          return [...(cells[cellKey] || [])];
        }
      }
    }
    return [];
  }
}


