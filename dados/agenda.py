"""Agenda cultural de Salvador -> agenda.json do app, sem IA e sem chave de API.

Fontes (JSON público, sem cadastro):
  - Salvador da Bahia, portal de turismo da Prefeitura: https://www.salvadordabahia.com/wp-json/ssaba/v1/eventos
  - Agenda Cultural Salvador, agregador (Sympla, El Cabong...): https://www.agendaculturalsalvador.com.br/api/events

A categoria sai de regras por palavra-chave. A posição no mapa vem, nesta ordem, de um ponto do
catálogo (locais-culturais.json) com o mesmo nome, do cache de buscas ou do Nominatim (OpenStreetMap).
Se uma fonte falhar, os eventos dela que ainda não passaram são mantidos da versão anterior.

Uso (dentro de dados/):
  python agenda.py                                   # grava ../src/assets/data/agenda.json
  python agenda.py --saida X.json --anterior Y.json  # o que o GitHub Actions usa
"""
import argparse, html, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import date, datetime, timedelta, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
UA = {'User-Agent': 'ArteAqui/1.0 (projeto de estudo; mapa cultural de Salvador)'}
FUSO = timezone(timedelta(hours=-3))  # Salvador não tem horário de verão

FONTES = {
    'salvadordabahia': {
        'nome': 'Salvador da Bahia (Prefeitura)',
        'site': 'https://www.salvadordabahia.com/eventos/',
        'api': 'https://www.salvadordabahia.com/wp-json/ssaba/v1/eventos',
    },
    'agendaculturalsalvador': {
        'nome': 'Agenda Cultural Salvador',
        'site': 'https://www.agendaculturalsalvador.com.br/',
        'api': 'https://www.agendaculturalsalvador.com.br/api/events?limit=500',
    },
}

NOMES = {'festa': 'Festa popular', 'carnaval': 'Carnaval', 'musica': 'Música', 'danca': 'Dança',
         'capoeira': 'Capoeira', 'teatro': 'Teatro', 'cinema': 'Cinema', 'museu': 'Museu',
         'galeria': 'Galeria e artes visuais', 'centro_cultural': 'Centro cultural', 'biblioteca': 'Biblioteca',
         'literatura': 'Literatura', 'feira': 'Feira e artesanato', 'evento': 'Evento da comunidade'}

# Regras de categoria, na ordem em que são testadas no título (sem acento, minúsculo, palavra inteira).
REGRAS = [
    ('carnaval', r'carnava\w*|micareta|trio eletrico|pipoca do'),
    ('capoeira', r'capoeira'),
    ('cinema', r'cinema|filme|cineclube|curta[s-]?metragem|longa[s-]?metragem|documentario'),
    ('danca', r'danca|bale|ballet|coreografi'),
    ('literatura', r'livro|literari\w*|literatura|poesia|poeta|sarau|flipelo|leitura|cordel'),
    ('galeria', r'exposicao|exposicoes|galeria|artes visuais|instalacao|fotografia|pintura'),
    ('teatro', r'teatro|teatral|espetaculo|peca|musical|stand ?up|comedia|humor|circo|palhac\w*|monologo'),
    ('festa', r'lavagem|procissao|caruru|iemanja|yemanja|sao joao|festa de (santa|sao|nossa)|bembe|terno de reis'),
    ('feira', r'feira|artesanato|gastronomi\w*|festival gastronomico'),
    ('musica', r'show|samba|pagode|pagodao|reggae|rock|jazz|blues|orquestra|osba|sinfoni\w*|concerto|musica|'
               r'forro|axe|sertanejo|rap|hip hop|funk|mpb|turne|ensaio|party|baile|dj|festival|choro|seresta|coral|'
               r'festa|balada|apresenta|in concert|ao vivo'),
]
# Pelo nome do local, quando o título não diz nada.
REGRAS_LOCAL = [('teatro', r'teatro'), ('cinema', r'cine\w*'), ('museu', r'museu'), ('galeria', r'galeria'),
                ('biblioteca', r'biblioteca'), ('musica', r'arena|concha acustica|casa de show')]
