import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { InicioPage } from '../pages/inicio/inicio';
import { HomePage } from '../pages/home/homepage/home';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';
import { PerfilPage } from '../pages/perfil/perfil';

import { AdicionarEventosPage } from '../pages/adicionareventos/adicionareventos';
import { ResetpasswordPage } from '../pages/resetpassword/resetpassword';

import { AuthService } from '../providers/auth/auth-service';
import { Geolocation } from '@ionic-native/geolocation';
import { EventosService } from '../providers/eventos-service/eventos-service';
import { DetalhaPage } from '../pages/detalhaevento/detalhaevento';
import { BuscareventosPage } from '../pages/buscareventos/buscareventos';
import { EditaperfilPage } from '../pages/editaperfil/editaperfil';

// Cada página é declarada só no próprio módulo (exigência do build de produção/AoT).
import { InicioPageModule } from '../pages/inicio/inicio.module';
import { HomePageModule } from '../pages/home/homepage/home.module';
import { SigninPageModule } from '../pages/signin/signin.module';
import { SignupPageModule } from '../pages/signup/signup.module';
import { PerfilPageModule } from '../pages/perfil/perfil.module';
import { EditaperfilPageModule } from '../pages/editaperfil/editaperfil.module';
import { DetalhaeventoPageModule } from '../pages/detalhaevento/detalhaevento.module';
import { BuscareventosPageModule } from '../pages/buscareventos/buscareventos.module';
import { AdicionarEventosPageModule } from '../pages/adicionareventos/adicionareventos.module';
import { ResetpasswordPageModule } from '../pages/resetpassword/resetpassword.module';

@NgModule({
  declarations: [
    MyApp
   ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    InicioPageModule,
    HomePageModule,
    SigninPageModule,
    SignupPageModule,
    PerfilPageModule,
    EditaperfilPageModule,
    DetalhaeventoPageModule,
    BuscareventosPageModule,
    AdicionarEventosPageModule,
    ResetpasswordPageModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InicioPage,
    HomePage,
    SigninPage,
    SignupPage,
    PerfilPage,
    EditaperfilPage,
    DetalhaPage,
    BuscareventosPage,
    AdicionarEventosPage,
    ResetpasswordPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    EventosService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
