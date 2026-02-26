import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Category, CategoryCreatePayload } from '../models/category.model';

const API = `${environment.apiUrl}/categories`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categories: Category[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Load all categories from the API and cache them.
   * Call this on page init and after create/update/delete.
   */
  loadCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API).pipe(
      tap((list) => {
        this.categories = list;
      })
    );
  }

  getAll(): Category[] {
    return [...this.categories];
  }

  /** Returns only top-level categories (no parent). */
  getRoots(): Category[] {
    return this.categories.filter((c) => !c.parentId);
  }

  /** Returns children of a given parent id. */
  getChildren(parentId: string): Category[] {
    return this.categories.filter((c) => c.parentId === parentId);
  }

  /** Build a flat list suitable for parent dropdown (roots first, then by name). */
  getOptionsForParent(excludeId?: string): Category[] {
    return this.categories
      .filter((c) => c.id !== excludeId)
      .sort((a, b) => {
        const aRoot = !a.parentId ? 0 : 1;
        const bRoot = !b.parentId ? 0 : 1;
        if (aRoot !== bRoot) return aRoot - bRoot;
        return a.name.localeCompare(b.name);
      });
  }

  create(payload: CategoryCreatePayload): Observable<Category> {
    return this.http.post<Category>(API, payload);
  }

  getById(id: string): Observable<Category | null> {
    return this.http.get<Category>(`${API}/${id}`);
  }

  update(id: string, payload: Partial<CategoryCreatePayload>): Observable<Category> {
    return this.http.put<Category>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
