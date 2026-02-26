import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import type { Category, CategoryCreatePayload } from '../../../core/models/category.model';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './add-category-modal.component.html',
})
export class AddCategoryModalComponent implements OnChanges {
  @Input() isOpen = false;
  /** When set, form is in edit mode and pre-filled with this category. */
  @Input() editCategory: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<CategoryCreatePayload & { id?: string }>();

  form: FormGroup;
  parentOptions: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      active: [true, [Validators.required]],
      parentId: [null as string | null],
    });
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.parentOptions = this.categoryService.getOptionsForParent(this.editCategory?.id);
      if (this.editCategory) {
        this.form.patchValue({
          name: this.editCategory.name,
          slug: this.editCategory.slug,
          description: this.editCategory.description || '',
          active: this.editCategory.active,
          parentId: this.editCategory.parentId || null,
        });
      } else {
        this.form.patchValue({
          name: '',
          slug: '',
          description: '',
          active: true,
          parentId: null,
        });
      }
    }
  }

  get isChild(): boolean {
    return !!this.form.get('parentId')?.value;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).hasAttribute('data-modal-backdrop')) {
      this.emitClose();
    }
  }

  emitClose(): void {
    this.close.emit();
  }

  getPayload(): CategoryCreatePayload {
    const raw = this.form.getRawValue();
    const slugFromName = raw.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const slug = (raw.slug && typeof raw.slug === 'string' && raw.slug.trim())
      ? raw.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : slugFromName;
    return {
      name: raw.name.trim(),
      slug: slug || undefined,
      description: (raw.description || '').trim(),
      active: !!raw.active,
      parentId: raw.parentId || null,
    };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.getPayload();
    if (this.editCategory) {
      this.saved.emit({ ...payload, id: this.editCategory.id });
    } else {
      this.saved.emit(payload);
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      active: true,
      parentId: null,
    });
  }
}
