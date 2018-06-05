import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InicioPage } from '../inicio/inicio';
import { AuthService } from '../../providers/auth/auth-service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private authService: AuthService) { }
    
    signOut() {
      this.authService.signOut()
      .then(() => {
        this.navCtrl.setRoot(InicioPage);
      })
      .catch((error) => {
        console.error(error);
        
      });

    
  }
 
}
