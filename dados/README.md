# Dados do mapa cultural

O app lê `src/assets/data/locais-culturais.json`, gerado a partir de duas fontes:

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
