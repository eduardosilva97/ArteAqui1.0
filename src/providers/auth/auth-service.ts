
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { User } from './user';

/*
  Autenticação local, sem servidor: as contas ficam no localStorage do navegador.
  Os erros usam os mesmos códigos do Firebase Auth para as telas não mudarem.
*/

const CHAVE_USUARIOS = 'arteaqui.usuarios';
const CHAVE_SESSAO = 'arteaqui.sessao';
const EMAIL_VALIDO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface Usuario {
  email: string;
  nome: string;
  idade: string;
}

interface Conta extends Usuario {
  senhaHash: string;
}

@Injectable()
export class AuthService {
  private sessao: BehaviorSubject<Usuario>;
  user: Observable<Usuario>;

  constructor() {
    const email = localStorage.getItem(CHAVE_SESSAO);
    this.sessao = new BehaviorSubject<Usuario>(email ? this.semSenha(this.buscarConta(email)) : null);
    this.user = this.sessao.asObservable();
  }

  get usuarioAtual(): Usuario {
    return this.sessao.getValue();
  }

  createUser(user: User){
    const email = (user.email || '').trim().toLowerCase();
    if (!EMAIL_VALIDO.test(email)) {
      return Promise.reject({ code: 'auth/invalid-email' });
    }
    if (!user.password || user.password.length < 6) {
      return Promise.reject({ code: 'auth/weak-password' });
    }
    if (this.buscarConta(email)) {
      return Promise.reject({ code: 'auth/email-already-in-use' });
    }
    return this.hash(user.password).then(senhaHash => {
      const conta: Conta = { email: email, nome: user.nome || '', idade: user.idade || '', senhaHash: senhaHash };
      this.gravarContas(this.lerContas().concat(conta));
      this.iniciarSessao(conta);
      return this.semSenha(conta);
    });
  }

  signIn(user: User) {
    const email = (user.email || '').trim().toLowerCase();
    if (!EMAIL_VALIDO.test(email)) {
      return Promise.reject({ code: 'auth/invalid-email' });
    }
    const conta = this.buscarConta(email);
    if (!conta) {
      return Promise.reject({ code: 'auth/user-not-found' });
    }
    return this.hash(user.password || '').then(senhaHash => {
      if (senhaHash !== conta.senhaHash) {
        throw { code: 'auth/wrong-password' };
      }
      this.iniciarSessao(conta);
      return this.semSenha(conta);
    });
  }

  signOut(){
    localStorage.removeItem(CHAVE_SESSAO);
    this.sessao.next(null);
    return Promise.resolve();
  }

  atualizarPerfil(dados: { nome: string, idade: string }) {
    const atual = this.usuarioAtual;
    if (!atual) {
      return Promise.reject({ code: 'auth/no-current-user' });
    }
    const contas = this.lerContas().map(c => c.email === atual.email ? { ...c, nome: dados.nome, idade: dados.idade } : c);
    this.gravarContas(contas);
    this.sessao.next(this.semSenha(this.buscarConta(atual.email)));
    return Promise.resolve();
  }

  private iniciarSessao(conta: Conta) {
    localStorage.setItem(CHAVE_SESSAO, conta.email);
    this.sessao.next(this.semSenha(conta));
  }

  private buscarConta(email: string): Conta {
    return this.lerContas().filter(c => c.email === email)[0];
  }

  private lerContas(): Conta[] {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch (e) {
      return [];
    }
  }

  private gravarContas(contas: Conta[]) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(contas));
  }

  private semSenha(conta: Conta): Usuario {
    return conta ? { email: conta.email, nome: conta.nome, idade: conta.idade } : null;
  }

  private hash(senha: string): Promise<string> {
    const bytes = new (window as any).TextEncoder().encode(senha);
    return Promise.resolve(crypto.subtle.digest('SHA-256', bytes)).then((buffer: ArrayBuffer) =>
      Array.prototype.map.call(new Uint8Array(buffer), (b: number) => ('0' + b.toString(16)).slice(-2)).join('')
    );
  }

}
