import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';
import { categoria } from './categorias';

/*
  Duas fontes de eventos, sem servidor:
  - o catálogo de atividades culturais de Salvador (assets/data/locais-culturais.json), só leitura;
  - os eventos que a pessoa cadastra, guardados no localStorage do navegador.
*/

const CHAVE_EVENTOS = 'arteaqui.eventos';
const CATALOGO = 'assets/data/locais-culturais.json';

// Converte o campo "Latitude e Longitude" do formulário ("-12.97, -38.51") em [lat, lng].
export function lerLatLng(texto: string): [number, number] {
  const partes = (texto || '').split(/[,;\s]+/).filter(p => p).map(Number);
  if (partes.length !== 2 || isNaN(partes[0]) || isNaN(partes[1])) {
    return null;
  }
  return [partes[0], partes[1]];
}

// Preço para exibição: número (R$ / Grátis) ou o texto do catálogo ("gratuito", "a partir de R$ 20"...).
export function textoPreco(preco: any): string {
  if (preco === null || preco === undefined || preco === '') {
    return '';
  }
  if (!isNaN(Number(preco))) {
    return Number(preco) > 0 ? 'R$ ' + preco : 'Grátis';
  }
  return String(preco);
}

@Injectable()
export class EventosService {

  private catalogo = new BehaviorSubject<any[]>([]);
  private meus: BehaviorSubject<any[]>;

  constructor(private http: Http) {
    this.meus = new BehaviorSubject<any[]>(this.ler());
    this.http.get(CATALOGO)
      .map(res => res.json())
      .subscribe(
        lista => this.catalogo.next(lista.map(e => ({ ...e, fixo: true }))),
        erro => console.error('Não foi possível carregar o catálogo cultural', erro)
      );
  }

    // Catálogo + eventos da pessoa
    getAll(): Observable<any[]> {
      return Observable.combineLatest(this.catalogo, this.meus, (a, b) => a.concat(b));
    }

    getMeus(): Observable<any[]> {
      return this.meus.asObservable();
    }

    get(key:string){
      return this.getAll().map(lista => lista.filter(e => e.key === key)[0]);
    }

    save(evento: any){
      const cat = evento.categoria || 'evento';
      const dados = {eventoNome: evento.eventoNome, categoria: cat, genero: categoria(cat).nome, descricao: evento.descricao || '',
        quando: evento.quando || '', latlng: evento.latlng, date: evento.date || '', preco: evento.preco,
        classificacao: evento.classificacao, local: evento.local};
      const lista = this.meus.getValue();
      if (evento.key){
        this.gravar(lista.map(e => e.key === evento.key ? { key: evento.key, ...dados } : e));
        return Promise.resolve(evento.key);
      }
      const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      this.gravar(lista.concat({ key: key, ...dados }));
      return Promise.resolve(key);
    }

    remove (key: string){
      this.gravar(this.meus.getValue().filter(e => e.key !== key));
      return Promise.resolve();
    }

    private ler(): any[] {
      try {
        const salvos = JSON.parse(localStorage.getItem(CHAVE_EVENTOS)) || [];
        // Os exemplos fictícios da versão anterior (ex1..ex5) deram lugar ao catálogo real.
        return salvos.filter(e => !/^ex\d$/.test(e.key));
      } catch (e) {
        return [];
      }
    }

    private gravar(lista: any[]) {
      localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(lista));
      this.meus.next(lista);
    }

}
