import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Listing, ListingCreatePayload } from '../models/listing.model';

const API = `${environment.apiUrl}/products`;

@Injectable({ providedIn: 'root' })
export class ListingService {
  constructor(private http: HttpClient) {}

  getList(params?: { status?: string; type?: string; categorySlug?: string; limit?: number; skip?: number }): Observable<Listing[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.categorySlug) httpParams = httpParams.set('categorySlug', params.categorySlug);
    if (params?.limit != null) httpParams = httpParams.set('limit', params.limit);
    if (params?.skip != null) httpParams = httpParams.set('skip', params.skip);

    const url = httpParams.keys().length ? `${API}?${httpParams.toString()}` : API;
    return this.http.get<Listing[]>(url);
  }

  getById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${API}/${id}`);
  }

  create(payload: ListingCreatePayload): Observable<Listing> {
    return this.http.post<Listing>(API, payload);
  }

  update(id: string, payload: Partial<ListingCreatePayload>): Observable<Listing> {
    return this.http.put<Listing>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
