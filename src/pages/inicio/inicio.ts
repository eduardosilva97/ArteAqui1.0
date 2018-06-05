import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ResetpasswordPage } from '../resetpassword/resetpassword';
import { SigninPage } from '../signin/signin';


@Component({
  selector: 'page-inicio',
  templateUrl: 'inicio.html',
})
export class InicioPage {

  constructor(public navCtrl: NavController) {
  }

  createAccount(){
    this.navCtrl.push(SignupPage);
  }
  
  resetPassword(){
    this.navCtrl.push(ResetpasswordPage);
  }

  signInWithEmailPage(){
    this.navCtrl.push(SigninPage);
  }
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad InicioPage');
  }

}
