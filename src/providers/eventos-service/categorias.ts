// Categorias de atividade cultural: nome, ícone do Ionicons (ion-md-*) e cor do marcador no mapa.

export interface Categoria {
  chave: string;
  nome: string;
  icone: string;
  cor: string;
}

export const CATEGORIAS: Categoria[] = [
  { chave: 'festa',           nome: 'Festa popular',            icone: 'flower',         cor: '#e6a100' },
  { chave: 'carnaval',        nome: 'Carnaval',                 icone: 'megaphone',      cor: '#d81b60' },
  { chave: 'musica',          nome: 'Música',                   icone: 'musical-notes',  cor: '#2e7d32' },
  { chave: 'danca',           nome: 'Dança',                    icone: 'body',           cor: '#00897b' },
  { chave: 'capoeira',        nome: 'Capoeira',                 icone: 'people',         cor: '#6d4c41' },
  { chave: 'teatro',          nome: 'Teatro',                   icone: 'happy',          cor: '#8e24aa' },
  { chave: 'cinema',          nome: 'Cinema',                   icone: 'film',           cor: '#37474f' },
  { chave: 'museu',           nome: 'Museu',                    icone: 'albums',         cor: '#a1561c' },
  { chave: 'galeria',         nome: 'Galeria e artes visuais',  icone: 'color-palette',  cor: '#ec407a' },
  { chave: 'centro_cultural', nome: 'Centro cultural',          icone: 'star',           cor: '#f4511e' },
  { chave: 'biblioteca',      nome: 'Biblioteca',               icone: 'book',           cor: '#1e88e5' },
  { chave: 'literatura',      nome: 'Literatura',               icone: 'quote',          cor: '#3949ab' },
  { chave: 'feira',           nome: 'Feira e artesanato',       icone: 'basket',         cor: '#7cb342' },
  { chave: 'patrimonio',      nome: 'Patrimônio histórico',     icone: 'home',           cor: '#b71c1c' },
  { chave: 'monumento',       nome: 'Monumento e arte pública', icone: 'flag',           cor: '#757575' },
  { chave: 'evento',          nome: 'Evento da comunidade',     icone: 'calendar',       cor: '#488aff' },
];

const POR_CHAVE: { [chave: string]: Categoria } = {};
CATEGORIAS.forEach(c => POR_CHAVE[c.chave] = c);

export function categoria(chave: string): Categoria {
  return POR_CHAVE[chave] || POR_CHAVE['evento'];
}
