import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';



@Injectable()
export class EventosService {

  
  private path = 'evento/' ;

  constructor(private db: AngularFireDatabase) {}
   
    public getAll(){
      return this.db.list(this.path)
      .snapshotChanges()
      .map(changes => {
        return changes.map(e => ({
          key: e.payload.key, ...e.payload.val()          
        }));
      });
    }

    public get(key:string){
      return this.db.object(this.path + key)
      .snapshotChanges()
      .map(e=> {
        return { key: e.key, ...e.payload.val() };
      })
      
    }
  
   
    public save(evento: any){
      return new Promise ((resolve, reject) =>{
        if (evento.key){
          this.db.list(this.path)
           .update(evento.key, {eventoNome: evento.eventoNome, long: evento.long, lat: evento.lat, preco: evento.preco, local: evento.local})
            .then(()=>resolve())
            .catch((er) => reject(er));
          } else {
            this.db.list(this.path)
            .push({eventoNome: evento.eventoNome, long: evento.long, lat: evento.lat, preco: evento.preco, local: evento.local})
             .then((result: any)=>resolve(result.key));
          }
      });
     
    }

    public remove (key: string){
      return this.db.list(this.path).remove(key);
    }

}
