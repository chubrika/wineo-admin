/**
 * City model; each city belongs to a region.
 */

import type { Region } from './region.model';

export interface City {
  id: string;
  slug: string;
  label: string;
  regionId: string;
  region?: Region | null;
  createdAt?: string;
  updatedAt?: string;
}

/** For create/update forms and API payloads */
export interface CityCreatePayload {
  slug?: string;
  label: string;
  regionId: string;
}
