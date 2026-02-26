import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { FiltersComponent } from './pages/filters/filters.component';
import { RegionsComponent } from './pages/regions/regions.component';
import { CitiesComponent } from './pages/cities/cities.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canMatch: [loginGuard],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canMatch: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'filters', component: FiltersComponent },
      { path: 'regions', component: RegionsComponent },
      { path: 'cities', component: CitiesComponent },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
