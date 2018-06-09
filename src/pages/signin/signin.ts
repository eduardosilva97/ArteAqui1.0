import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { AuthService } from '../../providers/auth/auth-service';
import { HomePage } from '../home/home';
import { NgForm } from '@angular/forms';
import { User } from '../../providers/auth/user';
/**
 * Generated class for the SigninPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})

export class SigninPage {
  
  user: User = new User();
  @ViewChild('form') form: NgForm;

  constructor(public navCtrl: NavController,  
    public toastCtrl: ToastController,
    private authService: AuthService) {
  }

  signIn(){
    if(this.form.form.valid){
      this.authService.signIn(this.user)
      .then(() => {
        this.navCtrl.setRoot(HomePage);
      })
      .catch((error: any) => {
        let toast = this.toastCtrl.create({duration: 3000, position: 'bottom' });
        if(error.code = 'auth/invalid-email'){
          toast.setMessage('O email inserido não é válido');
        }else if(error.code = 'auth/user-disabled'){
          toast.setMessage('O usuário cadastrado neste email está desabilitado');
        }else if(error.code = 'auth/user-not-found'){
          toast.setMessage('Email ou senha incorreto(s)');
        }else if(error.code = 'auth/wrong-password'){
          toast.setMessage('Email ou senha incorreto(s)');
        }

      });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninPage');
  }

}
