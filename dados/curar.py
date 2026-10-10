"""Curadoria dos pontos culturais do OpenStreetMap em Salvador -> osm-curado.json"""
import json, re

todos = json.load(open('todos.json', encoding='utf-8'))

# Categoria padrão por tag do OSM
PADRAO = {
    'theatre': 'teatro', 'cinema': 'cinema', 'museum': 'museu', 'gallery': 'galeria',
    'arts_centre': 'centro_cultural', 'library': 'biblioteca', 'artwork': 'monumento',
    'monument': 'monumento', 'memorial': 'monumento', 'castle': 'patrimonio', 'fort': 'patrimonio',
    'manor': 'patrimonio', 'building': 'patrimonio', 'ruins': 'patrimonio', 'attraction': 'patrimonio',
    'viewpoint': 'monumento', 'planetarium': 'centro_cultural',
    # Estes só entram se listados em INCLUIR
    'community_centre': None, 'events_venue': None, 'marketplace': None,
}

# Ajustes por elemento: categoria nova e/ou nome corrigido. None = excluir.
AJUSTE = {
    # arts_centre
    'node/8866161173': None, 'node/4144484655': None, 'way/1225333730': None,  # D'veneta, Escologia, Caixa duplicada
    'node/2627418546': ('galeria', None), 'node/4013135970': ('danca', None),
    'way/831234628': ('patrimonio', 'Casa Branca (Ilê Axé Iyá Nassô Oká)'),
    'way/996622660': ('carnaval', 'Sede dos Filhos de Gandhy'), 'way/1220405040': ('carnaval', 'Afoxé Laroyê'),
    'way/1220604673': ('musica', None), 'way/1220613027': ('feira', None),
    'way/1221092837': ('teatro', 'Cooperativa Baiana de Teatro'), 'way/1225423756': ('literatura', None),
    'way/586101291': ('centro_cultural', 'Escola Picolino de Artes do Circo'),
    # artwork / monument / memorial
    'node/13437583104': None, 'node/13741234764': None, 'node/6376853900': None, 'node/11647057611': None,
    'node/13610599910': None, 'node/13575791620': None, 'node/6380646795': None, 'node/10768159559': None,
    'way/1317252789': None, 'way/1317699190': None, 'node/13567598979': None,
    'node/13743874895': ('monumento', 'Santa Dulce dos Pobres e Papa Francisco'),
    'node/12998517512': ('monumento', 'Busto do Eng. Félix Mendonça'),
    'node/13565650620': ('monumento', 'Sereia do Rio Vermelho'),
    'node/13565507757': ('monumento', 'Busto do Almirante Tamandaré (Rio Vermelho)'),
    'node/13648567552': ('monumento', 'Busto de L. L. Zamenhof'),
    'node/3705285551': ('monumento', 'Memorial Dr. John L. Wood Paterson'),
    'way/1321552029': ('capoeira', None), 'way/1219370220': ('museu', None),
    'node/12228717227': ('monumento', 'Coluna à Maria Felipa'),
    'way/680989364': ('galeria', 'Muro dos Grafites'),
    # fortes / patrimônio
    'node/1014938188': None,  # Forte de São Diogo duplicado (fica o museu)
    'way/366301422': ('capoeira', 'Forte da Capoeira (Forte de Santo Antônio Além do Carmo)'),
    'way/288204868': None,  # Palácio de Ondina: residência oficial, não visitável
    'node/12153684691': None,
    'node/12153684690': ('patrimonio', 'Antiga Fábrica de Tecidos São Brás'),
    # museus
    'node/11942232870': ('galeria', None), 'node/5767243666': ('patrimonio', None),
    'way/1220604759': None, 'node/9654025117': ('musica', None), 'way/1221094149': None,
    'way/1230964172': None, 'way/779724306': ('museu', 'Memorial Irmã Dulce'),
    'way/813979936': ('museu', 'Museu do Sorvete (Solar Amado Bahia)'),
    'node/9293067755': ('museu', 'Casa de Itapuã'), 'way/1316829334': ('centro_cultural', 'Instituto Goethe (ICBA)'),
    'way/1220408561': ('centro_cultural', None),
    # teatros
    'node/1166111385': None, 'node/9140096617': None, 'way/996622662': None, 'node/9202475245': None,
    'node/6563414885': ('musica', None), 'node/9267423517': ('musica', None), 'node/9654011917': ('musica', None),
    'node/9652032017': ('musica', None), 'node/13196820621': ('centro_cultural', None),
    'way/238963126': ('musica', 'Concha Acústica do Teatro Castro Alves'),
    'way/1221004185': ('teatro', 'Teatro SESC Senac Pelourinho'),
    'way/836899302': ('teatro', 'Teatro Vila Velha'),
    'way/672434509': ('teatro', 'Teatro SESI Rio Vermelho'),
}

