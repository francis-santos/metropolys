# 🌆 Project Metropolys

[![NestJS](https://img.shields.io/badge/Backend-NestJS-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Vue 3](https://img.shields.io/badge/Frontend-Vue%203-emerald?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Phaser](https://img.shields.io/badge/Game_Engine-Phaser_3-blueviolet?style=for-the-badge&logo=phaser)](https://phaser.io/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black?style=for-the-badge&logo=socket.io)](https://socket.io/)

O **Project Metropolys** é um jogo digital de tabuleiro focado em estratégia econômica, negociação, investimento e construção de patrimônio. Os jogadores competem em um ambiente urbano dinâmico para adquirir propriedades, gerenciar recursos, participar de leilões e superar seus adversários por meio de inteligência financeira.

Cada partida se passa em uma cidade específica, que define não apenas o visual do tabuleiro, mas também a economia local, bairros disponíveis, eventos aleatórios e oportunidades estratégicas de investimento.

---

## 🚀 Diferencial Principal: Cidades Modulares

Diferente dos jogos de tabuleiro imobiliários tradicionais, o Metropolys utiliza um **sistema modular de cidades**. Cada cidade funciona como uma expansão independente de conteúdo que altera a dinâmica do jogo:

*   **Propriedades exclusivas** inspiradas em bairros e pontos turísticos reais.
*   **Eventos temáticos** e desastres econômicos próprios de cada localidade.
*   **Comportamento macroeconômico** exclusivo (taxa de juros, inflação e volatilidade).
*   **Identidade visual e trilha sonora** únicas.

### Exemplos de Pacotes de Cidades (City Packs):
*   **América do Sul Pack**: Salvador, São Paulo, Buenos Aires, Montevidéu.
*   **Europa Pack**: Londres, Paris, Roma.
*   **América do Norte Pack**: Nova York, Chicago, Toronto.
*   **Future Pack**: Neo City, Cyberpolis, Atlantis.

---

## 🎲 Mecânicas do Jogo (MVP)

A lógica central do jogo é orientada a turnos e gerida por um motor de regras robusto no backend:

1.  **Inicialização da Partida**: Cada jogador começa com um saldo padrão (ex: \$1.500) e os tokens de todos os jogadores são posicionados na casa de "Início" (*Start*).
2.  **Turno e Movimentação**: Os jogadores lançam dados de 6 lados e seu respectivo token move-se casa a casa pelo tabuleiro (animado de forma fluida pelo motor do Phaser).
3.  **Compra de Propriedades**: Ao cair em uma propriedade sem dono, o jogador pode comprá-la pelo valor de tabela caso possua fundos suficientes.
4.  **Cobrança de Aluguel**: Caso caia em uma propriedade pertencente a outro jogador, o aluguel correspondente é automaticamente deduzido de seu saldo e transferido ao proprietário.
5.  **Negociações e Leilões**: Permite a negociação direta de ativos e dinheiro entre os jogadores ativos, além de leilões dinâmicos de propriedades quando um jogador decide não comprar a propriedade em que caiu.
6.  **Economia Dinâmica & Eventos**: Notícias e eventos gerados alteram multiplicadores de aluguel e valores de bairros inteiros em tempo real.
7.  **Falência**: Se o saldo de um jogador ficar negativo e ele não puder quitar suas dívidas de aluguel ou taxas, suas propriedades retornam ao mercado (sem dono) e o jogador é eliminado.

---

## 🛠️ Arquitetura & Estrutura do Projeto

O projeto é estruturado como um **Monorepo** gerenciado com **NPM Workspaces**:

```
metropolys/
├── apps/
│   ├── web/               # Aplicação Frontend (Vue 3, Vuetify, Phaser)
│   │   ├── src/
│   │   │   ├── components/  # Componentes de interface do dashboard
│   │   │   ├── game/        # Lógica Phaser, mapas de tabuleiro e store
│   │   │   │   ├── board-data.js
│   │   │   │   ├── boardScene.js  # Cena e animações Phaser
│   │   │   │   └── gameStore.js   # Estado do jogo do cliente
│   │   │   └── services/    # Conexão mock do Supabase/Socket.io
│   │   └── package.json
│   │
│   └── api/               # Aplicação Backend (NestJS)
│       ├── src/
│       │   ├── ai/          # Serviços de Inteligência Artificial do jogo
│       │   ├── database/    # Persistência de dados local (Mock Supabase)
│       │   ├── rooms/       # Gerenciamento de salas, WebSocket Gateway e loop principal
│       │   └── main.ts
│       ├── database.json    # Banco de dados em formato JSON local
│       └── package.json
│
├── openspec/              # Especificações e requisitos do jogo (OpenSpec)
├── package.json           # Configurações globais e Scripts do Monorepo
└── RESUMO_CONCEITUAL.md   # Resumo conceitual do ecossistema do jogo
```

---

## 💻 Tecnologias Utilizadas

### Frontend (`apps/web`)
*   **Vue 3 (Composition API)**: Estrutura do painel do jogador, interfaces de configuração e menus.
*   **Vuetify**: Design e componentes visuais modernos, garantindo alta responsividade e visual premium.
*   **Phaser 3**: Motor gráfico de jogos HTML5 para renderizar o tabuleiro em 2D, gerenciar os caminhos e animar as peças dos jogadores.
*   **Socket.io-Client**: Conexão WebSocket em tempo real para sincronização com as salas do backend.

### Backend (`apps/api`)
*   **NestJS**: Framework Node.js progressivo para APIs escaláveis e robustas.
*   **Socket.io (WebSockets)**: Sincronização em tempo real de turnos, posições e eventos.
*   **Banco de Dados Local**: Serviço de persistência local que simula a interface do Supabase via chamadas HTTP REST e WebSocket events, facilitando o desenvolvimento sem dependências externas complexas.

---

## 🏃 Como Rodar o Projeto Localmente

### Pré-requisitos
*   **Node.js** (versão v18 ou superior)
*   **npm** (instalado junto com o Node.js)

### Passo 1: Instalar dependências globais
No diretório raiz do projeto, instale todas as dependências de ambos os workspaces:
```bash
npm install
```

### Passo 2: Executar em Modo de Desenvolvimento

Para rodar o projeto, você deve iniciar o backend e o frontend simultaneamente. No diretório raiz, abra duas abas do terminal e execute:

**Iniciar o Servidor Backend (NestJS - porta `3008`):**
```bash
npm run dev:api
```

**Iniciar o Servidor Frontend (Vue 3 / Vite - porta `5173`):**
```bash
npm run dev:web
```

Abra o navegador no endereço indicado pelo Vite (normalmente [http://localhost:5173](http://localhost:5173)) para acessar o jogo.

---

## 🧪 Testes e Simulações

O backend possui scripts de simulação de ponta a ponta (E2E) para validar a estabilidade das salas e os fluxos de turnos sob condições automatizadas.

Para rodar a simulação E2E automatizada:
```bash
npm run test:e2e
```

Para compilar ambas as aplicações para produção:
```bash
npm run build
```

---

## 📄 Licença

Este projeto é desenvolvido para fins conceituais e pessoais. Licenciado sob a [MIT License](LICENSE).
