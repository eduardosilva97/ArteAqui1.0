import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventosService } from '../../providers/eventos-service/eventos-service';
import { Subscription } from 'rxjs/Subscription';
import { DetalhaPage } from '../detalhaevento/detalhaevento';

@IonicPage()
@Component({
  selector: 'page-buscareventos',
  templateUrl: 'buscareventos.html',
})
export class BuscareventosPage {

  todos: any[] = [];
  eventos: any[] = [];
  busca = '';
  private inscricao: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, private eventosService: EventosService) {
    this.inscricao = this.eventosService.getAll().subscribe(lista => {
      this.todos = lista;
      this.filtrar();
    });
  }

  ngOnDestroy() {
    this.inscricao.unsubscribe();
  }

  searchAction(texto: any) {
    this.busca = texto.target.value || '';
    this.filtrar();
  }

  // Procura pelo nome, local ou gênero, sem diferenciar maiúsculas nem acentos.
  private filtrar() {
    const termo = this.normalizar(this.busca);
    this.eventos = this.todos.filter(e =>
      !termo || [e.eventoNome, e.local, e.genero].some(campo => this.normalizar(campo).indexOf(termo) >= 0)
    );
  }

  private normalizar(texto: any): string {
    return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  marcarEvento(evento: any){
    this.navCtrl.push(DetalhaPage, { evento: evento });
  }

}
