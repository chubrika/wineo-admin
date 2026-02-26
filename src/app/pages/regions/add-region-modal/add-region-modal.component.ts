import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Region, RegionCreatePayload } from '../../../core/models/region.model';

@Component({
  selector: 'app-add-region-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-region-modal.component.html',
})
export class AddRegionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editRegion: Region | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<RegionCreatePayload & { id?: string }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.maxLength(100)]],
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      if (this.editRegion) {
        this.form.patchValue({
          label: this.editRegion.label,
          slug: this.editRegion.slug,
        });
      } else {
        this.form.patchValue({
          label: '',
          slug: '',
        });
      }
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

  getPayload(): RegionCreatePayload {
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
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.getPayload();
    if (this.editRegion) {
      this.saved.emit({ ...payload, id: this.editRegion.id });
    } else {
      this.saved.emit(payload);
    }
    this.form.reset({ label: '', slug: '' });
  }
}
