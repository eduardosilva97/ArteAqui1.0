import { ViewChild, ElementRef, Injectable } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { EventosService } from '../../providers/eventos-service/eventos-service';
 
declare var google;
 
@Injectable()
export class MapsService {
 
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  eventos: Observable<any>;
  key: any
  constructor( public geolocation: Geolocation, private eventosService: EventosService) {

    function marcaMapa(key: any){
        const subcribe = this.eventosService.get(this.key)
          .subscribe((e: any) => {
            subcribe.unsubscribe();
    
            this.eventos = e;
    
        let marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(e.lat, e.long)
      })
      let content = "<h4>Information!</h4>";         
     
      this.addInfoWindow(marker, content);
      });
     
      
      }
  }
 
  ionViewDidLoad(){
    this.loadMap();
  }
 
  loadMap(){

   return this.geolocation.getCurrentPosition().then((position) => {
 
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

 

  marcaMapaTeste(){
    
    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(-12.981265,-38.467062)
  });
 
   let content = "<h4>Information!</h4>";         
 
  this.addInfoWindow(marker, content);
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