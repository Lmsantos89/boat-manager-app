import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BoatListComponent } from './components/boat-list/boat-list.component';
import { authGuard } from './guards/auth.guard';
import { SignupComponent } from './components/signup/signup.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'boats', component: BoatListComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
