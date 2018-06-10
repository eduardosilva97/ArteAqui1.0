import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { EventosService } from '../../providers/eventos-service/eventos-service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-adicionareventos',
  templateUrl: 'adicionareventos.html',
})
export class AdicionarEventosPage {

  title: string;
  form: FormGroup;
  evento: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private eventosService: EventosService, private formBuilder: FormBuilder, 
    private toast: ToastController) {

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
      eventoNome: [this.evento.nome, Validators.required],
      date: [this.evento.date, Validators.required],
      preco: [this.evento.preco, Validators.required],
      classificacao:[this.evento.classificacao, Validators.required],
      genero:[this.evento.genero, Validators.required],
      local: [this.evento.local, Validators.required],
      latlng: [this.evento.lat, Validators.required],
      

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