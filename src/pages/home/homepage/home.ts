import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { EventosService, lerLatLng, textoPreco } from '../../../providers/eventos-service/eventos-service';
import { CATEGORIAS, Categoria, categoria } from '../../../providers/eventos-service/categorias';
import { DetalhaPage } from '../../detalhaevento/detalhaevento';

// Leaflet + Leaflet.markercluster + OpenStreetMap, carregados em index.html (não precisa de chave de API).
declare var L;

const CENTRO_SALVADOR: [number, number] = [-12.9777, -38.5016];

@IonicPage()
@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marcadores: any;
  eventoEmFoco: any;
  categorias: Categoria[] = [];
  filtro: string = null;
  temAgenda = false;
  private eventos: any[] = [];
  private visiveis: any[] = [];
  private inscricao: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation,
    private eventosService: EventosService, private zone: NgZone) {
    this.eventoEmFoco = this.navParams.data.evento;
  }

  ionViewDidLoad(){
    this.loadMap();
    this.inscricao = this.eventosService.getAll().subscribe(eventos => {
      this.eventos = eventos;
      // Só mostra na barra as categorias que têm algum ponto.
      this.categorias = CATEGORIAS.filter(c => eventos.some(e => categoria(e.categoria).chave === c.chave));
      this.temAgenda = eventos.some(e => e.agenda);
      this.marcaMapa();
    });
  }

  ionViewDidEnter(){
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnDestroy(){
    if (this.inscricao) {
      this.inscricao.unsubscribe();
    }
  }

  loadMap(){
    this.map = L.map(this.mapElement.nativeElement, { zoomControl: false }).setView(CENTRO_SALVADOR, 13);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; colaboradores do OpenStreetMap'
    }).addTo(this.map);
    this.marcadores = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      iconCreateFunction: grupo => L.divIcon({
        html: '<span>' + grupo.getChildCount() + '</span>',
        className: 'grupo-marcadores',
        iconSize: [40, 40]
      })
    }).addTo(this.map);

    if (this.eventoEmFoco) {
      return;
    }
    this.geolocation.getCurrentPosition({ timeout: 10000 }).then((position) => {
      const aqui: [number, number] = [position.coords.latitude, position.coords.longitude];
      // Só centraliza na pessoa se ela estiver em Salvador e arredores.
      if (this.map.distance(aqui, CENTRO_SALVADOR) < 40000) {
        this.map.setView(aqui, 15);
      }
    }, (err) => {
      console.log(err);
    });
  }

  filtrar(chave: string){
    this.filtro = this.filtro === chave ? null : chave;
    this.marcaMapa();
    this.marcaMapaTeste();
  }

  marcaMapa(){
    if (!this.marcadores) {
      return;
    }
    this.marcadores.clearLayers();
    let foco = null;
    const novos = [];
    this.eventos.forEach(evento => {
      const posicao = lerLatLng(evento.latlng);
      const cat = categoria(evento.categoria);
      // O filtro "Agenda" mostra só os eventos com data; os outros filtram pela categoria.
      const fora = this.filtro === 'agenda' ? !evento.agenda : this.filtro && cat.chave !== this.filtro;
      if (!posicao || fora) {
        return;
      }
      const marker = L.marker(posicao, { icon: this.icone(cat, evento.agenda), title: evento.eventoNome });
      this.addInfoWindow(marker, this.conteudo(evento, cat));
      novos.push(marker);
      if (this.eventoEmFoco && this.eventoEmFoco.key === evento.key) {
        foco = marker;
      }
    });
    this.marcadores.addLayers(novos);
    this.visiveis = novos.map(m => m.getLatLng());
    if (foco) {
      this.eventoEmFoco = null;
      this.marcadores.zoomToShowLayer(foco, () => foco.openPopup());
    }
  }

  // Botão "Marcadores": enquadra todos os pontos visíveis no mapa.
  // (Calcula pelos pontos atuais: o getBounds do grupo guarda os limites de antes do filtro.)
  marcaMapaTeste(){
    if (this.visiveis.length) {
      this.map.fitBounds(L.latLngBounds(this.visiveis), { padding: [50, 50], maxZoom: 16 });
    }
  }

  addInfoWindow(marker, content){
    // A folga no topo evita que o popup fique escondido atrás da barra de categorias.
    marker.bindPopup(content, { maxWidth: 260, minWidth: 200, autoPanPaddingTopLeft: L.point(10, 70) });
  }

  // Alfinete na cor da categoria, com o ícone dela no meio. Evento da agenda ganha um selo de calendário.
  private icone(cat: Categoria, agenda?: boolean) {
    return L.divIcon({
      className: 'marcador-cultural' + (agenda ? ' agenda' : ''),
      html: '<div class="pino" style="background:' + cat.cor + '"><ion-icon class="ion-md-' + cat.icone + '"></ion-icon></div>',
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38]
    });
  }

  private conteudo(evento: any, cat: Categoria): HTMLElement {
    const div = document.createElement('div');
    div.className = 'popup-cultural';
    const preco = textoPreco(evento.preco);
    div.innerHTML =
      '<span class="selo" style="background:' + cat.cor + '"><ion-icon class="ion-md-' + cat.icone + '"></ion-icon> ' + this.escapar(cat.nome) + '</span>' +
      '<h4>' + this.escapar(evento.eventoNome) + '</h4>' +
      (evento.local ? '<p>' + this.escapar(evento.local) + '</p>' : '') +
      (evento.quando || evento.date ? '<p><b>Quando:</b> ' + this.escapar(evento.quando || evento.date) + '</p>' : '') +
      (preco ? '<p><b>Preço:</b> ' + this.escapar(preco) + '</p>' : '');
    const botao = document.createElement('button');
    botao.className = 'ver-detalhes';
    botao.textContent = 'Ver detalhes';
    botao.addEventListener('click', () => this.zone.run(() => this.navCtrl.push(DetalhaPage, { evento: evento })));
    div.appendChild(botao);
    return div;
  }

  private escapar(texto: any): string {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
  }

}
