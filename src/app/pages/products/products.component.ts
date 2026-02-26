import { Component, OnInit } from '@angular/core';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';
import { ListingService } from '../../core/services/listing.service';
import type { Listing, ListingCreatePayload } from '../../core/models/listing.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [AddProductModalComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  products: Listing[] = [];
  loading = false;
  isAddModalOpen = false;
  editListing: Listing | null = null;
  error: string | null = null;
  saving = false;
  deletingId: string | null = null;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.listingService.getList({ limit: 100 }).subscribe({
      next: (list) => {
        this.products = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.error = null;
    this.editListing = null;
    this.isAddModalOpen = true;
  }

  openEditModal(listing: Listing): void {
    this.error = null;
    this.editListing = listing;
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.editListing = null;
    this.error = null;
  }

  onListingSaved(payload: ListingCreatePayload): void {
    this.error = null;
    this.saving = true;
    const id = this.editListing ? this.editListing._id || this.editListing.id : null;

    if (id) {
      this.listingService.update(id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'Failed to update listing';
        },
      });
    } else {
      this.listingService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeAddModal();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.error = err?.error?.error || err?.message || 'Failed to create listing';
        },
      });
    }
  }

  deleteProduct(listing: Listing): void {
    if (!confirm(`Delete "${listing.title}"?`)) return;
    const id = listing._id || listing.id;
    if (!id) return;
    this.deletingId = id;
    this.listingService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.loadProducts();
      },
      error: (err) => {
        this.deletingId = null;
        this.error = err?.error?.error || err?.message || 'Failed to delete listing';
      },
    });
  }
}