# Pela categoria da Agenda Cultural Salvador, por último.
CATEGORIA_ACS = {'Teatro': 'teatro', 'Infantil': 'teatro', 'Dança': 'danca', 'Cinema': 'cinema',
                 'Exposições': 'galeria', 'Shows e Festas': 'musica', 'Festivais': 'musica', 'Religioso': 'festa'}
# Fora do escopo de um mapa cultural.
EXCLUIR_ACS = {'Cursos', 'Palestras', 'Bem-estar', 'Copa do Mundo'}
EXCLUIR = (r'workshop|treinamento|curso|palestra|congresso|seminario|mba|imersao|mentoria|capacitacao|concurso publico|'
           r'corrida|futebol|campeonato|interbairros')

# Locais conhecidos por outro nome no OpenStreetMap: nome normalizado -> o que buscar.
APELIDOS = {
    'patio ordem terceira': 'Igreja de São Francisco',  # o pátio fica ao lado da igreja
    'patio da ordem terceira': 'Igreja de São Francisco',
}
PALAVRAS_VAZIAS = {'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o'}

# Limites do município de Salvador para o Nominatim (oeste, norte, leste, sul).
CAIXA = '-38.70,-12.73,-38.30,-13.02'


def norm(s):
    s = unicodedata.normalize('NFD', html.unescape(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', s)).strip()


def tem(regra, texto):
    return re.search(r'\b(' + regra + r')\b', texto) is not None


def baixar(url, tentativas=3):
    for i in range(tentativas):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return json.load(r)
        except Exception as erro:
            if i == tentativas - 1:
                raise
            print('  tentando de novo:', erro)
            time.sleep(5 * (i + 1))


def classificar(titulo, local, categoria_fonte=None):
    t = norm(titulo)
    for chave, regra in REGRAS:
        if tem(regra, t):
            return chave
    l = norm(local)
    for chave, regra in REGRAS_LOCAL:
        if tem(regra, l):
            return chave
    return CATEGORIA_ACS.get(categoria_fonte, 'evento')


DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']


def texto_quando(inicio, fim, hora, ano_atual):
    i, f = date.fromisoformat(inicio), date.fromisoformat(fim)
    formato = '%d/%m' if i.year == f.year == ano_atual else '%d/%m/%Y'  # o ano só aparece se não for o atual
    if i == f:
        s = '%s, %s' % (DIAS[i.weekday()], i.strftime(formato))
    else:
        s = 'de %s a %s' % (i.strftime(formato), f.strftime(formato))
    return s + (' às ' + hora if hora else '')


def texto_hora(h, m):
    return '%dh%s' % (int(h), m if m and m != '00' else '')


# ---------------------------------------------------------------- Salvador da Bahia (Prefeitura)

def de_salvadordabahia(dados):
    eventos = []
    for x in dados:
        m = x.get('metadata') or {}
        periodos = m.get('periodos') or []
        if x.get('post_type') != 'eventos' or not periodos or (m.get('cidade') or 'Salvador') != 'Salvador':
            continue
        titulo = html.unescape(x['title']).strip()
        if tem(EXCLUIR, norm(titulo)):
            continue
        texto = html.unescape(x.get('text') or '')
        hora = (periodos[0].get('horario') or '').strip()
        if not hora:
            h = re.search(r'(?:às|a partir das|das)\s+(\d{1,2})h(\d{2})?', texto)
            hora = texto_hora(*h.groups()) if h else ''
        preco = (m.get('preco') or '').strip()
        if not preco:
            p = re.search(r'^(?:Entrada|Ingressos?)\s*:\s*(.+)$', texto, re.M)
            preco = p.group(1).strip() if p else ''
        if 'link' in preco.lower() or len(preco) > 60:
            preco = ''
        elif re.match(r'(?i)(gratuit|grátis|livre|franca)', preco):
            preco = 'gratuito'
        eventos.append({
            'origem': 'salvadordabahia', 'id': x.get('post_id'), 'titulo': titulo,
            'inicio': min(p['data_inicio'] for p in periodos), 'fim': max(p['data_fim'] for p in periodos),
            'hora': hora, 'lugar': html.unescape(m.get('localizacao') or '').strip(),
            'bairro': html.unescape(m.get('endereco') or '').strip(), 'preco': preco,
            'descricao': resumo(texto, titulo), 'site': x.get('url') or '',
            'categoria': classificar(titulo, m.get('localizacao')),
        })
    return eventos


def resumo(texto, titulo):
    partes = []
    for p in re.split(r'\n\s*\n|\n', texto):
        p = re.sub(r'\s+', ' ', p).strip()
        if (not p or p == titulo or p.endswith('[…]') or p.endswith('[&hellip;]')
                or re.match(r'(?i)(serviço|data|local|entrada|ingressos?|horário|classificação|ver esse post|'
                            r'um post compartilhado|informações)\b', p)):
            continue
        partes.append(p)
        if sum(len(x) for x in partes) > 220:
            break
    s = ' '.join(partes)
    if len(s) > 320:
        s = s[:320].rsplit(' ', 1)[0].rstrip(',;:') + '…'
    return s


# ---------------------------------------------------------------- Agenda Cultural Salvador

def de_agendaculturalsalvador(dados, sem_prefeitura):
    eventos = []
    for x in dados.get('events', []):
        if sem_prefeitura and x.get('source') == 'salvadordabahia':
            continue  # já vem direto da fonte oficial
        titulo = html.unescape(x.get('title') or '').strip()
        if not titulo or x.get('category') in EXCLUIR_ACS or tem(EXCLUIR, norm(titulo)):
            continue
        partes = [p.strip() for p in re.split(r'\s+[-–]\s*|\s*[-–]\s+', html.unescape(x.get('venue') or '')) if p.strip()]
        cidade = re.match(r'(.+?),\s*BA$', partes[-1]) if partes else None
        if cidade:
            if norm(cidade.group(1)) != 'salvador':
                continue  # evento em outra cidade da Bahia
            partes = partes[:-1]
        if partes and ',' in partes[0]:  # "Casa 141, Rio Vermelho"
            partes = [p.strip() for p in partes[0].split(',', 1)] + partes[1:]
        lugar, resto = (partes[0] if partes else ''), partes[1:]
        if norm(lugar) in ('', 'local a definir', 'a definir'):
            continue
        inicio = x.get('start_datetime') or ''
        if len(inicio) < 10:
            continue
        hora = inicio[11:16]
        preco = 'gratuito' if x.get('is_free') else (x.get('price') or '')
        if 'link' in preco.lower() or len(preco) > 60:
            preco = ''
        eventos.append({
            'origem': 'agendaculturalsalvador', 'id': x.get('id'), 'titulo': titulo,
            'inicio': inicio[:10], 'fim': inicio[:10],
            'hora': texto_hora(*hora.split(':')) if hora and hora != '00:00' else '',
            'lugar': lugar, 'bairro': resto[0] if resto else '', 'preco': preco, 'descricao': '',
            'site': x.get('url') or '', 'categoria': classificar(titulo, x.get('venue'), x.get('category')),
        })
    return eventos


# ---------------------------------------------------------------- Posição no mapa

class Geocodificador:
    def __init__(self, catalogo, arquivo_cache):
        self.arquivo = arquivo_cache
        self.cache = json.load(open(arquivo_cache, encoding='utf-8')) if os.path.exists(arquivo_cache) else {}
        # Nome normalizado -> coordenada, só de lugares (não das festas, que têm posição aproximada).
        self.lugares = {}
        for d in catalogo:
            if d.get('key', '').startswith('osm-') and d.get('latlng'):
                self.lugares.setdefault(norm(d['eventoNome']), d['latlng'])
        self.buscas = 0

    def do_catalogo(self, lugar):
        n = norm(lugar)
        if not n:
            return None
        if n in self.lugares:
            return self.lugares[n]
        # "Teatro Castro Alves" casa com "Sala Principal do Teatro Castro Alves" e vice-versa.
        # "Igreja do Rosário dos Pretos" casa com "Igreja Nossa Senhora do Rosário dos Homens Pretos".
        pn = set(n.split()) - PALAVRAS_VAZIAS
        candidatos = []
        for k, v in self.lugares.items():
            pk = set(k.split()) - PALAVRAS_VAZIAS
            if ((len(k) >= 12 and re.search(r'\b' + re.escape(k) + r'\b', n))
                    or (len(n) >= 12 and re.search(r'\b' + re.escape(n) + r'\b', k))
                    or (min(len(pn), len(pk)) >= 3 and (pn <= pk or pk <= pn))):
                candidatos.append((len(k), v))
        return max(candidatos)[1] if candidatos else None

    def nominatim(self, q, lugar='', bairro=''):
        self.buscas += 1
        time.sleep(1.1)  # política de uso: no máximo 1 requisição por segundo
        url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(
            {'q': q, 'format': 'json', 'limit': 1, 'viewbox': CAIXA, 'bounded': 1, 'countrycodes': 'br'})
        try:
            r = baixar(url, 2)
        except Exception as erro:
            print('  Nominatim falhou:', erro)
            return None
        if not r:
            return None
        r = r[0]
        # Um nome como "Casa 141" pode cair no número 141 de uma rua qualquer. Rua e endereço só valem
        # quando o nome do resultado é o próprio local (ex.: "Terminal Turístico Náutico da Bahia").
        if lugar and (r.get('class') == 'highway' or (r.get('class') == 'place' and r.get('type') in ('house', 'postcode'))):
            nome, alvo = norm(r.get('name')), norm(lugar)
            if not nome or (nome not in alvo and alvo not in nome):
                return None
        # Buscado só pelo nome, mas a fonte disse o bairro: o resultado tem que estar nele.
        if bairro and norm(bairro) not in norm(r.get('display_name')):
            return None
        return '%.6f, %.6f' % (float(r['lat']), float(r['lon']))

    def posicao(self, lugar, bairro):
        """Devolve (latlng, aproximado) ou None."""
        lugar = re.sub(r'\s*\([^)]*\)', '', lugar).strip()  # "Pátio Ordem Terceira (POT)"
        latlng = self.do_catalogo(lugar)
        if latlng:
            return latlng, False
        bairro = '' if norm(bairro) in ('', 'salvador', 'salvador ba') else bairro
        chave = norm(lugar) + '|' + norm(bairro)
        if not bairro and chave not in self.cache:
            # Sem bairro: aproveita o mesmo local já achado, com bairro, em outro evento.
            exatos = [v for k, v in sorted(self.cache.items())
                      if v and not v['aproximado'] and k.split('|')[0] == norm(lugar)]
            if exatos:
                return exatos[0]['latlng'], False
        if chave not in self.cache:
            consultas = []
            # (consulta, nome que o resultado precisa ter, bairro que precisa aparecer no endereço, aproximado)
            consultas = []
            if norm(lugar) in APELIDOS:
                consultas.append(('%s, Salvador, Bahia' % APELIDOS[norm(lugar)], '', '', False))
            if lugar and bairro:
                consultas.append(('%s, %s, Salvador, Bahia' % (lugar, bairro), lugar, '', False))
            if lugar:
                consultas.append(('%s, Salvador, Bahia' % lugar, lugar, bairro, False))
            if bairro:
                consultas.append(('%s, Salvador, Bahia' % bairro, '', '', True))  # só o bairro: posição aproximada
            achado = None
            for q, nome, no_bairro, aprox in consultas:
                c = self.nominatim(q, nome, no_bairro)
                if c:
                    achado = {'latlng': c, 'aproximado': aprox}
                    break
            self.cache[chave] = achado
        a = self.cache[chave]
        return (a['latlng'], a['aproximado']) if a else None

    def salvar(self):
        json.dump(self.cache, open(self.arquivo, 'w', encoding='utf-8'), ensure_ascii=False, indent=0, sort_keys=True)


# ---------------------------------------------------------------- Principal

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--saida', default=os.path.join(AQUI, '..', 'src', 'assets', 'data', 'agenda.json'))
    ap.add_argument('--anterior', help='agenda.json anterior (padrão: o próprio arquivo de saída)')
    ap.add_argument('--catalogo', default=os.path.join(AQUI, '..', 'src', 'assets', 'data', 'locais-culturais.json'))
    ap.add_argument('--cache', default=os.path.join(AQUI, 'cache-geocodificacao.json'))
    ap.add_argument('--dias', type=int, default=90, help='até quantos dias à frente (padrão: 90)')
    args = ap.parse_args()

    agora = datetime.now(FUSO)
    hoje, limite = agora.date().isoformat(), (agora.date() + timedelta(days=args.dias)).isoformat()
    anterior_arq = args.anterior or args.saida
    try:
        anterior = json.load(open(anterior_arq, encoding='utf-8'))
    except (OSError, ValueError):
        anterior = {'eventos': []}

    brutos, situacao = [], {}
    for origem in FONTES:
        print('Baixando', FONTES[origem]['nome'], '...')
        try:
            dados = baixar(FONTES[origem]['api'])
            if origem == 'salvadordabahia':
                lista = de_salvadordabahia(dados)
            else:
                lista = de_agendaculturalsalvador(dados, situacao.get('salvadordabahia') == 'ok')
            if not lista:
                raise ValueError('nenhum evento (o formato mudou?)')
            situacao[origem] = 'ok'
            brutos += lista
            print('  %d eventos' % len(lista))
        except Exception as erro:
            situacao[origem] = 'falhou: %s' % erro
            mantidos = [e for e in anterior.get('eventos', []) if e.get('origem') == origem and e['fim'] >= hoje]
            print('  FALHOU (%s); mantendo %d eventos da versão anterior' % (erro, len(mantidos)))
            brutos += [dict(e, _pronto=True) for e in mantidos]
    if all(s != 'ok' for s in situacao.values()):
        sys.exit('Nenhuma fonte respondeu; o arquivo anterior fica como está.')

    geo = Geocodificador(json.load(open(args.catalogo, encoding='utf-8')), args.cache)
    vistos, saida, sem_lugar = set(), [], []
    for e in sorted(brutos, key=lambda e: (e['inicio'], e.get('origem') != 'salvadordabahia')):
        if e.pop('_pronto', False):
            saida.append(e)
            continue
        if e['fim'] < hoje or e['inicio'] > limite:
            continue
        repetido = (norm(e['titulo'])[:40], e['inicio'])
        if repetido in vistos:
            continue
        vistos.add(repetido)
        pos = geo.posicao(e['lugar'], e['bairro'])
        if not pos:
            sem_lugar.append('%s (%s)' % (e['titulo'], e['lugar']))
            continue
        fonte = FONTES[e['origem']]
        local = e['lugar'] + (', ' + e['bairro'] if e['bairro'] and norm(e['bairro']) not in norm(e['lugar']) else '')
        saida.append({
            'key': 'agenda-%s-%s' % (e['origem'], e['id']),
            'eventoNome': e['titulo'],
            'categoria': e['categoria'],
            'genero': NOMES[e['categoria']],
            'local': local,
            'descricao': e['descricao'],
            'quando': texto_quando(e['inicio'], e['fim'], e['hora'], agora.year),
            'inicio': e['inicio'],
            'fim': e['fim'],
            'preco': e['preco'],
            'site': e['site'],
            'latlng': pos[0],
            'aproximado': pos[1],
            'fonte': fonte['site'],
            'fonteNome': fonte['nome'],
            'origem': e['origem'],
        })
    geo.salvar()

    saida.sort(key=lambda e: (e['inicio'], e['eventoNome']))
    chaves = [e['key'] for e in saida]
    assert len(chaves) == len(set(chaves)), 'chaves repetidas'
    resultado = {'atualizado': agora.isoformat(timespec='minutes'), 'fontes': situacao, 'eventos': saida}
    os.makedirs(os.path.dirname(os.path.abspath(args.saida)), exist_ok=True)
    json.dump(resultado, open(args.saida, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    from collections import Counter
    print('%d eventos de %s a %s; %d buscas no Nominatim' % (len(saida), hoje, limite, geo.buscas))
    print(Counter(e['categoria'] for e in saida).most_common())
    if sem_lugar:
        print('%d sem posição no mapa (ficaram de fora):' % len(sem_lugar))
        for s in sem_lugar:
            print('  -', s)


if __name__ == '__main__':
    main()
