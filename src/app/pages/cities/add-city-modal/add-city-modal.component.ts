import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegionService } from '../../../core/services/region.service';
import type { City, CityCreatePayload } from '../../../core/models/city.model';
import type { Region } from '../../../core/models/region.model';

@Component({
  selector: 'app-add-city-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-city-modal.component.html',
})
export class AddCityModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editCity: City | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CityCreatePayload & { id?: string }>();

  form: FormGroup;
  regions: Region[] = [];

  constructor(
    private fb: FormBuilder,
    private regionService: RegionService,
  ) {
    this.form = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.maxLength(100)]],
      regionId: ['', [Validators.required]],
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.regionService.getList().subscribe({
        next: (list) => {
          this.regions = list;
          if (this.editCity) {
            this.form.patchValue({
              label: this.editCity.label,
              slug: this.editCity.slug,
              regionId: this.editCity.regionId,
            });
          } else {
            const defaultRegionId = list.length > 0 ? list[0].id : '';
            this.form.patchValue({
              label: '',
              slug: '',
              regionId: defaultRegionId,
            });
          }
        },
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('data-modal-backdrop')) {
      this.emitClose();
    }
  }

  emitClose(): void {
    this.close.emit();
  }

  getPayload(): CityCreatePayload {
    const raw = this.form.getRawValue();
    const slugFromLabel = raw.label
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') ?? '';
    const slug =
      raw.slug && typeof raw.slug === 'string' && raw.slug.trim()
        ? raw.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : slugFromLabel;
    return {
      label: raw.label.trim(),
      slug: slug || undefined,
      regionId: raw.regionId,
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.getPayload();
    if (this.editCity) {
      this.saved.emit({ ...payload, id: this.editCity.id });
    } else {
      this.saved.emit(payload);
    }
    this.form.reset({ label: '', slug: '', regionId: '' });
  }
}
