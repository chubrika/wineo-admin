import { Component, OnInit } from '@angular/core';
import { AddRegionModalComponent } from './add-region-modal/add-region-modal.component';
import type { Region, RegionCreatePayload } from '../../core/models/region.model';
import { RegionService } from '../../core/services/region.service';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [AddRegionModalComponent],
  templateUrl: './regions.component.html',
})
export class RegionsComponent implements OnInit {
  regions: Region[] = [];
  loading = false;
  isAddModalOpen = false;
  editRegion: Region | null = null;
  error: string | null = null;
  saving = false;
  deletingId: string | null = null;

  constructor(private regionService: RegionService) {}

  ngOnInit(): void {
    this.loadRegions();
  }

  loadRegions(): void {
    this.loading = true;
    this.error = null;
    this.regionService.getList().subscribe({
      next: (list) => {
        this.regions = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.message || 'რეგიონების ჩატვირთვა ვერ მოხერხდა';
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.error = null;
    this.editRegion = null;
    this.isAddModalOpen = true;
  }

  openEditModal(region: Region): void {
    this.error = null;
    this.editRegion = region;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.editRegion = null;
    this.error = null;
  }

  onRegionSaved(payload: RegionCreatePayload & { id?: string }): void {
    this.error = null;
    this.saving = true;
    const id = payload.id ?? this.editRegion?.id;

    if (id) {
      const { id: _id, ...data } = payload;
      this.regionService.update(id, data).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadRegions();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'რეგიონის განახლება ვერ მოხერხდა';
        },
      });
    } else {
      this.regionService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadRegions();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'რეგიონის დამატება ვერ მოხერხდა';
        },
      });
    }
  }

  deleteRegion(region: Region): void {
    if (!confirm(`წავშალოთ რეგიონი „${region.label}"?`)) return;
    this.deletingId = region.id;
    this.error = null;
    this.regionService.delete(region.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadRegions();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.error || err?.message || 'რეგიონის წაშლა ვერ მოხერხდა';
      },
    });
  }
}
