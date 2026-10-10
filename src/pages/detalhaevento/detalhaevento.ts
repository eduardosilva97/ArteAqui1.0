import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { EventosService, textoPreco } from '../../providers/eventos-service/eventos-service';
import { categoria, Categoria } from '../../providers/eventos-service/categorias';
import { Subscription } from 'rxjs/Subscription';
import { HomePage } from '../home/homepage/home';
import { AdicionarEventosPage } from '../adicionareventos/adicionareventos';

@IonicPage()
@Component({
  selector: 'page-detalha',
  templateUrl: 'detalhaevento.html',
})
export class DetalhaPage {
  evento: any;
  cat: Categoria;
  preco: string;
  private inscricao: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private eventosService: EventosService, private toast: ToastController) {
    this.mostrar(this.navParams.get("evento") || {});
    // Mantém a tela atualizada depois de uma edição.
    this.inscricao = this.eventosService.get(this.evento.key).subscribe(atual => {
      if (atual) {
        this.mostrar(atual);
      }
    });
  }

  private mostrar(evento: any){
    this.evento = evento;
    this.cat = categoria(evento.categoria);
    this.preco = textoPreco(evento.preco);
  }

  ngOnDestroy(){
    this.inscricao.unsubscribe();
  }

  marcaMapa(){
    this.navCtrl.setRoot(HomePage, { evento: this.evento });
  }

  editar(){
    this.navCtrl.push(AdicionarEventosPage, { evento: this.evento });
  }

  remover(){
    this.eventosService.remove(this.evento.key).then(() => {
      this.toast.create({ message: "Evento removido com sucesso.", duration: 3000}).present();
      this.navCtrl.pop();
    });
  }

}
