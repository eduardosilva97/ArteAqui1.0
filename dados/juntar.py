"""Junta OpenStreetMap curado + pesquisa de atividades -> locais-culturais.json do app."""
import json, re, sys, time, unicodedata, urllib.request, urllib.parse

UA = {'User-Agent': 'ArteAqui/1.0 (projeto de estudo; mapa cultural de Salvador)'}
osm = json.load(open('osm-curado.json', encoding='utf-8'))
ativ = json.load(open('atividades-salvador.json', encoding='utf-8'))

NOMES = {'festa': 'Festa popular', 'carnaval': 'Carnaval', 'musica': 'Música', 'danca': 'Dança',
         'capoeira': 'Capoeira', 'feira': 'Feira e artesanato', 'patrimonio': 'Patrimônio histórico',
         'teatro': 'Teatro', 'cinema': 'Cinema', 'literatura': 'Literatura', 'galeria': 'Galeria e artes visuais'}

def slug(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60]

# Itens do OSM que a pesquisa cobre melhor: sai o do OSM; a coordenada exata dele vai para a atividade.
SUBSTITUI = {
    'Mercado Modelo': 'Mercado Modelo',
    'Feira de São Joaquim': 'Feira de São Joaquim',
    'Feira de Sete Portas': 'Feira das Sete Portas',
    'Forte da Capoeira (Forte de Santo Antônio Além do Carmo)': 'Forte da Capoeira (Forte de Santo Antônio Além do Carmo)',
    'Memorial das Baianas': 'Memorial das Baianas de Acarajé',
    'Casa Branca (Ilê Axé Iyá Nassô Oká)': 'Terreiro da Casa Branca (Ilê Axé Iyá Nassô Oká)',
    'Sede dos Filhos de Gandhy': 'Afoxé Filhos de Gandhy',
    'Pedra de Xangô': 'Parque Pedra de Xangô',
}
REMOVER_OSM = {'Igreja de Santo Antônio Além do Carmo', 'Senzala do Barro Preto (Ilê Aiyê)'}

coord_osm = {}
saida = []
for d in osm:
    if d['eventoNome'] in REMOVER_OSM:
        continue
    if d['eventoNome'] in SUBSTITUI:
        coord_osm[SUBSTITUI[d['eventoNome']]] = d['latlng']
        continue
    saida.append(d)

nomes_ativ = {a['nome'] for a in ativ}
for alvo in SUBSTITUI.values():
    if not any(a['nome'].startswith(alvo.split(' (')[0]) for a in ativ):
        print('AVISO: substituto não encontrado na pesquisa:', alvo)

for a in ativ:
    cat = 'galeria' if a['categoria'] == 'artes' else a['categoria']
    latlng = '%.6f, %.6f' % (a['lat'], a['lng'])
    for alvo, c in coord_osm.items():
        if a['nome'] == alvo or a['nome'].startswith(alvo.split(' (')[0] + ' ('):
            latlng = c
    saida.append({
        'key': 'ativ-' + slug(a['nome']),
        'eventoNome': a['nome'],
        'categoria': cat,
        'genero': NOMES[cat],
        'local': a['local'],
        'descricao': a['descricao'],
        'quando': a['quando'],
        'preco': a.get('preco', ''),
        'site': '',
        'latlng': latlng,
        'aproximado': not a.get('coordenadas_confiaveis', True),
        'fonte': a['fonte'],
    })

# Duas igrejas famosas que a primeira busca não achou
def busca(q):
    time.sleep(1.1)
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'q': q, 'format': 'json', 'limit': 1, 'viewbox': '-38.56,-12.95,-38.48,-13.00', 'bounded': 1})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)

for nome, q, local in [('Igreja e Convento de São Francisco', 'Igreja de São Francisco', 'Largo do Cruzeiro de São Francisco, Pelourinho'),
                       ('Basílica de Nossa Senhora da Conceição da Praia', 'Conceição da Praia', 'Comércio')]:
    r = busca(q)
    if r and 'Salvador' in r[0]['display_name']:
        x = r[0]
        print('ok:', nome, '->', x['display_name'][:90])
        saida.append({'key': 'osm-%s-%s' % (x['osm_type'], x['osm_id']), 'eventoNome': nome, 'categoria': 'patrimonio',
                      'genero': 'Patrimônio histórico', 'local': local, 'descricao': 'Igreja histórica.', 'quando': '',
                      'site': '', 'latlng': '%.6f, %.6f' % (float(x['lat']), float(x['lon'])),
                      'fonte': 'https://www.openstreetmap.org/%s/%s' % (x['osm_type'], x['osm_id'])})
    else:
        print('não achei:', nome, r[:1])

for d in saida:
    d.pop('fixo', None)
    for k in ['descricao', 'quando', 'site']:
        d.setdefault(k, '')

chaves = [d['key'] for d in saida]
assert len(chaves) == len(set(chaves)), 'chaves repetidas'
destino = sys.argv[1]
json.dump(saida, open(destino, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(saida), 'itens;', Counter(d['categoria'] for d in saida).most_common())
