import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import type { Category } from '../../../core/models/category.model';
import type { Filter, FilterCreatePayload, FilterType } from '../../../core/models/filter.model';

const FILTER_TYPES: FilterType[] = ['select', 'range', 'checkbox', 'number', 'text'];

@Component({
  selector: 'app-add-filter-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-filter-modal.component.html',
})
export class AddFilterModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() editFilter: Filter | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<FilterCreatePayload & { id?: string }>();

  form: FormGroup;
  categoryOptions: Category[] = [];
  readonly filterTypes = FILTER_TYPES;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.maxLength(100)]],
      type: ['select' as FilterType, [Validators.required]],
      optionsStr: [''], // one option per line; used when type === 'select'
      unit: ['', [Validators.maxLength(20)]],
      categoryId: [null as string | null, [Validators.required]],
      applyToChildren: [false],
      isRequired: [false],
      sortOrder: [0, [Validators.min(0)]],
      isActive: [true],
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.categoryOptions = this.categoryService.getOptionsForParent();
      if (this.editFilter) {
        this.form.patchValue({
          name: this.editFilter.name,
          slug: this.editFilter.slug,
          type: this.editFilter.type,
          optionsStr: (this.editFilter.options || []).join('\n'),
          unit: this.editFilter.unit || '',
          categoryId: this.editFilter.categoryId,
          applyToChildren: this.editFilter.applyToChildren,
          isRequired: this.editFilter.isRequired,
          sortOrder: this.editFilter.sortOrder,
          isActive: this.editFilter.isActive,
        });
      } else {
        this.form.patchValue({
          name: '',
          slug: '',
          type: 'select',
          optionsStr: '',
          unit: '',
          categoryId: null,
          applyToChildren: false,
          isRequired: false,
          sortOrder: 0,
          isActive: true,
        });
      }
    }
  }

  get isSelectType(): boolean {
    return this.form.get('type')?.value === 'select';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('data-modal-backdrop')) {
      this.close.emit();
    }
  }

  getPayload(): FilterCreatePayload & { id?: string } {
    const raw = this.form.getRawValue();
    const slugFromName = raw.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const slug =
      raw.slug && typeof raw.slug === 'string' && raw.slug.trim()
        ? raw.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : slugFromName;
    const options =
      raw.type === 'select' && raw.optionsStr
        ? (raw.optionsStr as string)
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const payload: FilterCreatePayload = {
      name: raw.name.trim(),
      slug: slug || undefined,
      type: raw.type,
      options,
      unit: (raw.unit || '').trim() || undefined,
      categoryId: raw.categoryId,
      applyToChildren: !!raw.applyToChildren,
      isRequired: !!raw.isRequired,
      sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
      isActive: !!raw.isActive,
    };
    if (this.editFilter) {
      return { ...payload, id: this.editFilter.id };
    }
    return payload;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.getPayload());
    this.form.reset({
      name: '',
      slug: '',
      type: 'select',
      optionsStr: '',
      unit: '',
      categoryId: null,
      applyToChildren: false,
      isRequired: false,
      sortOrder: 0,
      isActive: true,
    });
  }
}
