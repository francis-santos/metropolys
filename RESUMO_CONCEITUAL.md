Project Metropolys — Resumo Conceitual
O que é o Project Metropolys?

Project Metropolys é um jogo digital de tabuleiro focado em estratégia econômica, negociação e construção de patrimônio.

Os jogadores competem para construir o maior império imobiliário de uma cidade, adquirindo propriedades, negociando ativos, participando de leilões e tomando decisões financeiras que impactam diretamente seu crescimento dentro da partida.

Cada jogo acontece em uma cidade específica, escolhida pelos jogadores antes do início da partida. Essa cidade define a identidade visual do tabuleiro, os bairros disponíveis, os eventos especiais e o comportamento da economia local.

O objetivo não é apenas acumular dinheiro, mas desenvolver uma estratégia capaz de superar os adversários em um ambiente econômico dinâmico e imprevisível.

Diferencial Principal

Diferentemente dos jogos tradicionais de negociação imobiliária, o Project Metropolys utiliza um sistema modular onde cidades funcionam como expansões de conteúdo.

Cada cidade possui:

Propriedades exclusivas;
Eventos exclusivos;
Características econômicas próprias;
Identidade visual única;
Estilo de jogo diferenciado.

Isso garante alta rejogabilidade e permite que o universo do jogo cresça continuamente através de novos pacotes de cidades.

Como Funciona uma Partida

Antes de iniciar o jogo, os participantes escolhem uma cidade por conta própria ou randomica.

Após a seleção:

O tabuleiro é gerado.
Os jogadores recebem seus recursos iniciais.
A partida acontece em turnos.
Os participantes compram propriedades.
Cobram aluguéis.
Participam de negociações.
Disputam leilões.
Fazem investimentos.
Reagem aos acontecimentos da cidade.

Ao longo da partida, as decisões econômicas moldam o destino de cada jogador.

Economia Dinâmica

A economia da cidade não é estática.

Eventos podem alterar:

O valor dos imóveis;
O potencial de determinados bairros;
O fluxo financeiro da cidade;
As oportunidades de investimento.

Isso faz com que cada partida tenha sua própria história e exija adaptação constante dos jogadores.

Inteligência Artificial

O projeto foi concebido para evoluir gradualmente com recursos de Inteligência Artificial.

Nas versões mais avançadas, a IA poderá:

Criar eventos dinâmicos;
Controlar adversários;
Administrar o sistema bancário;
Gerar narrativas para a partida;
Influenciar a economia da cidade.

O objetivo é transformar cada sessão em uma experiência única.

Expansão por Cidades

O conteúdo do jogo será expandido através de novos pacotes de cidades.

Exemplos:

América do Sul Pack
Salvador
São Paulo
Buenos Aires
Montevidéu

Europa Pack
Londres
Paris
Roma

América do Norte Pack
Nova York
Chicago
Toronto

Future Pack
Neo City
Cyberpolis
Atlantis

Cada cidade adiciona novas possibilidades estratégicas sem alterar a essência do jogo.

Visão de Longo Prazo

Tornar-se a principal plataforma digital de jogos de tabuleiro focados em estratégia econômica e negociação, combinando conteúdo expansível, inteligência artificial e partidas altamente rejogáveis.

Project Metropolys busca oferecer uma experiência onde cada cidade representa um novo desafio e cada partida conta uma história diferente de crescimento, competição, negociação e construção de impérios econômicos.

Arquitetura MVP

Frontend:
Vue 3
Vuetify

Game Engine:
Phaser

Backend:
NestJS

Database:
Supabase

Realtime:
Supabase Realtime

Estrutura recomendada
apps/web
├── Vue
├── Vuetify
├── Phaser
│
├── screens
│   ├── Home
│   ├── CitySelection
│   ├── Match
│   └── Settings
│
├── game
│   ├── board
│   ├── economy
│   ├── players
│   ├── events
│   └── citypacks
│
└── services
    ├── supabase
    ├── ai
    └── multiplayer