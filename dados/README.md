# Dados do mapa cultural

O app lê dois arquivos: `src/assets/data/locais-culturais.json` (lugares e atividades fixas) e `src/assets/data/agenda.json` (eventos com data, veja [Agenda](#agenda)).

## Lugares e atividades fixas

`locais-culturais.json` é gerado a partir de duas fontes:

1. **OpenStreetMap**: teatros, cinemas, museus, galerias, centros culturais, bibliotecas, monumentos, patrimônio histórico, mercados e igrejas históricas dentro do município de Salvador. Os dados do OSM são © colaboradores do OpenStreetMap, sob a licença [ODbL](https://opendatacommons.org/licenses/odbl/).
2. **Pesquisa de atividades** (`atividades-salvador.json`): festas populares, circuitos de carnaval, ensaios, rodas de capoeira, feiras, festivais e terreiros tombados. Inclui data ou frequência, preço e uma fonte por item. Base: calendário oficial de eventos da Prefeitura (Saltur, 2025) e notícias de 2024–2026. Itens com `coordenadas_confiaveis: false` aparecem no app como "localização aproximada".

## Como regenerar

Requer Python 3 (só biblioteca padrão) e acesso à internet. As APIs públicas do OSM pedem no máximo 1 requisição por segundo; os scripts já respeitam isso.

```bash
cd dados
python baixar_osm.py          # todos.json + igrejas.json (Overpass + limite do município)
python curar.py               # osm-curado.json (categorias, exclusões, nomes corrigidos)
python igrejas_bairros.py     # + igrejas históricas e bairro de cada ponto (Nominatim, ~4 min)
python juntar.py ../src/assets/data/locais-culturais.json
```

A curadoria fica em `curar.py`: o dicionário `AJUSTE` troca a categoria ou corrige o nome de um elemento do OSM (ou o exclui, com `None`), e `INCLUIR` escolhe quais centros comunitários, locais de eventos e mercados entram (a maioria é buffet, mercadinho ou associação de moradores). Para acrescentar uma atividade, basta editar `atividades-salvador.json` e rodar `juntar.py`.

## Agenda

`agenda.py` monta `agenda.json` com os eventos dos próximos 90 dias, a partir de duas APIs públicas, sem cadastro nem chave:

| Fonte | Endereço | O que traz |
| --- | --- | --- |
| Salvador da Bahia (Prefeitura) | `https://www.salvadordabahia.com/wp-json/ssaba/v1/eventos` | título, período, local, bairro, texto |
| Agenda Cultural Salvador | `https://www.agendaculturalsalvador.com.br/api/events?limit=500` | título, data e hora, local, categoria, preço, link (junta Sympla, El Cabong e outros) |

Tudo é feito por regras, sem IA:

- **Categoria:** palavras-chave no título (`REGRAS`), depois no nome do local e, por último, a categoria da fonte. Cursos, palestras, corridas e eventos fora de Salvador ficam de fora.
- **Repetidos:** o mesmo título no mesmo dia entra uma vez só, com prioridade para a fonte da Prefeitura.
- **Posição no mapa:** primeiro procura o local entre os pontos de `locais-culturais.json`; se não achar, busca no Nominatim (OpenStreetMap), no máximo uma vez por segundo, e guarda a resposta em `cache-geocodificacao.json`. Quando só o bairro é encontrado, o evento aparece como "localização aproximada". O script lista no final os eventos que ficaram sem posição.
- **Falhas:** se uma fonte não responder, os eventos dela que ainda não passaram continuam da versão anterior. Se nenhuma responder, o arquivo não é tocado.

```bash
cd dados
python agenda.py    # grava ../src/assets/data/agenda.json
```

Um local que o OpenStreetMap conhece por outro nome entra em `APELIDOS`, no começo do script.

**Atualização automática:** `.github/workflows/agenda.yml` roda o script todo dia às 6h (horário de Salvador) e grava o `agenda.json` novo direto no branch `gh-pages`, sem precisar gerar o site de novo. Também dá para rodar na hora em **Actions → Atualizar agenda → Run workflow**. Em repositório sem branch `gh-pages`, o workflow não faz nada.
