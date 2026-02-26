/**
 * Region model for wine regions (used in listings location).
 */

export interface Region {
  id: string;
  slug: string;
  label: string;
  createdAt?: string;
  updatedAt?: string;
}

/** For create/update forms and API payloads */
export interface RegionCreatePayload {
  slug?: string;
  label: string;
}
