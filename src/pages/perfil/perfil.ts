import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { AuthService, Usuario } from '../../providers/auth/auth-service';
import { EditaperfilPage } from '../editaperfil/editaperfil';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  usuario: Observable<Usuario>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private authService: AuthService) {
    this.usuario = this.authService.user;
  }

  editarPerfil() {
    this.navCtrl.push(EditaperfilPage);
  }

}
