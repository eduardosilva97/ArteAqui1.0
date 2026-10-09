import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

/*
  Eventos guardados no localStorage do navegador, sem servidor.
  Na primeira vez, o app começa com alguns eventos de exemplo em Salvador.
*/

const CHAVE_EVENTOS = 'arteaqui.eventos';

// Converte o campo "Latitude e Longitude" do formulário ("-12.97, -38.51") em [lat, lng].
export function lerLatLng(texto: string): [number, number] {
  const partes = (texto || '').split(/[,;\s]+/).filter(p => p).map(Number);
  if (partes.length !== 2 || isNaN(partes[0]) || isNaN(partes[1])) {
    return null;
  }
  return [partes[0], partes[1]];
}

const EVENTOS_EXEMPLO = [
  { key: 'ex1', eventoNome: 'Peça Teatral', local: 'Teatro Castro Alves', genero: 'Teatro', preco: 40, classificacao: 12, date: '2026-11-14', latlng: '-12.9869, -38.5215' },
  { key: 'ex2', eventoNome: 'Exposição de Arte', local: 'Museu de Arte Moderna da Bahia', genero: 'Artes visuais', preco: 0, classificacao: 0, date: '2026-11-07', latlng: '-12.9800, -38.5208' },
  { key: 'ex3', eventoNome: 'Roda de Samba', local: 'Pelourinho', genero: 'Música', preco: 20, classificacao: 0, date: '2026-11-21', latlng: '-12.9714, -38.5108' },
  { key: 'ex4', eventoNome: 'Sarau de Poesia', local: 'Rio Vermelho', genero: 'Literatura', preco: 10, classificacao: 14, date: '2026-11-28', latlng: '-13.0112, -38.4904' },
  { key: 'ex5', eventoNome: 'Mostra de Dança', local: 'Barra', genero: 'Dança', preco: 30, classificacao: 0, date: '2026-12-05', latlng: '-13.0103, -38.5326' },
];

@Injectable()
export class EventosService {

  private eventos: BehaviorSubject<any[]>;

  constructor() {
    this.eventos = new BehaviorSubject<any[]>(this.ler());
  }

    getAll(){
      return this.eventos.asObservable();
    }

    get(key:string){
      return this.eventos.asObservable()
        .map(lista => lista.filter(e => e.key === key)[0]);
    }

    save(evento: any){
      const dados = {eventoNome: evento.eventoNome, latlng: evento.latlng, date: evento.date, preco: evento.preco, classificacao: evento.classificacao, genero: evento.genero, local: evento.local};
      const lista = this.eventos.getValue();
      if (evento.key){
        this.gravar(lista.map(e => e.key === evento.key ? { key: evento.key, ...dados } : e));
        return Promise.resolve(evento.key);
      }
      const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      this.gravar(lista.concat({ key: key, ...dados }));
      return Promise.resolve(key);
    }

    remove (key: string){
      this.gravar(this.eventos.getValue().filter(e => e.key !== key));
      return Promise.resolve();
    }

    private ler(): any[] {
      try {
        const salvos = localStorage.getItem(CHAVE_EVENTOS);
        return salvos ? JSON.parse(salvos) : EVENTOS_EXEMPLO;
      } catch (e) {
        return EVENTOS_EXEMPLO;
      }
    }

    private gravar(lista: any[]) {
      localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(lista));
      this.eventos.next(lista);
    }

}
