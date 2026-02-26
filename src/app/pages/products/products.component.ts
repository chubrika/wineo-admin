import { Component } from '@angular/core';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';
import type { ListingCreatePayload } from '../../core/models/listing.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [AddProductModalComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  isAddModalOpen = false;

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  onListingSaved(payload: ListingCreatePayload): void {
    // TODO: call listings API to create listing
    console.log('Listing payload:', payload);
    this.closeAddModal();
  }
}
