import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { City, CityCreatePayload } from '../models/city.model';

const API = `${environment.apiUrl}/cities`;

@Injectable({ providedIn: 'root' })
export class CityService {
  constructor(private http: HttpClient) {}

  getList(regionId?: string): Observable<City[]> {
    let params = new HttpParams();
    if (regionId) params = params.set('regionId', regionId);
    const url = params.keys().length ? `${API}?${params.toString()}` : API;
    return this.http.get<City[]>(url);
  }

  getById(id: string): Observable<City> {
    return this.http.get<City>(`${API}/${id}`);
  }

  create(payload: CityCreatePayload): Observable<City> {
    return this.http.post<City>(API, payload);
  }

  update(id: string, payload: Partial<CityCreatePayload>): Observable<City> {
    return this.http.put<City>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
