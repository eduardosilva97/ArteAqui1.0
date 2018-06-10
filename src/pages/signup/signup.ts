import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { User } from '../../providers/auth/user';
import { AuthService } from '../../providers/auth/auth-service';
import { HomePage } from '../home/homepage/home';
 
@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  user: User = new User();
  @ViewChild('form') form: NgForm;

  constructor(public navCtrl: NavController, 
    public toastCtrl: ToastController, 
    private authService: AuthService) {
  }

  createAccount(){
    if(this.form.form.valid){
      let toast = this.toastCtrl.create({duration: 3000, position: 'bottom'});
      
      this.authService.createUser(this.user)
       .then((user: any) => {
        toast.setMessage('Usuário criado com sucesso.');
        toast.present();

        this.navCtrl.setRoot(HomePage);
       })
       .catch((error: any) => {
        if(error.code == 'auth/email-already-in-use'){
          toast.setMessage('O e-mail digitado já está em uso.');
        }else if(error.code == 'auth/invalid-email'){
          toast.setMessage('O e-mail digitado não é válido');
        }else if(error.code == 'auth/operation-not-allowed'){
          toast.setMessage('Não é possivel criar usuário');
        }else if(error.code == 'auth/weak-password'){
          toast.setMessage('Sua senha é muito fraca');
        }
       
        toast.present();
       });
    }
  }
 
}
