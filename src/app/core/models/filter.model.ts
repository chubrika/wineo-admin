/**
 * Filter model for category-based product filters.
 */

export type FilterType = 'select' | 'range' | 'checkbox' | 'number' | 'text';

export interface Filter {
  id: string;
  name: string;
  slug: string;
  type: FilterType;
  options?: string[];
  unit: string;
  categoryId: string;
  applyToChildren: boolean;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface FilterCreatePayload {
  name: string;
  slug?: string;
  type: FilterType;
  options?: string[];
  unit?: string;
  categoryId: string;
  applyToChildren?: boolean;
  isRequired?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}
