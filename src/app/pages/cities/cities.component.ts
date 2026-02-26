import { Component, OnInit } from '@angular/core';
import { AddCityModalComponent } from './add-city-modal/add-city-modal.component';
import type { City, CityCreatePayload } from '../../core/models/city.model';
import { CityService } from '../../core/services/city.service';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [AddCityModalComponent],
  templateUrl: './cities.component.html',
})
export class CitiesComponent implements OnInit {
  cities: City[] = [];
  loading = false;
  isAddModalOpen = false;
  editCity: City | null = null;
  error: string | null = null;
  saving = false;
  deletingId: string | null = null;

  constructor(private cityService: CityService) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.loading = true;
    this.error = null;
    this.cityService.getList().subscribe({
      next: (list) => {
        this.cities = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'ქალაქების ჩატვირთვა ვერ მოხერხდა';
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.error = null;
    this.editCity = null;
    this.isAddModalOpen = true;
  }

  openEditModal(city: City): void {
    this.error = null;
    this.editCity = city;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.editCity = null;
    this.error = null;
  }

  onCitySaved(payload: CityCreatePayload & { id?: string }): void {
    this.error = null;
    this.saving = true;
    const id = payload.id ?? this.editCity?.id;

    if (id) {
      const { id: _id, ...data } = payload;
      this.cityService.update(id, data).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadCities();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'ქალაქის განახლება ვერ მოხერხდა';
        },
      });
    } else {
      this.cityService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadCities();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'ქალაქის დამატება ვერ მოხერხდა';
        },
      });
    }
  }

  deleteCity(city: City): void {
    if (!confirm(`წავშალოთ ქალაქი „${city.label}"?`)) return;
    this.deletingId = city.id;
    this.error = null;
    this.cityService.delete(city.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadCities();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.error || err?.message || 'ქალაქის წაშლა ვერ მოხერხდა';
      },
    });
  }
}
