"""Baixa do OpenStreetMap (Overpass) os pontos culturais de Salvador e marca os que ficam dentro do município.

Saída: todos.json (entrada de curar.py). Uso: python baixar_osm.py
"""
import json, time, urllib.request, urllib.parse

UA = {'User-Agent': 'ArteAqui/1.0 (projeto de estudo; mapa cultural de Salvador)'}
BBOX = '-13.02,-38.70,-12.73,-38.30'
SERVIDORES = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
FILTROS = [
    'nwr["amenity"~"^(theatre|arts_centre|cinema|music_venue|planetarium|events_venue)$"]["name"]',
    'nwr["amenity"~"^(library|community_centre)$"]["name"]',
    'nwr["tourism"~"^(museum|gallery)$"]["name"]',
    'nwr["tourism"="artwork"]["name"]',
    'nwr["historic"~"^(monument|memorial|fort|castle|archaeological_site|ruins)$"]["name"]',
    'nwr["historic"~"^(church|building|manor|city_gate)$"]["name"]',
    'nwr["amenity"="marketplace"]["name"]',
]
IGREJAS = 'nwr["amenity"="place_of_worship"]["religion"="christian"]["name"][~"^(heritage|wikidata|wikipedia)$"~"."]'


def overpass(filtro):
    consulta = '[out:json][timeout:120][bbox:%s];(%s;);out center tags;' % (BBOX, filtro)
    for tentativa in range(6):
        url = SERVIDORES[tentativa % len(SERVIDORES)]
        try:
            req = urllib.request.Request(url, data=urllib.parse.urlencode({'data': consulta}).encode(), headers=UA)
            with urllib.request.urlopen(req, timeout=170) as r:
                return json.load(r)['elements']
        except Exception as e:
            print('  tentativa', tentativa + 1, 'falhou:', e)
            time.sleep(15)
    raise RuntimeError('Overpass indisponível para: ' + filtro)


def limite_salvador():
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
        {'city': 'Salvador', 'state': 'Bahia', 'country': 'Brasil', 'format': 'json', 'polygon_geojson': 1, 'limit': 1})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)[0]['geojson']['coordinates']


def dentro(poly, lat, lon):
    ins = False
    for ring in poly:
        j = len(ring) - 1
        for i in range(len(ring)):
            xi, yi = ring[i]; xj, yj = ring[j]
            if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi):
                ins = not ins
            j = i
    return ins


if __name__ == '__main__':
    poly = limite_salvador()
    todos = {}
    for f in FILTROS:
        print(f)
        for e in overpass(f):
            c = e.get('center') or e
            e['_lat'], e['_lon'] = c['lat'], c['lon']
            e['_in'] = dentro(poly, c['lat'], c['lon'])
            todos['%s/%s' % (e['type'], e['id'])] = e
        time.sleep(5)
    json.dump(todos, open('todos.json', 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump({'elements': overpass(IGREJAS)}, open('igrejas.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(len(todos), 'elementos;', sum(1 for e in todos.values() if e['_in']), 'dentro de Salvador')
