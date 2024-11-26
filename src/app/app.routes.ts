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
  {
    path: 'alta-producto',
    loadComponent: () =>
      import('./componentes/alta-producto/alta-producto.component').then(
        (m) => m.AltaProductoComponent
      ),
  },
  {
    path: 'carta/:id',
    loadComponent: () =>
      import('./componentes/carta/carta.component').then(
        (m) => m.CartaComponent
      ),
  },
  {
    path: 'mozo-home',
    loadComponent: () =>
      import('./componentes/mozo-home/mozo-home.component').then(
        (m) => m.MozoHomeComponent
      ),
  },
  {
    path: 'estado-pedidos/:id',
    loadComponent: () =>
      import('./componentes/estado-pedidos/estado-pedidos.component').then(
        (m) => m.EstadoPedidosComponent
      ),
  },
  {
    path: 'menu-juegos',
    loadComponent: () =>
      import('./componentes/menu-juegos/menu-juegos.component').then(
        (m) => m.MenuJuegosComponent
      ),
  },
  {
    path: 'shuffle-cups',
    loadComponent: () =>
      import('./componentes/shuffle-cups/shuffle-cups.component').then(
        (m) => m.ShuffleCupsComponent
      ),
  },
  {
    path: 'shuffle-cups',
    loadComponent: () =>
      import('./componentes/shuffle-cups/shuffle-cups.component').then(
        (m) => m.ShuffleCupsComponent
      ),
  },
  {
    path: 'modal-pagar-pedido',
    loadComponent: () =>
      import('./componentes/modal-pagar-pedido/modal-pagar-pedido.component').then(
        (m) => m.ModalPagarPedidoComponent
      ),
  },
  {
    path: 'modal-propina',
    loadComponent: () =>
      import('./componentes/modal-propina/modal-propina.component').then(
        (m) => m.ModalPropinaComponent
      ),
  },
];
