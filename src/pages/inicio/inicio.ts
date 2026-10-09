import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ResetpasswordPage } from '../resetpassword/resetpassword';
import { SigninPage } from '../signin/signin';


@Component({
  selector: 'page-inicio',
  templateUrl: 'inicio.html',
})
export class InicioPage {

  constructor(public navCtrl: NavController, private toastCtrl: ToastController) {
  }
  createAccount(){
    this.navCtrl.push(SignupPage);
  }

  // Login social depende de um servidor (era o Firebase); por enquanto só e-mail e senha.
  createAccountf(){
    this.semServidor('Facebook');
  }

  createAccountg(){
    this.semServidor('Google');
  }

  private semServidor(rede: string){
    this.toastCtrl.create({
      message: 'Login com o ' + rede + ' ainda não está disponível. Use e-mail e senha.',
      duration: 3000
    }).present();
  }

  resetPassword(){
    this.navCtrl.push(ResetpasswordPage);
  }

  signInWithEmailPage(){
    this.navCtrl.push(SigninPage);
  }

}
