import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';



@Injectable()
export class EventosService {

  
  private path = 'evento/' ;

  constructor(private db: AngularFireDatabase) {}
   
    getAll(){
      return this.db.list(this.path)
      .snapshotChanges()
      .map(changes => {
        return changes.map(e => ({
          key: e.payload.key, ...e.payload.val()          
        }));
      });
    }

    get(key:string){
      return this.db.object(this.path + key)
      .snapshotChanges()
      .map(e => {
        return { key: e.key, ...e.payload.val() };
      })
      
    }
  
   
    save(evento: any){
      return new Promise ((resolve, reject) =>{
        if (evento.key){
          this.db.list(this.path)
           .update(evento.key, {eventoNome: evento.eventoNome, latlng: evento.latlng, preco: evento.preco, local: evento.local})
            .then(()=>resolve())
            .catch((er) => reject(er));
          } else {
            this.db.list(this.path)
            .push({eventoNome: evento.eventoNome, latlng: evento.latlng, preco: evento.preco, local: evento.local})
             .then((result: any)=>resolve(result.key));
          }
      });
     
    }

    remove (key: string){
      return this.db.list(this.path).remove(key);
    }

}
