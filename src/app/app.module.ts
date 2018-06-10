import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, List, NavController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

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
import firebase from 'firebase';
import { EventosService } from '../providers/eventos-service/eventos-service';
import { MapsService } from '../providers/maps-service/maps-service';
import { DetalhaPage } from '../pages/detalhaevento/detalhaevento';
import { DetalhaeventoPageModule } from '../pages/detalhaevento/detalhaevento.module';
import { HomePageModule } from '../pages/home/homepage/home.module';
import { BuscareventosPage } from '../pages/buscareventos/buscareventos';




const firebaseConfig = {
  apiKey: "AIzaSyCG3ii_N0KvsAwByeMRjsnbI28Nt3yivbY",
    authDomain: "arteaqui-a5c63.firebaseapp.com",
    databaseURL: "https://arteaqui-a5c63.firebaseio.com",
    projectId: "arteaqui-a5c63",
    storageBucket: "arteaqui-a5c63.appspot.com",
    messagingSenderId: "965366698549"
}

@NgModule({
  declarations: [
    MyApp,
    InicioPage,
    //HomePage,
    SigninPage,
    SignupPage,
    PerfilPage,
    BuscareventosPage,
   // DetalhaPage,
   
    AdicionarEventosPage,
    ResetpasswordPage
   ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    DetalhaeventoPageModule,
    HomePageModule,
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
    MapsService,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
