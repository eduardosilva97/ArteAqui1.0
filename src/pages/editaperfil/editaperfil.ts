import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../providers/auth/auth-service';

@IonicPage()
@Component({
  selector: 'page-editaperfil',
  templateUrl: 'editaperfil.html',
})
export class EditaperfilPage {
  user: { nome: string, idade: string };
  @ViewChild('form') form: NgForm;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private authService: AuthService, private toastCtrl: ToastController) {
    const atual = this.authService.usuarioAtual || { nome: '', idade: '' };
    this.user = { nome: atual.nome, idade: atual.idade };
  }

  salvar() {
    if (this.form.form.valid) {
      this.authService.atualizarPerfil(this.user).then(() => {
        this.toastCtrl.create({ message: 'Perfil atualizado.', duration: 3000 }).present();
        this.navCtrl.pop();
      });
    }
  }

}
