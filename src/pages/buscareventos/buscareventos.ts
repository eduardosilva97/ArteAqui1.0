import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Searchbar } from 'ionic-angular';
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
  @ViewChild('searchbar', {read: ElementRef}) searchbarRef: ElementRef;
  @ViewChild('searchbar') searchbarElement: Searchbar;

  eventos: Observable<any>;
  constructor(public navCtrl: NavController, public navParams: NavParams, private eventosService: EventosService) {
  
    this.eventos = this.eventosService.getAll();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BuscareventosPage');
  }

  searchAction(texto: any) {
    let val = texto.target.value;
  }

  marcarEvento(evento: any){
    this.navCtrl.setRoot('HomePage', {lat: evento.lat});
  }

}
