import { Component, OnInit } from '@angular/core';
import { AddCategoryModalComponent } from './add-category-modal/add-category-modal.component';
import type { Category, CategoryCreatePayload } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [AddCategoryModalComponent],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
  isAddModalOpen = false;
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  saveError: string | null = null;
  /** When set, modal is in edit mode for this category. */
  editCategory: Category | null = null;

  constructor(public categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.categoryService.loadCategories().subscribe({
      next: (list) => {
        this.categories = list;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || err.message || 'Failed to load categories';
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.saveError = null;
    this.editCategory = null;
    this.isAddModalOpen = true;
  }

  openEditModal(cat: Category): void {
    this.saveError = null;
    this.editCategory = cat;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.editCategory = null;
  }

  onCategorySaved(payload: CategoryCreatePayload & { id?: string }): void {
    this.saveError = null;
    if (payload.id) {
      const { id, ...data } = payload;
      this.categoryService.update(id, data).subscribe({
        next: () => {
          this.loadCategories();
          this.closeAddModal();
        },
        error: (err) => {
          this.saveError = err.error?.error || err.message || 'Failed to update category';
        },
      });
    } else {
      this.categoryService.create(payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeAddModal();
        },
        error: (err) => {
          this.saveError = err.error?.error || err.message || 'Failed to create category';
        },
      });
    }
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Delete category "${cat.name}"?${this.getChildren(cat.id).length > 0 ? ' It has subcategories and cannot be deleted.' : ''}`)) {
      return;
    }
    this.saveError = null;
    this.categoryService.delete(cat.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        this.saveError = err.error?.error || err.message || 'Failed to delete category';
      },
    });
  }

  getRootCategories(): Category[] {
    return this.categories.filter((c) => !c.parentId);
  }

  getChildren(parentId: string): Category[] {
    return this.categories.filter((c) => c.parentId === parentId);
  }

  /** Flat list for table: categories in tree order (parent then its children to any depth). */
  getCategoryTableRows(): { category: Category; depth: number }[] {
    const rows: { category: Category; depth: number }[] = [];
    const append = (parentId: string | null, depth: number): void => {
      const list = parentId === null ? this.getRootCategories() : this.getChildren(parentId);
      for (const cat of list) {
        rows.push({ category: cat, depth });
        append(cat.id, depth + 1);
      }
    };
    append(null, 0);
    return rows;
  }
}
