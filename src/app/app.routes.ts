import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash-screen/splash-screen.page').then(
        (m) => m.SplashScreenPage
      ),
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro/:object',
    loadComponent: () =>
      import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home/:usuarioAnonimo',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'listados/:object',
    loadComponent: () =>
      import('./pages/listados/listados.page').then((m) => m.ListadosPage),
  },
  {
    //object va a ser el tipo de usuario que accceda a la consulta
    path: 'consulta/:object/:id',
    loadComponent: () =>
      import('./pages/consulta/consulta.page').then((m) => m.ConsultaPage),
  },
];
