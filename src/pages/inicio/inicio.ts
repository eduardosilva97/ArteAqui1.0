import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ResetpasswordPage } from '../resetpassword/resetpassword';
import { SigninPage } from '../signin/signin';
import { FirebaseApp } from 'angularfire2';
import firebase from 'firebase';


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
  createAccountf(){
    let provider = new firebase.auth.FacebookAuthProvider();

    firebase.auth().signInWithRedirect(provider).then(()=>{
      firebase.auth().getRedirectResult().then((result)=>{
        alert(JSON.stringify(result));
      }).catch(function(error){
        alert(JSON.stringify(error))
      });
      })
    }
    
  
  createAccountg(){
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

  signInWithFacebook(){
    

  }

}
