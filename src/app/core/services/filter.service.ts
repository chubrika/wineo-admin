import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Filter, FilterCreatePayload } from '../models/filter.model';

const API = `${environment.apiUrl}/filters`;

@Injectable({ providedIn: 'root' })
export class FilterService {
  private filters: Filter[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Load all filters (including inactive) for admin. Pass all=true.
   * For public list pass categoryId and omit all.
   */
  loadFilters(params?: { categoryId?: string; all?: boolean }): Observable<Filter[]> {
    let url = API;
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.all) query.set('all', '1');
    if (query.toString()) url += `?${query.toString()}`;

    return this.http.get<Filter[]>(url).pipe(
      tap((list) => {
        this.filters = list;
      })
    );
  }

  getByCategory(categoryId: string): Observable<Filter[]> {
    return this.http.get<Filter[]>(`${API}/by-category/${categoryId}`);
  }

  getAll(): Filter[] {
    return [...this.filters];
  }

  create(payload: FilterCreatePayload): Observable<Filter> {
    return this.http.post<Filter>(API, payload);
  }

  update(id: string, payload: Partial<FilterCreatePayload>): Observable<Filter> {
    return this.http.put<Filter>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
