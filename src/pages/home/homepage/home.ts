import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { EventosService } from '../../../providers/eventos-service/eventos-service';

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
    
    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: new google.maps.LatLng(-12.981265,-38.467062)
  });
 
   let content = "<h4>Suruba!</h4>";         
 
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