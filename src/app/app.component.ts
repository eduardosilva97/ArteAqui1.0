import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { InicioPage } from '../pages/inicio/inicio';
import { HomePage } from '../pages/home/homepage/home';
import { PerfilPage } from '../pages/perfil/perfil';
import { AdicionarEventosPage } from '../pages/adicionareventos/adicionareventos';
import { BuscareventosPage } from '../pages/buscareventos/buscareventos'
import { EventosService } from '../providers/eventos-service/eventos-service';
import { categoria } from '../providers/eventos-service/categorias';
import { DetalhaPage } from '../pages/detalhaevento/detalhaevento';

import { AuthService, Usuario } from '../providers/auth/auth-service';
import { Observable } from 'rxjs/Observable';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('content')
  nav: Nav;
  // O app abre direto no mapa; entrar com uma conta é opcional.
  rootPage:any = HomePage;
  eventos: Observable<any>;
  usuario: Observable<Usuario>;
  categoria = categoria;

  constructor(private authService: AuthService, platform: Platform,
    statusBar: StatusBar, splashScreen: SplashScreen,
     private eventosService: EventosService, private toast: ToastController) {

      this.eventos = this.eventosService.getMeus();
      this.usuario = this.authService.user;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });

  }

  entrar(){
    this.nav.push(InicioPage);
  }

  signOut(){
    this.authService.signOut()
    .then(() => {
       this.toast.create({ message: "Você saiu da sua conta.", duration: 2500}).present();
       this.nav.setRoot(HomePage);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  mapa(){
    this.nav.setRoot(HomePage);
  }

  perfil(){
    this.nav.push(PerfilPage);
  }

  adicionarEvento(){
    this.nav.push(AdicionarEventosPage);
  }

  editarEvento(evento: any){
    this.nav.push(AdicionarEventosPage, { evento: evento});
  }

  removerEvento(key: string){
    this.eventosService.remove(key)
      .then(() =>{
        this.toast.create({ message: "Evento removido com sucesso.", duration: 3000}).present();
      })
      .catch((e)=>{
        this.toast.create({ message: "Erro ao remover evento", duration: 3000}).present();
      })
  }

  detalharEvento(evento: any){
     this.nav.push(DetalhaPage, {evento: evento});
  }

  buscarEventos(){
    this.nav.push(BuscareventosPage);
  }

}
