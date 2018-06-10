import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/map';


@Injectable()
export class UsuarioService {

  
  private path = 'usuario/' ;

  constructor(private db: AngularFireDatabase) {}
   
    getAll(){
      return this.db.list(this.path)
      .snapshotChanges()
      .map(changes => {
        return changes.map(u => ({
          key: u.payload.key, ...u.payload.val()          
        }));
      });
    }

    get(key:string){
      return this.db.object(this.path + key)
      .snapshotChanges()
      .map(u => {
        return { key: u.key, ...u.payload.val() };
      })
      
    }
  
   
    save(usuario: any){
      return new Promise ((resolve, reject) =>{
        if (usuario.key){
          this.db.list(this.path)
           .update(usuario.key, {usuarioNome: usuario.usuarioNome, usuario: usuario.idade})
            .then(()=>resolve())
            .catch((er) => reject(er));
          } else {
            this.db.list(this.path)
            .push({usuarioNome: usuario.usuarioNome, latlng: usuario.latlng, preco: usuario.preco, local: usuario.local})
             .then((result: any)=>resolve(result.key));
          }
      });
     
    }

    remove (key: string){
      return this.db.list(this.path).remove(key);
    }

}