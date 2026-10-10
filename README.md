# ArteAqui

Mapa cultural de Salvador: teatros, museus, festas populares, carnaval, música, capoeira, feiras, patrimônio e mais. Projeto de faculdade de 2018, feito por Eduardo Silva e Guilherme (guigacmt), em Ionic 3 + Angular 5.

## O que dá para fazer

- Abrir direto no mapa, sem precisar de conta
- Ver mais de 330 pontos e atividades culturais já marcados, cada um com marcador na cor e com o ícone da sua categoria. Pontos próximos são agrupados
- Filtrar o mapa por categoria (festa popular, carnaval, música, dança, capoeira, teatro, cinema, museu, galeria, centro cultural, biblioteca, literatura, feira, patrimônio, monumento)
- Buscar por nome, bairro, categoria ou descrição e ver os detalhes (quando acontece, preço, fonte)
- Cadastrar, editar e remover seus próprios eventos (aparecem em "Meus eventos" no menu)
- Opcional: criar conta e entrar com e-mail e senha, ver e editar o perfil

Não há servidor: contas e eventos cadastrados ficam no `localStorage` do navegador. O login com Facebook e Google mostra um aviso, porque depende de um servidor (o Firebase de 2018 foi desativado).

Os dados culturais vêm do OpenStreetMap e de uma pesquisa de atividades recorrentes. Fontes, licença e como regenerar estão em [`dados/README.md`](dados/README.md).

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
