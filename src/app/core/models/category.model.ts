/**
 * Category model for product categories with optional parent (child categories).
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  parentId: string | null;
  level?: number;
  path?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** For create/update forms and API payloads */
export interface CategoryCreatePayload {
  name: string;
  slug?: string;
  description: string;
  active: boolean;
  parentId: string | null;
}
