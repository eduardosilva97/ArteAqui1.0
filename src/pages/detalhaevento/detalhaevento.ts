import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventosService } from '../../providers/eventos-service/eventos-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { HomePage } from '../home/homepage/home';


@IonicPage()
@Component({
  selector: 'page-detalha',
  templateUrl: 'detalhaevento.html',
})
export class DetalhaPage {
  @ViewChild('content') 
  preco: string;
  
  form = FormGroup;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private eventosService: EventosService, private formBuilder: FormBuilder) {
    // const subcribe = this.eventosService.get(this.navParams.data.key)
    //   .subscribe((c: any)=>{
    //     subcribe.unsubscribe();
    //      this.detalharEvento(c);
    //   });

    this.preco = this.navParams.get("evento");
    console.log(this.preco);


  }

  marcaMapa(){
    this.navCtrl.setRoot(HomePage);
  }

  detalharEvento(c: any){ 
   this.preco = c;
  
  }

}
