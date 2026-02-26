import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ListingCreatePayload, ListingType, RentPeriod } from '../../../core/models/listing.model';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-product-modal.component.html',
})
export class AddProductModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ListingCreatePayload>();

  form: FormGroup;

  readonly listingTypes: { value: ListingType; label: string }[] = [
    { value: 'sell', label: 'Sell' },
    { value: 'rent', label: 'Rent' },
  ];
  readonly rentPeriods: { value: RentPeriod; label: string }[] = [
    { value: 'hour', label: 'Per hour' },
    { value: 'day', label: 'Per day' },
    { value: 'week', label: 'Per week' },
    { value: 'month', label: 'Per month' },
  ];
  readonly currencies = [
    { value: 'GEL', label: 'GEL' },
    { value: 'USD', label: 'USD' },
  ];
  readonly priceTypes = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'negotiable', label: 'Negotiable' },
  ];
  readonly conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      slug: ['', [Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      type: ['sell' as ListingType, [Validators.required]],

      category: this.fb.group({
        name: ['', [Validators.required]],
        slug: ['', [Validators.required]],
      }),

      price: [null as number | null, [Validators.required, Validators.min(0)]],
      currency: ['GEL', [Validators.required]],
      priceType: ['fixed', [Validators.required]],
      rentPeriod: [null as RentPeriod | null],

      location: this.fb.group({
        region: ['', [Validators.required]],
        city: ['', [Validators.required]],
      }),

      specifications: this.fb.group({
        condition: [null as 'new' | 'used' | null],
        brand: [''],
        model: [''],
        year: [null as number | null],
        capacity: [''],
        power: [''],
      }),

      images: [''], // stored as string, converted to array (one URL per line)
      thumbnail: [''],

      seoTitle: ['', [Validators.maxLength(70)]],
      seoDescription: ['', [Validators.maxLength(160)]],
    });

    // Require rentPeriod when type is 'rent'
    this.form.get('type')?.valueChanges.subscribe((type: ListingType) => {
      const rentPeriodControl = this.form.get('rentPeriod');
      if (type === 'rent') {
        rentPeriodControl?.setValidators([Validators.required]);
      } else {
        rentPeriodControl?.setValidators(null);
        rentPeriodControl?.setValue(null);
      }
      rentPeriodControl?.updateValueAndValidity();
    });
  }

  get type(): ListingType {
    return this.form.get('type')?.value ?? 'sell';
  }

  get isRent(): boolean {
    return this.type === 'rent';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('data-modal-backdrop')) {
      this.emitClose();
    }
  }

  emitClose(): void {
    this.close.emit();
  }

  /** Build payload matching ListingCreatePayload; slug optional (backend can derive from title). */
  getPayload(): ListingCreatePayload {
    const raw = this.form.getRawValue();
    const imagesStr = raw.images || '';
    const images = imagesStr
      .split(/\n/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const specs = raw.specifications || {};
    const specifications: Record<string, string | number | undefined> = {};
    if (specs['condition'] != null && specs['condition'] !== '') specifications['condition'] = specs['condition'] as string;
    if ((specs['brand'] as string)?.trim()) specifications['brand'] = (specs['brand'] as string).trim();
    if ((specs['model'] as string)?.trim()) specifications['model'] = (specs['model'] as string).trim();
    if (specs['year'] != null && specs['year'] !== '' && !Number.isNaN(Number(specs['year'])))
      specifications['year'] = Number(specs['year']);
    if ((specs['capacity'] as string)?.trim()) specifications['capacity'] = (specs['capacity'] as string).trim();
    if ((specs['power'] as string)?.trim()) specifications['power'] = (specs['power'] as string).trim();

    return {
      title: raw.title.trim(),
      ...(raw.slug?.trim() ? { slug: raw.slug.trim().toLowerCase().replace(/\s+/g, '-') } : {}),
      description: raw.description.trim(),
      type: raw.type,

      category: {
        name: raw.category.name.trim(),
        slug: raw.category.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      },

      price: Number(raw.price),
      currency: raw.currency,
      priceType: raw.priceType,
      ...(raw.type === 'rent' && raw.rentPeriod ? { rentPeriod: raw.rentPeriod } : {}),

      location: {
        region: raw.location.region.trim(),
        city: raw.location.city.trim(),
      },

      ...(images.length > 0 ? { images } : {}),
      ...(raw.thumbnail?.trim() ? { thumbnail: raw.thumbnail.trim() } : {}),

      ...(Object.keys(specifications).length > 0 ? { specifications } : {}),

      ...(raw.seoTitle?.trim() ? { seoTitle: raw.seoTitle.trim() } : {}),
      ...(raw.seoDescription?.trim() ? { seoDescription: raw.seoDescription.trim() } : {}),
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.getPayload());
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      slug: '',
      description: '',
      type: 'sell',
      category: { name: '', slug: '' },
      price: null,
      currency: 'GEL',
      priceType: 'fixed',
      rentPeriod: null,
      location: { region: '', city: '' },
      specifications: { condition: null, brand: '', model: '', year: null, capacity: '', power: '' },
      images: '',
      thumbnail: '',
      seoTitle: '',
      seoDescription: '',
    });
  }
}
