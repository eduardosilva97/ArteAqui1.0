import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventosService } from '../../providers/eventos-service/eventos-service';
import { Observable } from 'rxjs/Observable';
import { HomePage } from '../home/homepage/home';
/**
 * Generated class for the BuscareventosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-buscareventos',
  templateUrl: 'buscareventos.html',
})
export class BuscareventosPage {
  eventos: Observable<any>;
  constructor(public navCtrl: NavController, public navParams: NavParams, private eventosService: EventosService) {
  
    this.eventos = this.eventosService.getAll();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BuscareventosPage');
  }

  marcarEvento(evento: any){
    this.navCtrl.setRoot('HomePage', {lat: evento.lat});
  }

}
