import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Subscription } from 'rxjs/Subscription';
import { EventosService, lerLatLng } from '../../../providers/eventos-service/eventos-service';

// Leaflet + OpenStreetMap, carregado em index.html (não precisa de chave de API).
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
  private inscricao: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation, private eventosService: EventosService) {
    this.eventoEmFoco = this.navParams.data.evento;
  }

  ionViewDidLoad(){
    this.loadMap();
    this.inscricao = this.eventosService.getAll().subscribe(eventos => this.marcaMapa(eventos));
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
    this.map = L.map(this.mapElement.nativeElement).setView(CENTRO_SALVADOR, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; colaboradores do OpenStreetMap'
    }).addTo(this.map);
    this.marcadores = L.featureGroup().addTo(this.map);

    if (this.eventoEmFoco) {
      return;
    }
    this.geolocation.getCurrentPosition().then((position) => {
      this.map.setView([position.coords.latitude, position.coords.longitude], 15);
    }, (err) => {
      console.log(err);
    });
  }

  marcaMapa(eventos: any[]){
    if (!this.marcadores) {
      return;
    }
    this.marcadores.clearLayers();
    eventos.forEach(evento => {
      const posicao = lerLatLng(evento.latlng);
      if (!posicao) {
        return;
      }
      const marker = L.marker(posicao).addTo(this.marcadores);
      this.addInfoWindow(marker, this.conteudo(evento));
      if (this.eventoEmFoco && this.eventoEmFoco.key === evento.key) {
        this.map.setView(posicao, 16);
        marker.openPopup();
      }
    });
  }

  // Botão "Marcadores": enquadra todos os eventos no mapa.
  marcaMapaTeste(){
    if (this.marcadores && this.marcadores.getLayers().length) {
      this.map.fitBounds(this.marcadores.getBounds(), { padding: [40, 40] });
    }
  }

  addInfoWindow(marker, content){
    marker.bindPopup(content);
  }

  private conteudo(evento: any): string {
    const preco = evento.preco > 0 ? 'R$ ' + evento.preco : 'Grátis';
    return '<h4>' + this.escapar(evento.eventoNome) + '</h4>' +
      '<p>' + this.escapar(evento.local) + '<br>' + this.escapar(evento.date) + ' · ' + preco + '</p>';
  }

  private escapar(texto: any): string {
    const div = document.createElement('div');
    div.textContent = texto == null ? '' : String(texto);
    return div.innerHTML;
  }

}
