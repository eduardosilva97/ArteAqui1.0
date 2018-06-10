import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { EventosService } from '../../../providers/eventos-service/eventos-service';
import { Title } from '@angular/platform-browser';

declare var google;

@IonicPage()
@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {
 
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  eventos: Observable<any>;
  key: any;
  lat: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation, private eventosService: EventosService) {
    this.lat = this.navParams.data.lat;
    this.marcaMapaTeste();
    
    console.log(this.lat);
  }
 
  ionViewDidLoad(){
    this.loadMap(); 

    
  }
 
  loadMap(){

    this.geolocation.getCurrentPosition().then((position) => {
 
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }


    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      

    }, (err) => {
      console.log(err);
    });


  
     
  }

  marcaMapa(){
     let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(this.lat)
  })
  let content = "<h4>Information!</h4>";         
 
  this.addInfoWindow(marker, content);
   
  }
  
  marcaMapaTeste(){
    var locations = [
      ['Peça Teatral', -12.97732865, -38.45075126],
      ['Exposição de Arte', -12.9609219, -38.43224082],
      ['Third Shoppe', -12.99882414, -38.52259996],
      ['Fourth Shoppe', -13.00631651, -38.50947353],
      ['Fifth Shoppe', -12.95063855, -38.49704202],
      ['Sixth Shoppe', -12.98206215, -38.47559957],
      ['Seventh Shoppe', -13.00302509, -38.45638551],
      ['Seventh Shoppe', -12.990980, -38.488687],
      ['Seventh Shoppe', -12.979013, -38.504262],
      ['Seventh Shoppe', -12.973138, -38.513785],
      ['Seventh Shoppe', -13.003469, -38.501336],
      ['Seventh Shoppe', -12.997723, -38.507847],
      ['Seventh Shoppe', -12.9616171,-38.4441862],
      ['Seventh Shoppe', -12.968376, -38.426303],
      ['Seventh Shoppe', -12.974686, -38.415652],
      ['Seventh Shoppe', -12.969945, -38.432680],
     
      
    ];
    for (let i in locations) {
    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(locations[i][1], locations[i][2]),

    
  });
  let content = "<h4>Evento Aqui!</h4>";  
  this.addInfoWindow(marker, content);
}
 
          
 

  }

addInfoWindow(marker, content){
 
  let infoWindow = new google.maps.InfoWindow({
    content: content
  });
 
  google.maps.event.addListener(marker, 'click', () => {
    infoWindow.open(this.map, marker);
  });
 
}


}