# Elementos de tipos "fracos" (centro comunitário, local de eventos, mercado) que entram
INCLUIR = {
    'node/7830236451': 'capoeira', 'node/8101895534': ('capoeira', 'Associação de Capoeira Fé na Paz'),
    'node/9195889718': 'centro_cultural', 'node/13742311548': 'galeria',
    'way/1219390692': 'patrimonio', 'way/1219396700': 'centro_cultural',
    'node/7512097739': ('carnaval', 'Senzala do Barro Preto (Ilê Aiyê)'),
    'way/1223978606': 'carnaval', 'way/1221080667': 'carnaval',
    'node/622395155': 'feira', 'way/59392558': 'feira', 'way/310356391': ('feira', 'Mercado do Rio Vermelho (Ceasinha)'),
    'relation/3972645': 'feira', 'way/456642330': 'feira',
}

NOMES_CATEGORIA = {
    'teatro': 'Teatro', 'cinema': 'Cinema', 'museu': 'Museu', 'galeria': 'Galeria e artes visuais',
    'centro_cultural': 'Centro cultural', 'biblioteca': 'Biblioteca', 'musica': 'Música',
    'danca': 'Dança', 'capoeira': 'Capoeira', 'festa': 'Festa popular', 'carnaval': 'Carnaval',
    'feira': 'Feira e artesanato', 'monumento': 'Monumento e arte pública', 'patrimonio': 'Patrimônio histórico',
    'literatura': 'Literatura',
}

saida, vistos = [], set()
for k, e in todos.items():
    if not e['_in']:
        continue
    t = e['tags']
    tipo = t.get('amenity') or t.get('tourism') or t.get('historic')
    nome = re.sub(r'\s+', ' ', t.get('name', '').replace('‎', '')).strip()
    cat = PADRAO.get(tipo)
    if k in INCLUIR:
        v = INCLUIR[k]
        cat, nome = (v, nome) if isinstance(v, str) else (v[0], v[1] or nome)
    if k in AJUSTE:
        if AJUSTE[k] is None:
            continue
        cat, novo = AJUSTE[k]
        nome = novo or nome
    if not cat or not nome:
        continue
    chave_nome = re.sub(r'\W+', '', nome.lower())
    if chave_nome in vistos:
        continue
    vistos.add(chave_nome)
    rua = ' '.join(x for x in [t.get('addr:street', ''), t.get('addr:housenumber', '')] if x)
    saida.append({
        'key': 'osm-' + k.replace('/', '-'),
        'eventoNome': nome[0].upper() + nome[1:],
        'categoria': cat,
        'genero': NOMES_CATEGORIA[cat],
        'local': ', '.join(x for x in [rua, t.get('addr:suburb', '')] if x),
        'descricao': t.get('description', ''),
        'quando': t.get('opening_hours', ''),
        'site': t.get('website') or t.get('contact:website') or '',
        'latlng': '%.6f, %.6f' % (e['_lat'], e['_lon']),
        'fonte': 'https://www.openstreetmap.org/' + k,
        'fixo': True,
    })

json.dump(saida, open('osm-curado.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(saida), Counter(x['categoria'] for x in saida).most_common())
print('sem local:', sum(1 for x in saida if not x['local']))
