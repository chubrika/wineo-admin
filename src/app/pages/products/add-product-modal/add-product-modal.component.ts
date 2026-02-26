import { Component, EventEmitter, input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { FilterService } from '../../../core/services/filter.service';
import { RegionService } from '../../../core/services/region.service';
import { CityService } from '../../../core/services/city.service';
import type { Category } from '../../../core/models/category.model';
import type { Filter } from '../../../core/models/filter.model';
import type { Region } from '../../../core/models/region.model';
import type { City } from '../../../core/models/city.model';
import type { ListingCreatePayload, ListingType, RentPeriod } from '../../../core/models/listing.model';
import type { Listing } from '../../../core/models/listing.model';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-product-modal.component.html',
})
export class AddProductModalComponent implements OnChanges {
  isOpen = input<boolean>(false);
  saving = input<boolean>(false);
  /** When set, modal is in edit mode and form is patched from this listing. */
  editListing = input<Listing | null>(null);
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ListingCreatePayload>();

  form: FormGroup;
  attributeForm: FormGroup;
  categoryOptions: Category[] = [];
  categoryFilters: Filter[] = [];
  loadingFilters = false;
  regionOptions: Region[] = [];
  cityOptions: City[] = [];
  loadingCities = false;

  readonly listingTypes: { value: ListingType; label: string }[] = [
    { value: 'sell', label: 'იყიდება' },
    { value: 'rent', label: 'ქირავდება' },
  ];
  readonly rentPeriods: { value: RentPeriod; label: string }[] = [
    { value: 'hour', label: 'საათი' },
    { value: 'day', label: 'დღე' },
    { value: 'week', label: 'კვირა' },
    { value: 'month', label: 'თვე' },
  ];
  readonly currencies = [
    { value: 'GEL', label: '₾' },
    { value: 'USD', label: '$' },
  ];
  readonly priceTypes = [
    { value: 'fixed', label: 'ფიქსირებული' },
    { value: 'negotiable', label: 'შეთანხმებით' },
  ];
  readonly conditions = [
    { value: 'new', label: 'ახალი' },
    { value: 'used', label: 'მეორადი' },
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private filterService: FilterService,
    private regionService: RegionService,
    private cityService: CityService,
  ) {
    this.attributeForm = this.fb.group({});
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      slug: ['', [Validators.maxLength(200)]],
      description: ['', [Validators.required]],
      type: ['sell' as ListingType, [Validators.required]],

      categoryId: [null as string | null, [Validators.required]],

      price: [null as number | null, [Validators.required, Validators.min(0)]],
      currency: ['GEL', [Validators.required]],
      priceType: ['fixed', [Validators.required]],
      rentPeriod: [null as RentPeriod | null],

      location: this.fb.group({
        regionId: ['', [Validators.required]],
        cityId: ['', [Validators.required]],
      }),

      specifications: this.fb.group({
        condition: [null as 'new' | 'used' | null],
      }),

      images: [''],
      thumbnail: [''],
    });

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

    this.form.get('priceType')?.valueChanges.subscribe((priceType: string) => {
      const priceControl = this.form.get('price');
      const currencyControl = this.form.get('currency');
      if (priceType === 'negotiable') {
        priceControl?.disable();
        currencyControl?.disable();
      } else {
        priceControl?.enable();
        currencyControl?.enable();
      }
    });
    // Initial state: if somehow priceType starts as negotiable, disable
    if (this.form.get('priceType')?.value === 'negotiable') {
      this.form.get('price')?.disable();
      this.form.get('currency')?.disable();
    }

    this.form.get('categoryId')?.valueChanges.subscribe((categoryId: string | null) => {
      this.categoryFilters = [];
      this.attributeForm = this.fb.group({});
      if (categoryId) {
        this.loadingFilters = true;
        this.filterService.getByCategory(categoryId).subscribe({
          next: (filters) => {
            this.categoryFilters = filters;
            filters.forEach((f) => this.attributeForm.addControl(f.id, this.fb.control(null)));
            this.loadingFilters = false;
          },
          error: () => {
            this.loadingFilters = false;
          },
        });
      }
    });

    this.form.get('location.regionId')?.valueChanges.subscribe((regionId: string) => {
      this.cityOptions = [];
      if (regionId) {
        this.loadingCities = true;
        this.cityService.getList(regionId).subscribe({
          next: (cities) => {
            this.cityOptions = cities;
            const currentCityId = this.form.get('location.cityId')?.value;
            const cityStillValid = currentCityId && cities.some((c) => c.id === currentCityId);
            if (!cityStillValid) {
              this.form.get('location.cityId')?.setValue('', { emitEvent: false });
            }
            this.loadingCities = false;
          },
          error: () => {
            this.loadingCities = false;
          },
        });
      } else {
        this.form.get('location.cityId')?.setValue('', { emitEvent: false });
      }
    });
  }

  ngOnChanges(): void {
    if (!this.isOpen()) return;

    this.categoryService.loadCategories().subscribe({
      next: () => {
        this.categoryOptions = this.categoryService.getOptionsForParent();
        this.regionService.getList().subscribe({
          next: (regions) => {
            this.regionOptions = regions;
            if (this.editListing()) {
              this.patchFormFromListingWithRegions(this.editListing()!, regions);
            } else {
              this.cityOptions = [];
              this.resetForm();
            }
          },
        });
      },
    });
  }

  /** Patch form when editing; resolves location.region/city strings to regionId/cityId using regions and cities. */
  private patchFormFromListingWithRegions(listing: Listing, regions: Region[]): void {
    const regionByLabel = regions.find((r) => r.label === listing.location?.region);
    const regionId = regionByLabel?.id ?? '';

    if (regionId) {
      this.loadingCities = true;
      this.cityService.getList(regionId).subscribe({
        next: (cities) => {
          this.cityOptions = cities;
          const cityByLabel = cities.find((c) => c.label === listing.location?.city);
          const cityId = cityByLabel?.id ?? '';
          this.patchFormFromListing(listing, regionId, cityId);
          this.loadingCities = false;
        },
        error: () => {
          this.patchFormFromListing(listing, regionId, '');
          this.loadingCities = false;
        },
      });
    } else {
      this.cityOptions = [];
      this.patchFormFromListing(listing, '', '');
    }
  }

  private patchFormFromListing(listing: Listing, locationRegionId: string, locationCityId: string): void {
    const categoryId = listing.categoryId || this.categoryOptions.find((c) => c.slug === listing.category?.slug)?.id || null;
    const imagesStr = Array.isArray(listing.images) ? listing.images.join('\n') : '';

    this.form.patchValue({
      title: listing.title,
      slug: listing.slug || '',
      description: listing.description || '',
      type: listing.type,
      categoryId,
      price: listing.price ?? null,
      currency: listing.currency || 'GEL',
      priceType: listing.priceType || 'fixed',
      rentPeriod: listing.rentPeriod ?? null,
      location: {
        regionId: locationRegionId,
        cityId: locationCityId,
      },
      specifications: {
        condition: listing.specifications?.condition ?? null,
      },
      images: imagesStr,
      thumbnail: listing.thumbnail || '',
    });

    if (listing.priceType === 'negotiable') {
      this.form.get('price')?.disable();
      this.form.get('currency')?.disable();
    }

    if (categoryId) {
      this.loadingFilters = true;
      this.filterService.getByCategory(categoryId).subscribe({
        next: (filters) => {
          this.categoryFilters = filters;
          this.attributeForm = this.fb.group({});
          filters.forEach((f) => {
            const attr = this.editListing()?.attributes?.find((a) => a.filterId === f.id);
            const value = attr?.value ?? null;
            this.attributeForm.addControl(f.id, this.fb.control(value));
          });
          this.loadingFilters = false;
        },
        error: () => {
          this.loadingFilters = false;
        },
      });
    } else {
      this.categoryFilters = [];
      this.attributeForm = this.fb.group({});
    }
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

  /** Build payload matching ListingCreatePayload; category from selected category; slug optional. */
  getPayload(): ListingCreatePayload {
    const raw = this.form.getRawValue();
    const imagesStr = raw.images || '';
    const images = imagesStr
      .split(/\n/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const selectedCategory = raw.categoryId
      ? this.categoryOptions.find((c) => c.id === raw.categoryId)
      : null;
    const category = selectedCategory
      ? { name: selectedCategory.name, slug: selectedCategory.slug }
      : { name: '', slug: '' };

    const attributes = this.categoryFilters
      .map((f) => {
        const v = this.attributeForm.get(f.id)?.value;
        if (v === undefined || v === null) return null;
        if (typeof v === 'string' && v.trim() === '') return null;
        return { filterId: f.id, value: v as string | number | boolean | string[] };
      })
      .filter((a): a is { filterId: string; value: string | number | boolean | string[] } => a != null);

    const specs = raw.specifications || {};
    const specifications: Record<string, string | number | undefined> = {};
    if (specs['condition'] != null && specs['condition'] !== '') specifications['condition'] = specs['condition'] as string;

    const regionId = raw.location?.regionId;
    const cityId = raw.location?.cityId;
    const selectedRegion = regionId ? this.regionOptions.find((r) => r.id === regionId) : null;
    const selectedCity = cityId ? this.cityOptions.find((c) => c.id === cityId) : null;

    const payload: ListingCreatePayload = {
      title: raw.title.trim(),
      ...(raw.slug?.trim() ? { slug: raw.slug.trim().toLowerCase().replace(/\s+/g, '-') } : {}),
      description: raw.description.trim(),
      type: raw.type,

      category,
      ...(raw.categoryId ? { categoryId: raw.categoryId } : {}),
      ...(attributes.length > 0 ? { attributes } : {}),

      price: Number(this.form.get('price')?.value ?? raw.price ?? 0),
      currency: (this.form.get('currency')?.value ?? raw.currency) || 'GEL',
      priceType: raw.priceType,
      ...(raw.type === 'rent' && raw.rentPeriod ? { rentPeriod: raw.rentPeriod } : {}),

      location: {
        region: selectedRegion?.label?.trim() ?? '',
        city: selectedCity?.label?.trim() ?? '',
      },

      ...(images.length > 0 ? { images } : {}),
      ...(raw.thumbnail?.trim() ? { thumbnail: raw.thumbnail.trim() } : {}),

      ...(Object.keys(specifications).length > 0 ? { specifications } : {}),

      ...(raw.seoTitle?.trim() ? { seoTitle: raw.seoTitle.trim() } : {}),
      ...(raw.seoDescription?.trim() ? { seoDescription: raw.seoDescription.trim() } : {}),
    };
    return payload;
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
    this.categoryFilters = [];
    this.attributeForm = this.fb.group({});
    this.form.reset({
      title: '',
      slug: '',
      description: '',
      type: 'sell',
      categoryId: null,
      price: null,
      currency: 'GEL',
      priceType: 'fixed',
      rentPeriod: null,
      location: { regionId: '', cityId: '' },
      specifications: { condition: null },
      images: '',
      thumbnail: '',
    });
  }
}
