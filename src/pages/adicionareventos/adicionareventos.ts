import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { EventosService, lerLatLng } from '../../providers/eventos-service/eventos-service';
import { CATEGORIAS } from '../../providers/eventos-service/categorias';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-adicionareventos',
  templateUrl: 'adicionareventos.html',
})
export class AdicionarEventosPage {

  title: string;
  form: FormGroup;
  evento: any;
  categorias = CATEGORIAS;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private eventosService: EventosService, private formBuilder: FormBuilder,
    private toast: ToastController, private geolocation: Geolocation) {

  this.evento = this.navParams.data.evento || {};
  this.createForm();
  this.setupPageTitle();
}

  private setupPageTitle(){
    this.title = this.navParams.data.evento ? 'Alterando Evento' : 'Novo Evento' ;
  }

  createForm(){
    this.form = this.formBuilder.group ({
      key:[this.evento.key],
      eventoNome: [this.evento.eventoNome, Validators.required],
      categoria: [this.evento.categoria || 'evento', Validators.required],
      descricao: [this.evento.descricao],
      date: [this.evento.date],
      quando: [this.evento.quando],
      preco: [this.evento.preco],
      classificacao:[this.evento.classificacao],
      local: [this.evento.local, Validators.required],
      latlng: [this.evento.latlng, [Validators.required, (c: AbstractControl) => lerLatLng(c.value) ? null : { latlng: true }]],
    });
  }

  usarMinhaLocalizacao(){
    this.geolocation.getCurrentPosition({ timeout: 10000 }).then(pos => {
      this.form.patchValue({ latlng: pos.coords.latitude.toFixed(6) + ', ' + pos.coords.longitude.toFixed(6) });
    }, () => {
      this.toast.create({ message: "Não foi possível obter sua localização.", duration: 3000}).present();
    });
  }

  adicionarEvento(){
     if(this.form.valid){
       this.eventosService.save(this.form.value)
       .then(() => {
         this.toast.create({ message: "Evento salvo com sucesso.", duration: 3000}).present();
         this.navCtrl.pop();
       })
       .catch((e) => {
        this.toast.create({ message: "Erro ao salvar evento", duration: 3000}).present();
        console.error(e);
       });
     }

  }

}
