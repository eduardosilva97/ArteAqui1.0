# ArteAqui

App de eventos culturais em Salvador, mostrados num mapa. Projeto de faculdade de 2018, feito por Eduardo Silva e Guilherme (guigacmt), em Ionic 3 + Angular 5.

## O que dá para fazer

- Criar conta e entrar com e-mail e senha
- Ver os eventos num mapa (OpenStreetMap), centralizado na sua localização
- Listar, buscar (por nome, local ou gênero), ver detalhes, adicionar, editar e remover eventos
- Ver e editar o perfil

Por enquanto não há servidor: contas e eventos ficam guardados no `localStorage` do navegador. Na primeira abertura aparecem alguns eventos de exemplo. O login com Facebook e Google fica desativado até existir um servidor.

## Como rodar

O projeto usa ferramentas de 2018 e precisa do **Node 8** (o `node-sass` dessa época não instala em versões mais novas). Um Node 8 portátil resolve sem mexer no Node já instalado:

```bash
# Windows (Git Bash), com o Node 8 descompactado em C:\dev\tools
export PATH="/c/dev/tools/node-v8.17.0-win-x64:$PATH"
npm install
npm run ionic:serve      # abre em http://localhost:8100
```

Download do Node 8: https://nodejs.org/dist/v8.17.0/ (arquivo `node-v8.17.0-win-x64.zip`).

Build de produção: `npm run build -- --prod` (gera a pasta `www/`).
