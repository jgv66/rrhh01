import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes =
[
  { path: '',  redirectTo: 'home', pathMatch: 'full'  },
  { path: 'home',           loadChildren: () => import('./pages/home/home.module')                .then(m => m.HomePageModule          ) },
  { path: 'login',          loadChildren: () => import('./pages/login/login.module')              .then(m => m.LoginPageModule         ) },
  { path: 'logout',         loadChildren: () => import('./pages/logout/logout.module')            .then(m => m.LogoutPageModule        ) },
  { path: 'mificha',        loadChildren: () => import('./pages/mificha/mificha.module')          .then(m => m.MifichaPageModule       ) },
  { path: 'misliqui',       loadChildren: () => import('./pages/misliq/misliq.module')            .then(m => m.MisliqPageModule        ) },
  { path: 'anticipo',       loadChildren: () => import('./pages/anticipo/anticipo.module')        .then(m => m.AnticipoPageModule      ) },
  { path: 'certificados',   loadChildren: () => import('./pages/certificados/certificados.module').then(m => m.CertificadosPageModule  ) },
  { path: 'misvacaciones',  loadChildren: () => import('./pages/vacaciones/vacaciones.module')    .then(m => m.VacacionesPageModule    ) },
  { path: 'mislicencias',   loadChildren: () => import('./pages/licencias/licencias.module')      .then(m => m.LicenciasPageModule     ) },
  { path: 'miscom',         loadChildren: () => import('./pages/miscom/miscom.module')            .then(m => m.MiscomPageModule        ) },
  { path: 'mecambie/:caso', loadChildren: () => import('./pages/mecambie/mecambie.module')        .then(m => m.MecambiePageModule      ) },
  { path: '**',             redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
