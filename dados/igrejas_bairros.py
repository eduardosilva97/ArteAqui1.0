"""Junta igrejas históricas ao osm-curado.json e preenche bairros via Nominatim (1 req/s)."""
import json, time, urllib.request, urllib.parse

UA = {'User-Agent': 'ArteAqui/1.0 (projeto de estudo; mapa cultural de Salvador)'}

def get(url):
    time.sleep(1.1)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)

dados = json.load(open('osm-curado.json', encoding='utf-8'))
nomes = {d['eventoNome'].lower() for d in dados}

# Igrejas com wikidata/heritage (fora: a de Itaparica)
for e in json.load(open('igrejas.json', encoding='utf-8'))['elements']:
    k = '%s/%s' % (e['type'], e['id'])
    if k == 'node/2916733105':
        continue
    c = e.get('center') or e
    nome = e['tags']['name']
    if nome.lower() in nomes:
        continue
    nomes.add(nome.lower())
    dados.append({'key': 'osm-' + k.replace('/', '-'), 'eventoNome': nome, 'categoria': 'patrimonio',
                  'genero': 'Patrimônio histórico', 'local': '', 'descricao': 'Igreja histórica.',
                  'quando': e['tags'].get('opening_hours', ''), 'site': '', 'latlng': '%.6f, %.6f' % (c['lat'], c['lon']),
                  'fonte': 'https://www.openstreetmap.org/' + k, 'fixo': True})

# Igrejas famosas sem essas marcações: busca por nome
FAMOSAS = [
    'Igreja e Convento de São Francisco, Salvador',
    'Catedral Basílica de Salvador',
    'Basílica Nossa Senhora da Conceição da Praia, Salvador',
    'Igreja de Santo Antônio Além do Carmo, Salvador',
    'Igreja Nossa Senhora de Sant\'Ana, Rio Vermelho, Salvador',
    'Igreja da Ordem Terceira de São Francisco, Salvador',
    'Igreja de São Domingos de Gusmão, Salvador',
]
for q in FAMOSAS:
    r = get('https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'q': q, 'format': 'json', 'limit': 1, 'viewbox': '-38.70,-12.73,-38.30,-13.02', 'bounded': 1}))
    if not r:
        print('não achei:', q)
        continue
    x = r[0]
    nome = q.split(',')[0]
    if nome.lower() in nomes:
        continue
    nomes.add(nome.lower())
    dados.append({'key': 'osm-%s-%s' % (x['osm_type'], x['osm_id']), 'eventoNome': nome, 'categoria': 'patrimonio',
                  'genero': 'Patrimônio histórico', 'local': '', 'descricao': 'Igreja histórica.', 'quando': '', 'site': '',
                  'latlng': '%.6f, %.6f' % (float(x['lat']), float(x['lon'])),
                  'fonte': 'https://www.openstreetmap.org/%s/%s' % (x['osm_type'], x['osm_id']), 'fixo': True})
    print('ok:', nome, x['display_name'][:80])

# Bairro para quem não tem local
faltam = [d for d in dados if not d['local']]
print('geocodificando', len(faltam))
for i, d in enumerate(faltam):
    lat, lng = [s.strip() for s in d['latlng'].split(',')]
    try:
        r = get('https://nominatim.openstreetmap.org/reverse?' + urllib.parse.urlencode(
            {'lat': lat, 'lon': lng, 'format': 'json', 'zoom': 17, 'addressdetails': 1}))
        a = r.get('address', {})
        rua = a.get('road', '')
        bairro = a.get('suburb') or a.get('neighbourhood') or a.get('quarter') or a.get('city_district') or ''
        d['local'] = ', '.join(x for x in [rua, bairro] if x)
    except Exception as ex:
        print('erro', d['eventoNome'], ex)
    if i % 25 == 0:
        print(i, d['eventoNome'], '->', d['local'], flush=True)

json.dump(dados, open('osm-curado.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('total', len(dados), 'sem local', sum(1 for d in dados if not d['local']))
