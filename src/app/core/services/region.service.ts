import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { Region, RegionCreatePayload } from '../models/region.model';

const API = `${environment.apiUrl}/regions`;

@Injectable({ providedIn: 'root' })
export class RegionService {
  constructor(private http: HttpClient) {}

  getList(): Observable<Region[]> {
    return this.http.get<Region[]>(API);
  }

  getById(id: string): Observable<Region> {
    return this.http.get<Region>(`${API}/${id}`);
  }

  create(payload: RegionCreatePayload): Observable<Region> {
    return this.http.post<Region>(API, payload);
  }

  update(id: string, payload: Partial<RegionCreatePayload>): Observable<Region> {
    return this.http.put<Region>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
