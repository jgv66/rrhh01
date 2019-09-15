import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LoginPage } from './login.page';
import { SignupPage } from '../signup/signup.page';
import { SignupPageModule } from '../signup/signup.module';

const routes: Routes = [
  { path: '',
    component: LoginPage,
  },
];

@NgModule({
  entryComponents:[ SignupPage ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
