# ArteAqui

Mapa cultural de Salvador. Projeto de faculdade de 2018 (Eduardo Silva e Guilherme), feito em Ionic 3 + Angular 5 e atualizado em 2026.

**No ar:** https://guilhermecmt.github.io/ArteAqui1.0/

## O que mudou na atualização de 2026

- **Voltou a rodar.** O projeto Firebase e a chave do Google Maps de 2018 não funcionavam mais.
- **Sem servidor.** Contas e eventos cadastrados ficam salvos no próprio navegador (`localStorage`).
- **Mapa com OpenStreetMap** (Leaflet), que não precisa de chave de API.
- **Sem login obrigatório.** O app abre direto no mapa; criar conta é opcional.
- **332 pontos culturais já marcados:** teatros, museus, cinemas, bibliotecas, igrejas e monumentos, além de festas populares, circuitos do carnaval, ensaios, rodas de capoeira, feiras e festivais, com data, preço e fonte.
- **Marcadores por categoria,** cada uma com cor e ícone próprios. Os pontos próximos ficam agrupados, e uma barra no topo filtra o mapa.
- **Telas que estavam pela metade foram concluídas:** detalhes, busca, editar e remover evento, perfil.
- **Responsivo.** Funciona bem no celular, no tablet e no computador.
- **Login com Facebook e Google:** só mostra um aviso, porque depende de um servidor de autenticação.

Fontes dos dados e como atualizá-los: [`dados/README.md`](dados/README.md).

## Como rodar na sua máquina

O projeto usa ferramentas de 2018 e precisa do **Node 8**, que pode ficar ao lado da versão de Node já instalada.

1. Baixe o Node 8:
   - **Windows:** baixe [node-v8.17.0-win-x64.zip](https://nodejs.org/dist/v8.17.0/node-v8.17.0-win-x64.zip) e descompacte, por exemplo, em `C:\node8`.
   - **Mac/Linux:** use o [nvm](https://github.com/nvm-sh/nvm): `nvm install 8 && nvm use 8`.
2. Clone o repositório e entre na pasta:
   ```bash
   git clone https://github.com/eduardosilva97/ArteAqui1.0.git
   cd ArteAqui1.0
   ```
3. Coloque o Node 8 no PATH só para este terminal. No Windows, com o Git Bash:
   ```bash
   export PATH="/c/node8/node-v8.17.0-win-x64:$PATH"
   ```
4. Instale as dependências e rode:
   ```bash
   npm install
   npm run ionic:serve
   ```
5. Abra http://localhost:8100.

## Publicar no GitHub Pages

`npm run publicar` gera a versão de produção e envia a pasta `www/` para o branch `gh-pages`. Na primeira vez, o dono do repositório precisa ativar o Pages em **Settings → Pages → Deploy from a branch → `gh-pages` / `(root)`**.
