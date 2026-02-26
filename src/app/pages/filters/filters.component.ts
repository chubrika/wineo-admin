import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddFilterModalComponent } from './add-filter-modal/add-filter-modal.component';
import type { Filter, FilterCreatePayload } from '../../core/models/filter.model';
import type { Category } from '../../core/models/category.model';
import { FilterService } from '../../core/services/filter.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [AddFilterModalComponent, FormsModule],
  templateUrl: './filters.component.html',
})
export class FiltersComponent implements OnInit {
  isAddModalOpen = false;
  filters: Filter[] = [];
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  saveError: string | null = null;
  editFilter: Filter | null = null;
  filterByCategoryId: string | null = null;

  constructor(
    public filterService: FilterService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe({
      next: () => this.loadFilters(),
    });
  }

  loadFilters(): void {
    this.loading = true;
    this.error = null;
    this.filterService.loadFilters({ all: true }).subscribe({
      next: (list) => {
        this.filters = list;
        this.categories = this.categoryService.getAll();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || err.message || 'Failed to load filters';
        this.loading = false;
      },
    });
  }

  get filteredFilters(): Filter[] {
    if (!this.filterByCategoryId) return this.filters;
    return this.filters.filter((f) => f.categoryId === this.filterByCategoryId);
  }

  getCategoryName(categoryId: string): string {
    const cat = this.categories.find((c) => c.id === categoryId);
    return cat ? cat.name : categoryId;
  }

  openAddModal(): void {
    this.saveError = null;
    this.editFilter = null;
    this.isAddModalOpen = true;
  }

  openEditModal(filter: Filter): void {
    this.saveError = null;
    this.editFilter = filter;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.editFilter = null;
  }

  onFilterSaved(payload: FilterCreatePayload & { id?: string }): void {
    this.saveError = null;
    if (payload.id) {
      const { id, ...data } = payload;
      this.filterService.update(id, data).subscribe({
        next: () => {
          this.loadFilters();
          this.closeAddModal();
        },
        error: (err) => {
          this.saveError = err.error?.error || err.message || 'Failed to update filter';
        },
      });
    } else {
      this.filterService.create(payload).subscribe({
        next: () => {
          this.loadFilters();
          this.closeAddModal();
        },
        error: (err) => {
          this.saveError = err.error?.error || err.message || 'Failed to create filter';
        },
      });
    }
  }

  deleteFilter(filter: Filter): void {
    if (!confirm(`Delete filter "${filter.name}"?`)) return;
    this.saveError = null;
    this.filterService.delete(filter.id).subscribe({
      next: () => this.loadFilters(),
      error: (err) => {
        this.saveError = err.error?.error || err.message || 'Failed to delete filter';
      },
    });
  }
}
