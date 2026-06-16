<template>
  <v-container class="fill-height pa-0 match-container position-relative" fluid>
    <!-- Background Canvas (Fullscreen Game Board) -->
    <div class="game-wrapper-fullscreen" v-if="gameStore.gamePhase !== 'LOBBY'">
      <PhaserContainer />
    </div>

    <!-- HUD Top Bar -->
    <header class="hud-header px-4 pt-4 d-flex align-center">
      <div class="hud-header-left d-flex align-center">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="white"
          class="mr-2 hover-scale-btn"
          @click="confirmExit"
        ></v-btn>
        <div class="hud-title-container">
          <span class="hud-title-main glow-text-magenta">METROPOLYS</span>
          <span class="hud-mode-badge font-mono" :class="gameStore.isMultiplayer ? 'online' : 'local'">
            <v-icon size="10" class="mr-1">
              {{ gameStore.isMultiplayer ? 'mdi-earth' : 'mdi-laptop' }}
            </v-icon>
            {{ gameStore.isMultiplayer ? 'MULTIPLAYER ONLINE' : 'HOTSEAT LOCAL' }}
          </span>
        </div>
      </div>
      
      <v-spacer></v-spacer>

      <div class="hud-header-center d-flex align-center gap-2">
        <!-- Active Turn Status -->
        <transition name="fade-slide" mode="out-in">
          <div
            v-if="gameStore.gamePhase === 'PLAYING' && activePlayer"
            class="turn-status-card"
            :style="{ '--active-color': activePlayer.color }"
          >
            <div class="active-pulse-circle"></div>
            <span class="text-uppercase tracking-wider font-weight-bold">
              Turno de: <strong class="active-player-name">{{ activePlayer.name }}</strong>
            </span>
          </div>
        </transition>

        <div
          v-if="gameStore.isMultiplayer && gameStore.roomCode"
          class="hud-room-code-badge font-mono"
        >
          <span class="caption-label">DECK_ID</span>
          <span class="code-value">{{ gameStore.roomCode }}</span>
        </div>
      </div>

      <v-spacer></v-spacer>

      <div class="hud-header-right d-flex align-center">
        <v-btn
          v-if="!gameStore.isMultiplayer"
          color="error"
          variant="tonal"
          size="small"
          prepend-icon="mdi-refresh"
          class="rounded-lg reset-btn"
          @click="confirmReset"
        >
          Reiniciar
        </v-btn>
      </div>
    </header>

    <!-- Main Game Board and Panels Layout (LOBBY Phase) -->
    <div v-if="gameStore.gamePhase === 'LOBBY'" class="lobby-fullscreen-container d-flex align-center justify-center">
      <div class="lobby-hud-card-wrapper pa-8 rounded-xl border-light">
        <div class="radar-pulse-container mb-6">
          <div class="radar-circle ring-1"></div>
          <div class="radar-circle ring-2"></div>
          <div class="radar-circle ring-3"></div>
          <v-icon size="40" color="primary" class="radar-icon">mdi-account-group</v-icon>
        </div>
        
        <h2 class="text-h4 font-weight-black tracking-wider text-uppercase text-white mb-1">Lobby da Partida</h2>
        <p class="text-subtitle-1 text-medium-emphasis text-white mb-6">
          Aguardando conexão dos jogadores...
        </p>
        
        <div class="lobby-code-display mb-6">
          <span class="label text-uppercase">Código de Acesso</span>
          <span class="code-box">{{ gameStore.roomCode }}</span>
        </div>
        
        <div class="players-lobby-list mb-8 w-100 bg-dark-deep rounded-xl pa-4 border border-light">
          <div class="d-flex align-center justify-space-between mb-3 border-b border-light pb-2">
            <span class="text-subtitle-2 font-weight-bold text-white text-uppercase tracking-wider">Jogadores Conectados</span>
            <v-chip size="x-small" color="primary" variant="flat">{{ gameStore.players.length }}/4</v-chip>
          </div>
          <v-list bg-color="transparent" class="pa-0">
            <v-list-item v-for="p in gameStore.players" :key="p.id" class="lobby-player-item rounded-lg mb-2 px-3 py-2 bg-dark-sidebar border border-light">
              <template v-slot:prepend>
                <v-avatar size="8" :color="p.color" class="mr-3"></v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold text-white text-left d-flex align-center">
                {{ p.name }}
                <span v-if="p.isHost" class="lobby-badge host ml-2">HOST</span>
                <span v-if="p.id === gameStore.myPlayerId" class="lobby-badge you ml-2">VOCÊ</span>
              </v-list-item-title>
              <template v-slot:append>
                <span class="lobby-connection-badge" :class="p.isOnline ? 'online' : 'offline'">
                  {{ p.isOnline ? 'Online' : 'Offline' }}
                </span>
              </template>
            </v-list-item>
          </v-list>
        </div>
        
        <div class="lobby-actions-row">
          <v-btn
            v-if="isRoomHost"
            color="success"
            size="large"
            class="px-8 rounded-xl start-match-btn font-weight-black"
            :disabled="gameStore.players.length < 2"
            @click="gameStore.startOnlineMatch()"
          >
            <v-icon start icon="mdi-play"></v-icon>
            Iniciar Partida
          </v-btn>
          <div v-else class="waiting-host-notice pa-3 rounded-lg">
            <v-icon color="warning" class="mr-2 animate-spin-slow">mdi-loading</v-icon>
            <span>Aguardando o anfitrião iniciar a partida...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating, Draggable Panels (PLAYING Phase) -->
    <div v-if="gameStore.gamePhase !== 'LOBBY' && gameStore.gamePhase !== 'SETUP' && gameStore.gamePhase !== 'FINISHED'" class="hud-overlay-container">
      
      <!-- 1. SCOREBOARD CARD -->
      <div 
        class="hud-floating-card draggable-card-scoreboard pointer-events-auto"
        :class="{ 'is-dragging': activeDragCard === 'scoreboard' }"
        :style="{ 
          left: cardPositions.scoreboard.x + 'px', 
          top: cardPositions.scoreboard.y + 'px',
          width: '310px'
        }"
      >
        <div 
          class="card-drag-handle d-flex justify-space-between align-center px-2 py-2 cursor-move"
          @mousedown="startDrag($event, 'scoreboard')"
          @touchstart="startDrag($event, 'scoreboard')"
        >
          <div class="d-flex align-center gap-1.5">
            <v-icon color="primary" size="16">mdi-drag-vertical</v-icon>
            <v-icon color="primary" size="16">mdi-account-multiple</v-icon>
            <span class="text-caption font-weight-black text-uppercase tracking-wider text-white title-font">Scoreboard</span>
          </div>
          <span v-if="gameStore.isMultiplayer" class="hud-online-count font-mono">
            ON: {{ onlinePlayersCount }}/{{ gameStore.players.length }}
          </span>
        </div>
        
        <div class="card-content overflow-y-auto pa-3 flex-grow-1" style="max-height: 380px;">
          <div class="players-list-wrapper">
            <div
              v-for="p in gameStore.players"
              :key="p.id"
              class="player-hud-card"
              :class="{
                'is-active': gameStore.gamePhase === 'PLAYING' && gameStore.getActivePlayer()?.id === p.id && !p.isBankrupt,
                'is-bankrupt': p.isBankrupt
              }"
              :style="{ '--player-theme-color': p.color }"
            >
              <div class="player-hud-card-header d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center gap-2">
                  <div class="player-avatar-ring">
                    <v-avatar size="24" :color="p.color" class="elevation-4">
                      <v-img v-if="p.pin" :src="gameStore.transparentPins[p.pin] || `/pins/${p.pin}.png`" contain></v-img>
                      <span v-else class="text-caption font-weight-black text-white">{{ p.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                  </div>
                  <div class="player-identity">
                    <span class="player-name text-white font-weight-bold">
                      {{ p.name }}
                    </span>
                    <div class="player-tags d-flex align-center gap-1 mt-0.5">
                      <span v-if="p.isBot" class="badge-tag bot">BOT</span>
                      <span v-if="p.id === gameStore.myPlayerId" class="badge-tag you">VOCÊ</span>
                    </div>
                  </div>
                </div>
                
                <div class="player-status-indicator">
                  <span v-if="p.isBankrupt" class="status-pill bankrupt">FALIDO</span>
                  <span v-else-if="gameStore.isBotThinking && gameStore.botThinkingPlayerId === p.id" class="status-pill thinking pulse-glow">PENSANDO...</span>
                  <span v-else-if="gameStore.getActivePlayer()?.id === p.id && gameStore.gamePhase === 'PLAYING'" class="status-pill active-turn pulse-glow">SUA VEZ</span>
                </div>
              </div>

              <div v-if="gameStore.isMultiplayer && !p.isBankrupt" class="connection-status-row mb-2">
                <span class="text-caption d-flex align-center" :class="p.isOnline ? 'text-success' : 'text-error'">
                  <span class="connection-dot" :class="{ 'online': p.isOnline }"></span>
                  {{ p.isOnline ? 'Conectado' : 'Desconectado' }}
                </span>
              </div>

              <div class="wealth-display-box d-flex justify-space-between align-center mb-3">
                <span class="label text-uppercase font-weight-medium">Capital</span>
                <span class="money-value font-weight-black font-mono" :class="p.money < 0 ? 'negative' : 'positive'">
                  ${{ p.money }} M
                </span>
              </div>

              <div class="properties-hud-section">
                <div class="d-flex align-center justify-space-between mb-1.5">
                  <span class="label text-uppercase">Propriedades</span>
                  <span class="count-badge font-mono">{{ p.propertiesOwned?.length || 0 }}</span>
                </div>
                <div class="properties-badges-grid">
                  <span
                    v-for="propId in p.propertiesOwned"
                    :key="propId"
                    class="property-hud-badge font-mono"
                    :style="{ '--prop-color': getPropertyColor(propId) }"
                    v-ripple
                  >
                    <span class="prop-dot" :style="{ backgroundColor: getPropertyColor(propId) }"></span>
                    {{ getPropertyName(propId) }}
                  </span>
                  <span v-if="!p.propertiesOwned || p.propertiesOwned.length === 0" class="empty-properties-text">
                    Nenhum imóvel adquirido
                  </span>
                </div>
              </div>

              <!-- Propor Troca -->
              <v-btn
                v-if="gameStore.isMultiplayer && p.id !== gameStore.myPlayerId && !p.isBankrupt"
                size="small"
                variant="tonal"
                color="primary"
                block
                class="mt-3 trade-action-btn"
                prepend-icon="mdi-handshake"
                @click="openTradeDraft(p)"
              >
                Propor Troca
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. CONTROL PANEL (ACTIONS) CARD -->
      <div 
        class="hud-floating-card draggable-card-control pointer-events-auto"
        :class="{ 'is-dragging': activeDragCard === 'control' }"
        :style="{ 
          left: cardPositions.control.x + 'px', 
          top: cardPositions.control.y + 'px',
          width: '310px'
        }"
      >
        <div 
          class="card-drag-handle d-flex align-center gap-1.5 px-2 py-2 cursor-move"
          @mousedown="startDrag($event, 'control')"
          @touchstart="startDrag($event, 'control')"
        >
          <v-icon color="primary" size="16">mdi-drag-vertical</v-icon>
          <v-icon color="primary" size="16">mdi-controller</v-icon>
          <span class="text-caption font-weight-black text-uppercase tracking-wider text-white title-font">Painel de Ações</span>
        </div>

        <div class="card-content pa-3 flex-grow-1">
          <!-- Economy indicators -->
          <div class="economy-hud-card pa-3 mb-3">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon color="primary" size="14">mdi-chart-line</v-icon>
              <span class="caption-label text-uppercase font-weight-bold">Indicadores da Cidade</span>
            </div>
            <v-row no-gutters>
              <v-col cols="6" class="pr-2">
                <span class="caption-label text-uppercase micro">Ciclo</span>
                <div class="cycle-value-badge mt-1 compact" :class="gameStore.economicCycle.toLowerCase()">
                  <v-icon size="11" class="mr-0.5">
                    {{ gameStore.economicCycle === 'EXPANSION' ? 'mdi-trending-up' : gameStore.economicCycle === 'RECESSION' ? 'mdi-trending-down' : 'mdi-minus' }}
                  </v-icon>
                  {{ gameStore.economicCycle }}
                </div>
              </v-col>
              <v-col cols="6" class="border-l border-light pl-2">
                <span class="caption-label text-uppercase micro">Juros</span>
                <div class="interest-rate-badge mt-1 compact">
                  <v-icon size="11" color="warning" class="mr-0.5">mdi-percent</v-icon>
                  <span>{{ Math.round(gameStore.interestRate * 100) }}% aa</span>
                </div>
              </v-col>
            </v-row>
            <v-divider class="my-2 border-light"></v-divider>
            <div class="event-feed-row">
              <span class="caption-label text-uppercase micro">Evento Ativo</span>
              <div class="d-flex align-center justify-space-between mt-1">
                <span class="event-name-display text-white font-weight-bold text-caption">
                  {{ gameStore.activeEventName || 'Nenhum' }}
                </span>
                <v-chip v-if="gameStore.activeEventModifier !== 1" size="x-small" color="primary" variant="flat" class="font-weight-black px-1 py-0" style="height: 14px; font-size: 8px;">
                  x{{ gameStore.activeEventModifier }}
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Play Actions Panel -->
          <div class="actions-hud-panel pa-3">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon color="primary" size="14">mdi-controller</v-icon>
              <span class="caption-label text-uppercase font-weight-bold">Ações do Turno</span>
            </div>
            <!-- Roll Dice action -->
            <v-btn
              block
              size="comfortable"
              color="primary"
              class="text-white font-weight-black roll-dice-btn glow-effect mb-2"
              :disabled="gameStore.isAnimating || gameStore.showBuyDialog || gameStore.gamePhase !== 'PLAYING' || gameStore.diceResult !== null || !gameStore.isMyTurn()"
              prepend-icon="mdi-dice-5"
              @click="roll"
            >
              Rolar Dados
            </v-btn>

            <!-- Current turn state prompts -->
            <transition name="expand">
              <div class="dice-result-hud-display d-flex align-center justify-center py-1.5 mb-2 font-mono" v-if="gameStore.displayedDiceResult && gameStore.displayedDie1 && gameStore.displayedDie2">
                <span class="caption-label text-uppercase micro mr-2">Dados:</span>
                <div class="dice-cube-icon mr-1">
                  <v-icon size="16" color="white">{{ getDiceIcon(gameStore.displayedDie1) }}</v-icon>
                </div>
                <span class="caption-label font-weight-black mr-2">{{ gameStore.displayedDie1 }}</span>
                <div class="dice-cube-icon mr-1">
                  <v-icon size="16" color="white">{{ getDiceIcon(gameStore.displayedDie2) }}</v-icon>
                </div>
                <span class="caption-label font-weight-black mr-3">{{ gameStore.displayedDie2 }}</span>
                <span class="caption-label text-uppercase micro text-disabled mr-1">Total:</span>
                <span class="dice-digit-value font-weight-black text-caption">{{ gameStore.displayedDiceResult }}</span>
              </div>
            </transition>

            <v-row no-gutters class="gap-2">
              <v-col>
                <v-btn
                  block
                  size="small"
                  color="secondary"
                  variant="outlined"
                  class="text-white font-weight-bold pass-turn-btn"
                  :disabled="gameStore.isAnimating || gameStore.showBuyDialog || gameStore.gamePhase !== 'PLAYING' || gameStore.diceResult === null || !gameStore.isMyTurn()"
                  prepend-icon="mdi-chevron-double-right"
                  @click="end"
                >
                  Passar Vez
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  block
                  size="small"
                  color="warning"
                  variant="tonal"
                  class="text-white font-weight-bold loan-trigger-btn"
                  :disabled="gameStore.isAnimating || gameStore.gamePhase !== 'PLAYING' || !gameStore.isMyTurn()"
                  prepend-icon="mdi-bank"
                  @click="showLoanDialog = true"
                >
                  Empréstimo
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </div>

      <!-- 3. BOLETINS / LOGS CARD -->
      <div 
        class="hud-floating-card draggable-card-logs pointer-events-auto"
        :class="{ 'is-dragging': activeDragCard === 'logs' }"
        :style="{ 
          left: cardPositions.logs.x + 'px', 
          top: cardPositions.logs.y + 'px',
          width: '310px',
          height: '260px'
        }"
      >
        <div 
          class="card-drag-handle d-flex justify-space-between align-center px-2 py-2 cursor-move"
          @mousedown="startDrag($event, 'logs')"
          @touchstart="startDrag($event, 'logs')"
        >
          <div class="d-flex align-center gap-1.5">
            <v-icon color="primary" size="16">mdi-drag-vertical</v-icon>
            <v-icon color="primary" size="16">mdi-text-box-multiple-outline</v-icon>
            <span class="text-caption font-weight-black text-uppercase tracking-wider text-white title-font">Boletins / LOGS</span>
          </div>
          
          <v-btn-toggle
            v-model="infoTab"
            mandatory
            color="primary"
            density="compact"
            class="rounded-lg terminal-tabs-toggle"
          >
            <v-btn value="logs" size="x-small" class="text-white px-2">LOGS</v-btn>
            <v-btn value="news" size="x-small" class="text-white px-2">NOTÍCIAS</v-btn>
          </v-btn-toggle>
        </div>

        <div class="card-content position-relative flex-grow-1 overflow-hidden" style="height: calc(100% - 38px);">
          <transition name="fade" mode="out-in">
            <!-- Logs View -->
            <div v-if="infoTab === 'logs'" class="hud-terminal-log pa-3 overflow-y-auto" key="logs">
              <div
                v-for="(log, idx) in gameStore.logs"
                :key="idx"
                class="log-row mb-1.5 pb-1.5 border-b border-light-subtle d-flex align-start"
              >
                <span class="log-time text-disabled mr-1.5">[{{ log.time }}]</span>
                <span class="log-text flex-grow-1" :style="{ color: log.color || '#E2E8F0' }">{{ log.text }}</span>
              </div>
              <div v-if="gameStore.logs.length === 0" class="text-center text-disabled py-4 text-caption">
                Nenhum log registrado.
              </div>
            </div>

            <!-- AI News / Diário da Metrópole Feed -->
            <div v-else class="hud-terminal-log pa-3 overflow-y-auto" key="news">
              <div
                v-for="entry in gameStore.aiNewsFeed"
                :key="entry.id"
                class="news-hud-card mb-2 pa-2 rounded-lg border border-light"
              >
                <div class="news-hud-header d-flex align-center justify-space-between mb-1">
                  <span class="news-tag text-uppercase font-weight-black" style="font-size: 7px;">
                    <v-icon size="9" class="mr-0.5">mdi-newspaper</v-icon>
                    Boletim Urbano
                  </span>
                  <span class="text-caption text-disabled" style="font-size: 8px;">
                    {{ new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </div>
                <h4 class="text-caption news-headline font-weight-bold text-white mb-0.5">{{ entry.headline }}</h4>
                <p class="news-body mb-0" style="font-size: 9px; line-height: 1.25;">{{ entry.body }}</p>
              </div>
              <div v-if="gameStore.aiNewsFeed.length === 0" class="text-center text-disabled py-4 text-caption">
                Nenhum boletim publicado.
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Dialog: Purchase Property -->
    <v-dialog v-if="isBuyDialogMounted" v-model="gameStore.showBuyDialog" persistent max-width="450" attach="body">
      <v-card v-if="localLandedSlot" class="glass-dialog border border-light py-6 px-4">
        <div class="property-modal-header position-relative overflow-hidden rounded-t-xl py-6 px-4 text-center">
          <!-- Back layer: Vector Illustration specific to each City Pack -->
          <div class="city-banner-background">
            <!-- Salvador Vector -->
            <svg v-if="gameStore.activeCityConfig?.id === 'salvador'" viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="city-vector-banner">
              <circle cx="200" cy="90" r="45" fill="url(#salvador-sun-glow)" opacity="0.25" />
              <circle cx="200" cy="90" r="35" fill="url(#salvador-sun)" />
              <path d="M190 110 L210 110 L206 60 L194 60 Z" fill="#2D1A05" stroke="#F59E0B" stroke-width="2" />
              <rect x="196" y="50" width="8" height="10" fill="#F59E0B" opacity="0.8" />
              <path d="M190 50 L210 50 L200 40 Z" fill="#EF4444" />
              <path d="M200 55 L90 10 L80 30 Z" fill="url(#salvador-light-ray-left)" opacity="0.3" />
              <path d="M200 55 L310 10 L320 30 Z" fill="url(#salvador-light-ray-right)" opacity="0.3" />
              <path d="M70 120 L80 120 L80 50 L70 50 Z" fill="#181003" stroke="#F59E0B" stroke-width="1.5" />
              <path d="M60 60 L90 60 L80 50 L70 50 Z" fill="#F59E0B" opacity="0.5" />
              <path d="M0 120 Q 50 115, 100 120 T 200 120 T 300 120 T 400 120" stroke="#3B82F6" stroke-width="2" fill="none" opacity="0.5"/>
              <path d="M0 128 Q 50 123, 100 128 T 200 128 T 300 128 T 400 128" stroke="#00F0FF" stroke-width="1.5" fill="none" opacity="0.4"/>
              <defs>
                <radialGradient id="salvador-sun-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#F59E0B" />
                  <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
                </radialGradient>
                <linearGradient id="salvador-sun" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#EF4444" />
                  <stop offset="100%" stop-color="#F59E0B" />
                </linearGradient>
                <linearGradient id="salvador-light-ray-left" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="salvador-light-ray-right" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <!-- Sao Paulo Vector -->
            <svg v-else-if="gameStore.activeCityConfig?.id === 'sao-paulo'" viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="city-vector-banner">
              <path d="M0 110 L400 110 M0 125 L400 125" stroke="#10B981" stroke-width="0.5" opacity="0.25" />
              <rect x="50" y="75" width="90" height="35" stroke="#10B981" stroke-width="1.5" fill="#041E15" fill-opacity="0.6" />
              <path d="M40 75 L40 115 M150 75 L150 115 M40 75 L150 75" stroke="#EF4444" stroke-width="3" />
              <path d="M220 120 L220 30 L250 30 L250 120 Z" fill="#041E15" stroke="#10B981" stroke-width="2" />
              <line x1="228" y1="40" x2="242" y2="40" stroke="#3B82F6" stroke-width="1.5" opacity="0.6" />
              <line x1="228" y1="55" x2="242" y2="55" stroke="#3B82F6" stroke-width="1.5" opacity="0.6" />
              <line x1="228" y1="70" x2="242" y2="70" stroke="#10B981" stroke-width="1.5" opacity="0.6" />
              <line x1="228" y1="85" x2="242" y2="85" stroke="#10B981" stroke-width="1.5" opacity="0.6" />
              <path d="M280 120 L280 45 L305 45 L305 120 Z" fill="#041E15" stroke="#3B82F6" stroke-width="1.5" />
              <path d="M320 120 L320 60 L345 45 L345 120 Z" fill="#041E15" stroke="#10B981" stroke-width="1.5" />
              <line x1="235" y1="30" x2="235" y2="10" stroke="#3B82F6" stroke-width="1.5" />
              <circle cx="235" cy="10" r="3" fill="#3B82F6" />
              <path d="M0 115 Q 100 110, 200 115 T 400 115" stroke="#EF4444" stroke-width="2" opacity="0.5" />
              <path d="M0 122 Q 100 125, 200 122 T 400 122" stroke="#F59E0B" stroke-width="1.5" opacity="0.5" />
            </svg>
            <!-- Rio de Janeiro Vector -->
            <svg v-else viewBox="0 0 400 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="city-vector-banner">
              <circle cx="300" cy="45" r="15" fill="#FFF" opacity="0.05" />
              <circle cx="300" cy="45" r="10" fill="#EC4899" opacity="0.6" />
              <path d="M120 120 C 130 90, 160 50, 190 50 C 220 50, 240 85, 250 120 Z" fill="#041424" stroke="#3B82F6" stroke-width="2.5" />
              <path d="M70 120 C 80 100, 100 70, 120 70 C 140 70, 150 95, 160 120 Z" fill="#041424" stroke="#EC4899" stroke-width="2" />
              <line x1="120" y1="70" x2="190" y2="50" stroke="#00F0FF" stroke-width="1" stroke-dasharray="3 3" />
              <rect x="150" y="55" width="8" height="6" rx="1" fill="#00F0FF" stroke="#3B82F6" stroke-width="1" />
              <path d="M40 120 Q 45 95, 30 75" stroke="#10B981" stroke-width="2" />
              <path d="M30 75 Q 15 70, 10 75 M30 75 Q 25 60, 32 63 M30 75 Q 45 65, 48 72" stroke="#10B981" stroke-width="1.5" />
              <path d="M0 115 C 30 110, 50 120, 80 115 C 110 110, 130 120, 160 115 C 190 110, 210 120, 240 115 C 270 110, 290 120, 320 115 C 350 110, 370 120, 400 115" stroke="#3B82F6" stroke-width="2.5" fill="none" opacity="0.6" />
              <path d="M0 123 C 30 118, 50 128, 80 123 C 110 118, 130 128, 160 123 C 190 118, 210 128, 240 123 C 270 118, 290 128, 320 123 C 350 118, 370 128, 400 123" stroke="#EC4899" stroke-width="1.5" fill="none" opacity="0.4" />
            </svg>
          </div>

          <!-- Glassmorphic Overlay for Contrast -->
          <div class="property-modal-header-overlay" :style="{ backgroundColor: localLandedSlot.color + '22' }"></div>

          <!-- Content overlay -->
          <div class="property-modal-header-content position-relative z-1 pa-2">
            <v-icon size="32" color="white" class="mb-1 drop-shadow-icon">mdi-home-city</v-icon>
            <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider glow-title-text">{{ localLandedSlot.name }}</h2>
            <span class="text-caption text-white font-weight-bold opacity-90 text-uppercase tracking-widest block-badge">
              {{ localLandedSlot.neighborhood }}
            </span>
          </div>
        </div>
        
        <v-card-text class="pt-6">
          <div class="stat-grid bg-dark-deep rounded-xl pa-4 border border-light mb-6">
            <v-row no-gutters>
              <v-col cols="6" class="border-r border-light text-center pr-2">
                <span class="caption-label text-uppercase d-block mb-1">Preço de Compra</span>
                <span class="money-stat primary-text font-weight-black">${{ localLandedSlot.cost }} M</span>
              </v-col>
              <v-col cols="6" class="text-center pl-2">
                <span class="caption-label text-uppercase d-block mb-1">Aluguel Base</span>
                <span class="money-stat success-text font-weight-black">
                  ${{ Math.floor(localLandedSlot.rent * gameStore.activeEventModifier) }} M
                </span>
              </v-col>
            </v-row>
          </div>

          <div class="d-flex align-center justify-space-between text-body-1 px-2 mb-2">
            <span class="text-disabled font-weight-medium text-uppercase text-caption">Seu Saldo Atual:</span>
            <span class="font-weight-black text-success" :class="{ 'text-error': myBalance < localLandedSlot.cost }">
              ${{ myBalance }} M
            </span>
          </div>

          <v-alert
            v-if="myBalance < localLandedSlot.cost"
            type="error"
            variant="tonal"
            density="compact"
            class="text-caption rounded-lg mt-2"
          >
            Capital insuficiente para comprar este lote.
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-4 pb-4 pt-0">
          <v-row no-gutters class="gap-3">
            <v-col>
              <v-btn
                block
                size="large"
                color="error"
                variant="outlined"
                class="rounded-xl font-weight-black text-uppercase tracking-wider interactive-btn"
                :disabled="gameStore.isMultiplayer && !gameStore.isMyTurn()"
                @click="declineProperty"
              >
                Declinar
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                block
                size="large"
                color="primary"
                variant="flat"
                class="rounded-xl font-weight-black text-uppercase tracking-wider interactive-btn text-white glow-effect"
                :disabled="!gameStore.canBuyCurrentProperty || (gameStore.isMultiplayer && !gameStore.isMyTurn())"
                @click="gameStore.buyProperty()"
              >
                Comprar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Request Bank Loan (MVP3) -->
    <v-dialog v-model="showLoanDialog" max-width="420" attach="body">
      <v-card class="glass-dialog border border-light py-6 px-4 text-center">
        <v-card-text class="pt-4">
          <div class="loan-icon-wrapper mb-4">
            <div class="loan-pulse-circle"></div>
            <v-icon size="40" color="warning" class="loan-icon">mdi-bank</v-icon>
          </div>
          <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider mb-2">Financiamento Bancário</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Solicite capital emergencial. A taxa de juros atual está em <span class="text-warning font-weight-black">{{ Math.round(gameStore.interestRate * 100) }}%</span> sobre o montante retirado.
          </p>
          
          <v-divider class="my-4 border-light"></v-divider>
          
          <span class="caption-label text-uppercase mb-3 d-block font-weight-bold">Selecione o Valor da Operação</span>
          
          <v-row class="gap-2 justify-center mb-4" no-gutters>
            <v-col v-for="amt in [100, 300, 500]" :key="amt">
              <v-btn
                block
                color="warning"
                variant="outlined"
                class="rounded-xl font-weight-black text-white loan-select-btn"
                @click="requestLoan(amt)"
              >
                +${{ amt }}M
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="error" variant="text" class="font-weight-bold text-uppercase" @click="showLoanDialog = false">Fechar Painel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Realtime Property Auction -->
    <v-dialog :model-value="gameStore.showAuctionDialog" persistent max-width="450" attach="body">
      <v-card v-if="gameStore.activeAuction" class="glass-dialog auction-theme border border-light text-center py-6 px-4">
        <div class="auction-alarm-banner mb-4">
          <v-icon size="36" color="warning" class="mb-1 pulse-glow">mdi-gavel</v-icon>
          <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider">Leilão Judicial</h2>
          <span class="text-caption text-uppercase tracking-wide text-warning font-weight-bold">
            Imóvel {{ gameStore.activeAuction.slotId }} - {{ getPropertyName(gameStore.activeAuction.slotId) }}
          </span>
        </div>
        
        <v-card-text class="pt-0">
          <v-divider class="my-3 border-light"></v-divider>
          
          <div class="d-flex justify-space-between align-center mb-2.5 px-2">
            <span class="caption-label text-uppercase">Lance Atual</span>
            <span class="text-h5 font-weight-black text-success">${{ gameStore.activeAuction.highestBid }} M</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-4 px-2">
            <span class="caption-label text-uppercase">Maior Licitante</span>
            <span class="text-subtitle-2 text-white font-weight-bold">
              {{ getPlayerName(gameStore.activeAuction.highestBidderId) || 'Nenhum' }}
            </span>
          </div>
          
          <!-- Large dramatic countdown timer -->
          <div class="auction-timer-container py-3 rounded-xl mb-6">
            <div class="d-flex flex-column align-center justify-center">
              <span class="caption-label text-uppercase text-disabled mb-0.5">Tempo Restante (Sniper Protection)</span>
              <span class="timer-countdown font-weight-black" :class="auctionTimeRemaining < 10 ? 'text-error animate-pulse-fast' : 'text-warning'">
                {{ auctionTimeRemaining }}s
              </span>
            </div>
          </div>

          <div class="d-flex justify-space-between align-center text-body-2 text-white px-2 mb-4">
            <span class="text-disabled font-weight-medium text-uppercase text-caption">Seu Saldo:</span>
            <span class="font-weight-black text-success">${{ myBalance }} M</span>
          </div>

          <!-- Quick Bid increment buttons -->
          <span class="caption-label text-uppercase font-weight-bold d-block mb-3">Cobrir Oferta</span>
          <div class="d-flex gap-2 justify-center mb-2">
            <v-btn
              color="success"
              variant="flat"
              size="small"
              class="mx-1 bid-action-btn font-weight-black text-white"
              :disabled="myBalance <= gameStore.activeAuction.highestBid + 10"
              @click="placeBid(gameStore.activeAuction.highestBid + 10)"
            >
              +10M
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              size="small"
              class="mx-1 bid-action-btn font-weight-black text-white"
              :disabled="myBalance <= gameStore.activeAuction.highestBid + 50"
              @click="placeBid(gameStore.activeAuction.highestBid + 50)"
            >
              +50M
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              size="small"
              class="mx-1 bid-action-btn font-weight-black text-white"
              :disabled="myBalance <= gameStore.activeAuction.highestBid + 100"
              @click="placeBid(gameStore.activeAuction.highestBid + 100)"
            >
              +100M
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog: Draft Bilateral Trade Offer -->
    <v-dialog v-model="showTradeDraftDialog" max-width="500" attach="body">
      <v-card v-if="draftTradeTargetPlayer" class="glass-dialog border border-light py-6 px-4">
        <div class="property-modal-header mb-4" style="background-color: #6366F1;">
          <v-icon size="36" color="white" class="mb-2">mdi-handshake</v-icon>
          <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider">Propor Negócio</h2>
          <span class="text-caption text-white opacity-80 text-uppercase tracking-wide">
            Acordo comercial com {{ draftTradeTargetPlayer.name }}
          </span>
        </div>
        
        <v-card-text class="pt-2">
          <v-text-field
            v-model.number="draftOfferCash"
            label="Oferecer Saldo em Dinheiro (M)"
            type="number"
            variant="outlined"
            density="comfortable"
            color="primary"
            class="text-white mb-4 custom-text-field"
            prepend-inner-icon="mdi-cash-multiple"
          ></v-text-field>

          <div class="trade-assets-box mb-4">
            <span class="caption-label text-uppercase text-white font-weight-bold mb-2 d-block">Suas Propriedades Oferecidas:</span>
            <div class="d-flex flex-column gap-1 max-h-150 overflow-y-auto pa-2 bg-dark-deep rounded-lg border border-light">
              <v-checkbox
                v-for="propId in myProperties"
                :key="propId"
                v-model="draftOfferProperties"
                :value="propId"
                :label="getPropertyName(propId)"
                hide-details
                density="compact"
                class="text-white custom-checkbox"
              ></v-checkbox>
              <span v-if="myProperties.length === 0" class="empty-text italic">Nenhuma propriedade sua disponível</span>
            </div>
          </div>

          <div class="trade-assets-box">
            <span class="caption-label text-uppercase text-white font-weight-bold mb-2 d-block">Propriedades do Oponente Solicitadas:</span>
            <div class="d-flex flex-column gap-1 max-h-150 overflow-y-auto pa-2 bg-dark-deep rounded-lg border border-light">
              <v-checkbox
                v-for="propId in draftTradeTargetPlayer.propertiesOwned"
                :key="propId"
                v-model="draftRequestProperties"
                :value="propId"
                :label="getPropertyName(propId)"
                hide-details
                density="compact"
                class="text-white custom-checkbox"
              ></v-checkbox>
              <span v-if="!draftTradeTargetPlayer.propertiesOwned || draftTradeTargetPlayer.propertiesOwned.length === 0" class="empty-text italic">O oponente não possui propriedades</span>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="mt-4 px-4">
          <v-btn color="error" variant="text" class="font-weight-bold text-uppercase" @click="showTradeDraftDialog = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" class="text-white px-6 rounded-xl font-weight-black text-uppercase tracking-wide glow-effect" @click="submitTradeOffer">
            Enviar Proposta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Incoming Bilateral Trade Offer (MVP3) -->
    <v-dialog :model-value="gameStore.showIncomingTradeDialog" persistent max-width="500" attach="body">
      <v-card v-if="gameStore.incomingTradeProposal" class="glass-dialog border border-light py-6 px-4">
        <div class="property-modal-header mb-4 bg-success">
          <v-icon size="36" color="white" class="mb-2 pulse-glow">mdi-handshake-deal</v-icon>
          <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider">Negócio Recebido!</h2>
          <span class="text-caption text-white opacity-80 text-uppercase tracking-wide">
            Proposta de {{ getPlayerName(gameStore.incomingTradeProposal.senderId) }}
          </span>
        </div>
        
        <v-card-text class="pt-2 text-white">
          <p class="text-body-2 mb-4 text-center">
            O jogador <span class="font-weight-bold text-primary">{{ getPlayerName(gameStore.incomingTradeProposal.senderId) }}</span> formalizou um acordo:
          </p>
          
          <div class="pa-4 bg-dark-deep rounded-xl border border-light mb-4 trade-item-hud-panel">
            <div class="font-weight-black text-success text-uppercase text-caption mb-2">Eles Oferecem:</div>
            <p class="text-body-2 mb-2 font-weight-bold">Transferência de Capital: ${{ gameStore.incomingTradeProposal.offerCash }} M</p>
            <div class="text-body-2 d-flex flex-wrap gap-1 align-center">
              <span class="mr-1">Propriedades:</span> 
              <span v-for="propId in gameStore.incomingTradeProposal.offerProperties" :key="propId" class="property-hud-badge inline d-inline-block">
                {{ getPropertyName(propId) }}
              </span>
              <span v-if="!gameStore.incomingTradeProposal.offerProperties || gameStore.incomingTradeProposal.offerProperties.length === 0" class="italic text-disabled text-caption">Nenhuma</span>
            </div>
          </div>

          <div class="pa-4 bg-dark-deep rounded-xl border border-light trade-item-hud-panel">
            <div class="font-weight-black text-error text-uppercase text-caption mb-2">Eles Requerem de Você:</div>
            <div class="text-body-2 d-flex flex-wrap gap-1 align-center">
              <span class="mr-1">Propriedades:</span>
              <span v-for="propId in gameStore.incomingTradeProposal.requestProperties" :key="propId" class="property-hud-badge inline d-inline-block">
                {{ getPropertyName(propId) }}
              </span>
              <span v-if="!gameStore.incomingTradeProposal.requestProperties || gameStore.incomingTradeProposal.requestProperties.length === 0" class="italic text-disabled text-caption">Nenhuma</span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="mt-4 px-4">
          <v-btn color="error" variant="outlined" class="rounded-xl font-weight-bold" @click="resolveTrade('DECLINED')">Recusar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" variant="flat" class="text-white px-6 rounded-xl font-weight-black glow-effect pulse-glow" @click="resolveTrade('ACCEPTED')">
            Aceitar Acordo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Game Over / Victory Screen -->
    <v-dialog :model-value="gameStore.gamePhase === 'FINISHED'" persistent max-width="500" attach="body">
      <v-card class="glass-dialog victory-theme border border-light py-8 px-6 text-center">
        <v-card-text class="pt-4">
          <div class="victory-crown-wrapper mb-4">
            <div class="victory-light-ray"></div>
            <v-icon size="80" color="warning" class="victory-icon animate-bounce">mdi-trophy-outline</v-icon>
          </div>
          <h1 class="logo-text text-h3 font-weight-black text-gradient text-uppercase tracking-widest mb-1">
            Fim de Jogo!
          </h1>
          <p class="text-subtitle-1 text-disabled text-uppercase tracking-wider mb-6">
            O império imobiliário foi consolidado
          </p>

          <div class="winner-hud-card pa-6 rounded-2xl mb-8" :style="{ '--winner-color': gameStore.winner ? gameStore.winner.color : '#6366F1' }">
            <v-avatar size="72" :color="gameStore.winner ? gameStore.winner.color : 'primary'" class="mb-3 elevation-8 winner-avatar">
              <v-img v-if="gameStore.winner && gameStore.winner.pin" :src="gameStore.transparentPins[gameStore.winner.pin] || `/pins/${gameStore.winner.pin}.png`" contain></v-img>
              <span v-else class="text-h5 font-weight-black text-white">
                {{ gameStore.winner ? gameStore.winner.name.charAt(0).toUpperCase() : '?' }}
              </span>
            </v-avatar>
            <h2 class="text-h4 font-weight-black text-white mb-2">{{ gameStore.winner ? gameStore.winner.name : 'Ninguém' }}</h2>
            <div class="winner-wealth-summary py-2 px-4 bg-dark-deep rounded-xl d-inline-block">
              <span class="caption-label text-uppercase d-block text-disabled mb-0.5">Patrimônio Líquido Final</span>
              <span class="text-h5 font-weight-black text-success">
                ${{ gameStore.winner ? gameStore.winner.money : 0 }} M
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn
            size="x-large"
            color="primary"
            variant="flat"
            class="px-8 rounded-xl font-weight-black text-uppercase tracking-wider glow-effect text-white return-menu-btn"
            @click="$emit('navigate', 'HOME')"
          >
            Retornar ao Menu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog: Custom Confirmation (confirm override) -->
    <v-dialog v-model="confirmDialog.show" persistent max-width="420" attach="body">
      <v-card class="glass-dialog border border-light py-6 px-4 text-center">
        <v-card-text class="pt-4">
          <div class="confirm-icon-wrapper mb-4">
            <div class="confirm-pulse-circle" :class="confirmDialog.pulseClass"></div>
            <v-icon size="40" :color="confirmDialog.confirmColor" class="confirm-icon">
              {{ confirmDialog.icon }}
            </v-icon>
          </div>
          <h2 class="text-h5 font-weight-black text-white text-uppercase tracking-wider mb-2">
            {{ confirmDialog.title }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-6">
            {{ confirmDialog.message }}
          </p>
        </v-card-text>
        <v-card-actions class="px-4 pb-2">
          <v-row no-gutters class="gap-3">
            <v-col>
              <v-btn
                block
                size="large"
                variant="outlined"
                color="secondary"
                class="rounded-xl font-weight-black text-uppercase tracking-wider interactive-btn text-white"
                @click="confirmDialog.onCancel"
              >
                Cancelar
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                block
                size="large"
                variant="flat"
                :color="confirmDialog.confirmColor"
                class="rounded-xl font-weight-black text-uppercase tracking-wider interactive-btn text-white glow-effect"
                @click="confirmDialog.onConfirm"
              >
                {{ confirmDialog.confirmText }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { gameStore } from '../game/gameStore';
import PhaserContainer from './PhaserContainer.vue';

const emit = defineEmits(['navigate']);
const infoTab = ref('logs');

// Dialog Purchase Property lifecycle helper to ensure perfect centering on first mount
const isBuyDialogMounted = ref(false);
const localLandedSlot = ref(null);
watch(() => gameStore.showBuyDialog, (val) => {
  if (val) {
    localLandedSlot.value = gameStore.landedSlot;
    isBuyDialogMounted.value = true;
  } else {
    // Keep it mounted for 300ms to allow the closing transition to finish
    setTimeout(() => {
      isBuyDialogMounted.value = false;
      localLandedSlot.value = null;
    }, 300);
  }
});

// --- CUSTOM CONFIRMATION DIALOG STATE ---
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  confirmColor: 'primary',
  icon: 'mdi-alert-circle-outline',
  pulseClass: 'primary-pulse',
  onConfirm: () => {},
  onCancel: () => {}
});

const showConfirm = (options) => {
  return new Promise((resolve) => {
    let pulseClass = 'primary-pulse';
    if (options.confirmColor === 'error') {
      pulseClass = 'error-pulse';
    } else if (options.confirmColor === 'warning') {
      pulseClass = 'warning-pulse';
    }
    
    confirmDialog.value = {
      show: true,
      title: options.title || 'Confirmação',
      message: options.message || '',
      confirmText: options.confirmText || 'Confirmar',
      confirmColor: options.confirmColor || 'primary',
      icon: options.icon || 'mdi-alert-circle-outline',
      pulseClass,
      onConfirm: () => {
        confirmDialog.value.show = false;
        resolve(true);
      },
      onCancel: () => {
        confirmDialog.value.show = false;
        resolve(false);
      }
    };
  });
};

const activePlayer = computed(() => gameStore.getActivePlayer());

// Computes current player balance in multiplayer/local
const myBalance = computed(() => {
  if (gameStore.isMultiplayer) {
    const me = gameStore.players.find(p => p.id === gameStore.myPlayerId);
    return me ? me.money : 0;
  } else {
    return activePlayer.value ? activePlayer.value.money : 0;
  }
});

const myProperties = computed(() => {
  const me = gameStore.players.find(p => p.id === gameStore.myPlayerId);
  return me ? me.propertiesOwned || [] : [];
});

const onlinePlayersCount = computed(() => {
  return gameStore.players.filter(p => p.isOnline).length;
});

const isRoomHost = computed(() => {
  const me = gameStore.players.find(p => p.id === gameStore.myPlayerId);
  return me ? me.isHost : false;
});

// Cycles color codes helper
const getCycleColor = (cycle) => {
  if (cycle === 'EXPANSION') return 'text-success';
  if (cycle === 'RECESSION') return 'text-error';
  return 'text-primary';
};

const getDiceIcon = (val) => {
  return `mdi-dice-${val}`;
};

const getPropertyColor = (propId) => {
  const slot = gameStore.boardSlots.find(s => s.id === propId);
  return slot ? slot.color : '#FFFFFF';
};

const getPropertyName = (propId) => {
  const slot = gameStore.boardSlots.find(s => s.id === propId);
  return slot ? slot.name : '';
};

const getPlayerName = (id) => {
  const p = gameStore.players.find(x => x.id === id);
  return p ? p.name : '';
};

// Actions triggers
const roll = async () => {
  const details = await gameStore.rollDice();
  // If local, we trigger the roll animation manually
  if (details && !gameStore.isMultiplayer) {
    window.dispatchEvent(new CustomEvent('phaser-roll-dice', { detail: details }));
  }
};

const end = () => {
  gameStore.endTurn();
};

const confirmExit = async () => {
  const confirmed = await showConfirm({
    title: 'Sair da Partida',
    message: 'Deseja realmente voltar ao menu? Todo o progresso da partida será perdido.',
    confirmText: 'Voltar ao Menu',
    confirmColor: 'error',
    icon: 'mdi-logout'
  });
  if (confirmed) {
    emit('navigate', 'HOME');
  }
};

const confirmReset = async () => {
  const confirmed = await showConfirm({
    title: 'Reiniciar Partida',
    message: 'Deseja reiniciar a partida atual? Todo o progresso da rodada ativa será perdido.',
    confirmText: 'Reiniciar',
    confirmColor: 'warning',
    icon: 'mdi-refresh'
  });
  if (confirmed) {
    const rawPlayers = gameStore.players.map(p => ({ name: p.name, color: p.color }));
    gameStore.initializeGame(rawPlayers);
    window.dispatchEvent(new CustomEvent('phaser-reset-board'));
  }
};

// --- DYNAMIC ECONOMY LOGIC (MVP 3) ---
const showLoanDialog = ref(false);
const API_URL = 'http://localhost:3008';

const requestLoan = async (amount) => {
  await gameStore.takeBankLoan(amount);
  showLoanDialog.value = false;
};

const declineProperty = async () => {
  if (gameStore.isMultiplayer) {
    if (gameStore.landedSlot) {
      await fetch(`${API_URL}/api/rooms/${gameStore.roomCode}/auctions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: gameStore.landedSlot.id }),
      });
    }
  }
  gameStore.closeBuyDialog();
};

// --- AUCTIONS COUNTDOWN TIMER ---
const auctionTimeRemaining = ref(0);
let auctionTimerInterval = null;

watch(() => gameStore.showAuctionDialog, (val) => {
  if (val) {
    if (auctionTimerInterval) clearInterval(auctionTimerInterval);
    const updateTimer = () => {
      if (!gameStore.activeAuction) {
        auctionTimeRemaining.value = 0;
        return;
      }
      const endsAt = new Date(gameStore.activeAuction.endsAt).getTime();
      const diff = endsAt - Date.now();
      auctionTimeRemaining.value = Math.max(0, Math.floor(diff / 1000));
    };
    updateTimer();
    auctionTimerInterval = setInterval(updateTimer, 500);
  } else {
    if (auctionTimerInterval) {
      clearInterval(auctionTimerInterval);
      auctionTimerInterval = null;
    }
  }
});

const placeBid = async (amount) => {
  if (!gameStore.activeAuction) return;
  try {
    const res = await fetch(`${API_URL}/api/rooms/${gameStore.roomCode}/auctions/${gameStore.activeAuction.id}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: gameStore.myPlayerId,
        bidAmount: amount,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Lance inválido.");
    }
  } catch (e) {
    console.error(e);
  }
};

// --- BILATERAL TRADING MODAL ---
const showTradeDraftDialog = ref(false);
const draftTradeTargetPlayer = ref(null);
const draftOfferCash = ref(0);
const draftOfferProperties = ref([]);
const draftRequestProperties = ref([]);

const openTradeDraft = (targetPlayer) => {
  draftTradeTargetPlayer.value = targetPlayer;
  draftOfferCash.value = 0;
  draftOfferProperties.value = [];
  draftRequestProperties.value = [];
  showTradeDraftDialog.value = true;
};

const submitTradeOffer = async () => {
  if (!draftTradeTargetPlayer.value) return;
  try {
    const res = await fetch(`${API_URL}/api/rooms/${gameStore.roomCode}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: gameStore.myPlayerId,
        receiverId: draftTradeTargetPlayer.value.id,
        offerCash: Number(draftOfferCash.value),
        offerProperties: draftOfferProperties.value,
        requestProperties: draftRequestProperties.value,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Erro ao propor troca.");
    } else {
      showTradeDraftDialog.value = false;
      alert("Proposta de troca enviada!");
    }
  } catch (e) {
    console.error(e);
  }
};

const resolveTrade = async (status) => {
  if (!gameStore.incomingTradeProposal) return;
  try {
    const res = await fetch(`${API_URL}/api/rooms/${gameStore.roomCode}/trades/${gameStore.incomingTradeProposal.id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution: status }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Erro ao responder negociação.");
    }
  } catch (e) {
    console.error(e);
  }
};

// --- CARD DRAGGING LOGIC ---
const cardPositions = ref({
  scoreboard: { x: 20, y: 80 },
  control: { x: 0, y: 80 },
  logs: { x: 0, y: 360 }
});

const activeDragCard = ref(null);
let dragStartOffset = { x: 0, y: 0 };

const startDrag = (event, cardId) => {
  if (
    event.target.closest('button') || 
    event.target.closest('.v-btn') || 
    event.target.closest('.v-btn-toggle') ||
    event.target.closest('.v-input') ||
    event.target.closest('.v-checkbox')
  ) {
    return;
  }
  
  activeDragCard.value = cardId;
  const isTouch = event.type.startsWith('touch');
  const clientX = isTouch ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch ? event.touches[0].clientY : event.clientY;
  
  dragStartOffset = {
    x: clientX - cardPositions.value[cardId].x,
    y: clientY - cardPositions.value[cardId].y
  };
  
  const moveHandler = (e) => handleDrag(e);
  const upHandler = () => {
    activeDragCard.value = null;
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', upHandler);
  };
  
  document.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler, { passive: false });
  document.addEventListener(isTouch ? 'touchend' : 'mouseup', upHandler);
};

const handleDrag = (event) => {
  if (!activeDragCard.value) return;
  
  const isTouch = event.type.startsWith('touch');
  const clientX = isTouch ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch ? event.touches[0].clientY : event.clientY;
  
  let newX = clientX - dragStartOffset.x;
  let newY = clientY - dragStartOffset.y;
  
  const headerHeight = 48; // compact top bar
  const padding = 10;
  
  const cardId = activeDragCard.value;
  const cardEl = document.querySelector(`.draggable-card-${cardId}`);
  const cardWidth = cardEl ? cardEl.offsetWidth : 310;
  const cardHeight = cardEl ? cardEl.offsetHeight : 300;
  
  const minX = padding;
  const maxX = window.innerWidth - cardWidth - padding;
  const minY = headerHeight + padding;
  const maxY = window.innerHeight - cardHeight - padding;
  
  newX = Math.max(minX, Math.min(maxX, newX));
  newY = Math.max(minY, Math.min(maxY, newY));
  
  cardPositions.value[cardId].x = newX;
  cardPositions.value[cardId].y = newY;
  
  if (event.cancelable) event.preventDefault();
};

const clampAllPositions = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const padding = 10;
  const headerHeight = 48;
  
  ['scoreboard', 'control', 'logs'].forEach(cardId => {
    const cardEl = document.querySelector(`.draggable-card-${cardId}`);
    const cardWidth = cardEl ? cardEl.offsetWidth : 310;
    const cardHeight = cardEl ? cardEl.offsetHeight : 300;
    
    let x = cardPositions.value[cardId].x;
    let y = cardPositions.value[cardId].y;
    
    x = Math.max(padding, Math.min(width - cardWidth - padding, x));
    y = Math.max(headerHeight + padding, Math.min(height - cardHeight - padding, y));
    
    cardPositions.value[cardId].x = x;
    cardPositions.value[cardId].y = y;
  });
};

const initializePositions = () => {
  const width = window.innerWidth;
  const cardWidth = 310;
  const padding = 20;
  
  cardPositions.value.scoreboard.x = padding;
  cardPositions.value.scoreboard.y = 80;
  
  cardPositions.value.control.x = width - cardWidth - padding;
  cardPositions.value.control.y = 80;
  
  cardPositions.value.logs.x = width - cardWidth - padding;
  cardPositions.value.logs.y = 360;
  
  clampAllPositions();
};

const handleResize = () => {
  clampAllPositions();
};

onMounted(() => {
  initializePositions();
  window.addEventListener('resize', handleResize);
  setTimeout(clampAllPositions, 100);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  gameStore.reset();
});
</script>

<style scoped>
.match-container {
  background-color: var(--cyber-bg);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 1. Full-screen Board wrapper */
.game-wrapper-fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lobby-fullscreen-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: rgba(5, 5, 12, 0.85);
  backdrop-filter: blur(12px);
}

/* 2. HUD Overlay Container and Floating Cards */
.hud-overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none; /* Mouse inputs fall through empty spacing to board slots */
}

.hud-floating-card {
  position: absolute;
  background: rgba(13, 10, 24, 0.92) !important;
  border: 1px solid var(--neon-cyan) !important;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  z-index: 11;
  overflow: hidden;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}

.hud-floating-card.is-dragging {
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.45), inset 0 0 15px rgba(0, 240, 255, 0.25) !important;
  border-color: var(--neon-cyan) !important;
  z-index: 100 !important; /* bring dragged card to front */
}

.card-drag-handle {
  background: rgba(16, 22, 37, 0.8);
  border-bottom: 2px solid var(--neon-cyan);
  user-select: none;
  touch-action: none;
  font-family: 'Orbitron', sans-serif !important;
}

.title-font {
  font-family: 'Orbitron', sans-serif !important;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace !important;
}

.cursor-move {
  cursor: move;
}

.card-content {
  overflow-y: auto;
}

.pointer-events-auto {
  pointer-events: auto !important; /* Re-enable clicks inside floating cards */
}

/* Scrollbar adjustment for compact cards */
.card-content::-webkit-scrollbar {
  width: 4px;
}
.card-content::-webkit-scrollbar-thumb {
  background: var(--neon-cyan);
  box-shadow: 0 0 3px var(--neon-cyan);
}

/* 3. HUD Header Styles */
.hud-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: transparent !important;
  backdrop-filter: none;
  border-bottom: none;
  z-index: 15;
  pointer-events: none; /* allow clicks on slots behind empty space */
}

.hud-header-left, .hud-header-center, .hud-header-right {
  pointer-events: auto; /* allow buttons to be clicked */
}

.hud-title-container {
  display: flex;
  flex-direction: column;
  background: rgba(13, 10, 24, 0.85);
  border: 1px solid var(--neon-magenta);
  box-shadow: 0 0 10px rgba(255, 0, 127, 0.2);
  padding: 4px 12px;
  border-radius: 6px;
}

.hud-title-main {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: var(--neon-magenta);
  text-shadow: 0 0 10px rgba(255, 0, 127, 0.5);
  line-height: 1.1;
}

.hud-header-left :deep(.v-btn) {
  background: rgba(13, 10, 24, 0.8) !important;
  border: 1px solid var(--neon-cyan) !important;
  height: 36px !important;
  width: 36px !important;
}

.hud-header-right .reset-btn {
  background: rgba(13, 10, 24, 0.8) !important;
  border: 1px solid var(--neon-red) !important;
  color: var(--neon-red) !important;
  box-shadow: 0 0 8px rgba(255, 0, 60, 0.2) !important;
}

.turn-status-card {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  background: rgba(13, 10, 24, 0.9);
  border: 1px solid var(--active-color, var(--neon-cyan));
  border-radius: 6px;
  box-shadow: 0 0 12px var(--active-color, var(--neon-cyan));
  color: #FFFFFF;
  font-size: 11px;
  gap: 8px;
}

.active-pulse-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--active-color, var(--neon-cyan));
  box-shadow: 0 0 8px var(--active-color, var(--neon-cyan));
  animation: pulse-ring 1.5s infinite;
}

.active-player-name {
  font-family: 'Orbitron', sans-serif !important;
  color: var(--active-color, var(--neon-cyan));
}

.hud-room-code-badge {
  display: flex;
  align-items: center;
  background: rgba(13, 10, 24, 0.9);
  border: 1px solid var(--neon-magenta);
  border-radius: 6px;
  padding: 4px 12px;
  box-shadow: 0 0 8px rgba(255, 0, 127, 0.2);
}

.hud-room-code-badge .caption-label {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 6px;
}

.hud-room-code-badge .code-value {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 14px;
  font-weight: 900;
  color: var(--neon-magenta);
  letter-spacing: 0.05em;
}

.reset-btn {
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 800 !important;
  border-radius: 6px !important;
  font-size: 12px !important;
}

/* 4. Sidebars Scoreboard and telemetry */
.sidebar-section-header {
  border-bottom: 2px solid var(--neon-cyan);
  padding-bottom: 6px;
  margin-bottom: 10px;
}

.hud-online-count {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  font-weight: 950;
  background: rgba(0, 240, 255, 0.15);
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  padding: 1px 4px;
  border-radius: 3px;
}

.players-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.player-hud-card {
  background: rgba(5, 5, 12, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 8px;
  padding: 10px;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}

.player-hud-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--player-theme-color);
  opacity: 0.5;
}

.player-hud-card.is-active {
  background: rgba(0, 240, 255, 0.04);
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
}

.player-hud-card.is-active::before {
  opacity: 1;
  width: 4px;
  box-shadow: 0 0 8px var(--player-theme-color);
}

.player-hud-card.is-bankrupt {
  opacity: 0.35;
  filter: grayscale(90%);
}

.player-avatar-ring {
  border: 1.5px solid var(--player-theme-color);
  border-radius: 50%;
  padding: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-identity {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.badge-tag {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 7.5px;
  font-weight: 900;
  padding: 0px 3px;
  border-radius: 3px;
}

.badge-tag.bot {
  background: rgba(255, 108, 0, 0.15);
  color: var(--neon-orange);
  border: 1px solid var(--neon-orange);
}

.badge-tag.you {
  background: rgba(0, 240, 255, 0.15);
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
}

.status-pill {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 7.5px;
  font-weight: 900;
  padding: 1.5px 5px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.status-pill.bankrupt {
  background: rgba(255, 0, 60, 0.15);
  color: var(--neon-red);
  border: 1px solid var(--neon-red);
}

.status-pill.thinking {
  background: rgba(255, 108, 0, 0.2);
  color: var(--neon-orange);
  border: 1px solid var(--neon-orange);
}

.status-pill.active-turn {
  background: var(--player-theme-color);
  color: #000000;
  font-weight: 950;
}

.connection-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--neon-red);
  display: inline-block;
  margin-right: 4px;
}

.connection-dot.online {
  background-color: var(--neon-green);
  box-shadow: 0 0 5px var(--neon-green);
}

.wealth-display-box {
  background: #05050c;
  border-radius: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.caption-label {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
}

.caption-label.micro {
  font-size: 8px;
}

.wealth-display-box .label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.wealth-display-box .money-value {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 15px;
  letter-spacing: 0.02em;
}

.wealth-display-box .money-value.positive {
  color: var(--neon-green);
  text-shadow: 0 0 6px rgba(57, 255, 20, 0.3);
}

.wealth-display-box .money-value.negative {
  color: var(--neon-red);
  text-shadow: 0 0 6px rgba(255, 0, 60, 0.3);
}

.properties-hud-section .label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.properties-hud-section .count-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  font-weight: 900;
  background: rgba(0, 240, 255, 0.15);
  border: 1px solid var(--neon-cyan);
  padding: 0px 4px;
  border-radius: 4px;
  color: var(--neon-cyan);
}

.properties-badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.property-hud-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-left: 2.5px solid var(--prop-color, #FFF);
  border-radius: 4px;
  padding: 1.5px 5px;
  color: #E2E8F0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.property-hud-badge.inline {
  margin: 1.5px;
}

.prop-dot {
  width: 3.5px;
  height: 3.5px;
  border-radius: 50%;
}

.empty-properties-text {
  font-size: 9px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.2);
  margin-top: 2px;
}

.trade-action-btn {
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 800 !important;
  border-radius: 6px !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
  font-size: 9px !important;
  border: 1px solid var(--neon-cyan) !important;
  background: rgba(0, 240, 255, 0.05) !important;
  color: var(--neon-cyan) !important;
}

.trade-action-btn:hover {
  background: var(--neon-cyan) !important;
  color: #000000 !important;
  box-shadow: 0 0 10px var(--neon-cyan) !important;
}

/* 5. Lobby Layout */
.lobby-hud-card-wrapper {
  background: rgba(13, 10, 24, 0.95);
  border: 2px solid var(--neon-cyan);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.2), inset 0 0 15px rgba(0, 240, 255, 0.1);
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
  z-index: 12;
}

.radar-pulse-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.04);
  border: 1px solid rgba(0, 240, 255, 0.15);
  animation: radar-expand 3s infinite linear;
}

.lobby-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #05050c;
  border-radius: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(0, 240, 255, 0.1);
}

.lobby-code-display .code-box {
  font-size: 24px;
  font-weight: 950;
  letter-spacing: 0.1em;
  color: var(--neon-magenta);
  text-shadow: 0 0 15px rgba(255, 0, 127, 0.4);
  font-family: 'Share Tech Mono', monospace;
  margin-top: 4px;
}

.lobby-player-item {
  background: rgba(5, 5, 12, 0.6) !important;
  border: 1px solid rgba(0, 240, 255, 0.1) !important;
}

.lobby-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 3px;
}

.lobby-badge.host {
  background: rgba(255, 108, 0, 0.15);
  color: var(--neon-orange);
  border: 1px solid var(--neon-orange);
}

.lobby-badge.you {
  background: rgba(0, 240, 255, 0.15);
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
}

.lobby-connection-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 9px;
  font-weight: 800;
}

.lobby-connection-badge.online {
  color: var(--neon-green);
}

.lobby-connection-badge.offline {
  color: var(--neon-red);
}

.start-match-btn {
  font-family: 'Orbitron', sans-serif !important;
  background-color: var(--neon-green) !important;
  color: #000000 !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.4) !important;
}

.start-match-btn:hover:not(:disabled) {
  box-shadow: 0 0 25px rgba(57, 255, 20, 0.8) !important;
}

.waiting-host-notice {
  background: rgba(255, 108, 0, 0.1);
  border: 1px solid rgba(255, 108, 0, 0.2);
  color: var(--neon-orange);
  font-size: 12px;
  font-weight: 800;
}

/* 6. Right Column Elements */
.economy-hud-card {
  background: rgba(5, 5, 12, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 8px;
}

.cycle-value-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.05em;
  padding: 3px 6px;
  border-radius: 4px;
}

.cycle-value-badge.expansion {
  background: rgba(57, 255, 20, 0.1);
  color: var(--neon-green);
  border: 1px solid var(--neon-green);
}

.cycle-value-badge.recession {
  background: rgba(255, 0, 60, 0.1);
  color: var(--neon-red);
  border: 1px solid var(--neon-red);
}

.interest-rate-badge {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 10px;
  font-weight: 800;
  background: rgba(255, 108, 0, 0.1);
  border: 1px solid var(--neon-orange);
  color: #FFFFFF;
  padding: 3px 6px;
  border-radius: 4px;
}

.actions-hud-panel {
  background: rgba(5, 5, 12, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 8px;
}

.roll-dice-btn {
  font-family: 'Orbitron', sans-serif !important;
  background-color: var(--neon-magenta) !important;
  color: #FFFFFF !important;
  border-radius: 6px !important;
  font-size: 13px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  box-shadow: 0 0 15px rgba(255, 0, 127, 0.4) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.roll-dice-btn:hover:not(:disabled) {
  box-shadow: 0 0 25px rgba(255, 0, 127, 0.8) !important;
  transform: translateY(-1px);
}

.dice-result-hud-display {
  background: #05050c;
  border-radius: 6px;
  border: 1px solid rgba(0, 240, 255, 0.15);
}

.dice-digit-value {
  color: var(--neon-cyan);
  font-family: 'Share Tech Mono', monospace !important;
  text-shadow: 0 0 8px var(--neon-cyan);
}

.pass-turn-btn {
  font-family: 'Orbitron', sans-serif !important;
  border: 1px solid var(--neon-cyan) !important;
  background: rgba(0, 240, 255, 0.05) !important;
  color: var(--neon-cyan) !important;
  border-radius: 6px !important;
  font-size: 9px !important;
}

.pass-turn-btn:hover:not(:disabled) {
  background: var(--neon-cyan) !important;
  color: #000000 !important;
  box-shadow: 0 0 10px var(--neon-cyan) !important;
}

.loan-trigger-btn {
  font-family: 'Orbitron', sans-serif !important;
  border: 1px solid var(--neon-orange) !important;
  background: rgba(255, 108, 0, 0.05) !important;
  color: var(--neon-orange) !important;
  border-radius: 6px !important;
  font-size: 9px !important;
}

.loan-trigger-btn:hover:not(:disabled) {
  background: var(--neon-orange) !important;
  color: #000000 !important;
  box-shadow: 0 0 10px var(--neon-orange) !important;
}

/* 7. Tabs & Terminal LOGS - Monochromatic CRT Terminal */
.tabs-hud-row {
  border-top: 1px solid rgba(0, 240, 255, 0.15);
}

.terminal-tabs-toggle {
  background: #05050c !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  padding: 1.5px !important;
  height: 24px !important;
}

.terminal-tabs-toggle .v-btn {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px !important;
  font-weight: 900 !important;
  border-radius: 4px !important;
  height: 21px !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

.terminal-tabs-toggle .v-btn--selected {
  background: var(--neon-cyan) !important;
  color: #000000 !important;
}

/* CRT Screen Glow Style */
.hud-terminal-log {
  background: #000000 !important;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.2);
  font-family: 'Share Tech Mono', monospace !important;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Green terminal color for logs */
.hud-terminal-log[key="logs"] {
  color: var(--neon-green) !important;
}

/* Amber terminal color for news */
.hud-terminal-log[key="news"] {
  color: var(--neon-orange) !important;
}

.log-row {
  font-size: 11px;
  border-bottom: 1px dashed rgba(57, 255, 20, 0.1) !important;
}

.hud-terminal-log[key="news"] .log-row {
  border-bottom: 1px dashed rgba(255, 108, 0, 0.1) !important;
}

.log-time {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3) !important;
}

.log-text {
  font-weight: 600;
  text-shadow: 0 0 2px currentColor;
}

.news-hud-card {
  background: rgba(255, 108, 0, 0.03) !important;
  border: 1px solid rgba(255, 108, 0, 0.15) !important;
  color: var(--neon-orange);
}

.news-hud-card:hover {
  background: rgba(255, 108, 0, 0.08) !important;
  border-color: var(--neon-orange) !important;
  box-shadow: 0 0 8px rgba(255, 108, 0, 0.2);
}

.news-hud-header .news-tag {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 8px;
  color: var(--neon-orange);
  background: rgba(255, 108, 0, 0.15);
  border: 1px solid var(--neon-orange);
  padding: 1px 6px;
  border-radius: 4px;
}

.news-headline {
  font-family: 'Orbitron', sans-serif !important;
  letter-spacing: 0.02em;
  font-size: 11px;
  text-shadow: 0 0 3px var(--neon-orange);
}

.news-body {
  color: rgba(255, 108, 0, 0.8) !important;
  font-size: 9px;
}

/* 8. Dialog Premium Styles (Modals) */
.glass-dialog {
  background: rgba(13, 10, 24, 0.96) !important;
  border: 2px solid var(--neon-cyan) !important;
  box-shadow: 0 0 35px rgba(0, 240, 255, 0.45) !important;
  border-radius: 12px !important;
  overflow: hidden;
}

.glass-dialog.auction-theme {
  border-color: var(--neon-red) !important;
  box-shadow: 0 0 35px rgba(255, 0, 60, 0.45) !important;
}

.property-modal-header {
  padding: 24px 16px;
  text-align: center;
  position: relative;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.property-modal-header h2 {
  font-family: 'Orbitron', sans-serif !important;
}

.property-modal-header::after {
  display: none; /* remove legacy gradient mask */
}

.stat-grid {
  background: #05050c !important;
  border: 1px solid rgba(0, 240, 255, 0.1) !important;
}

.money-stat {
  font-size: 22px;
  font-family: 'Share Tech Mono', monospace !important;
}

.money-stat.primary-text {
  color: var(--neon-cyan) !important;
  text-shadow: 0 0 5px var(--neon-cyan);
}

.money-stat.success-text {
  color: var(--neon-green) !important;
  text-shadow: 0 0 5px var(--neon-green);
}

.interactive-btn {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 13px !important;
  border-radius: 6px !important;
}

.loan-pulse-circle {
  background: rgba(255, 108, 0, 0.1);
  border: 1px solid rgba(255, 108, 0, 0.3);
}

.loan-select-btn {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 13px !important;
  border-radius: 6px !important;
  border: 1px solid var(--neon-orange) !important;
  color: var(--neon-orange) !important;
}

.loan-select-btn:hover {
  background: var(--neon-orange) !important;
  color: #000000 !important;
  box-shadow: 0 0 15px var(--neon-orange) !important;
}

.auction-alarm-banner h2 {
  font-family: 'Orbitron', sans-serif !important;
  color: var(--neon-red) !important;
  text-shadow: 0 0 10px var(--neon-red);
}

.auction-timer-container {
  background: rgba(255, 0, 60, 0.08) !important;
  border: 1px solid rgba(255, 0, 60, 0.3) !important;
}

.timer-countdown {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 38px;
  text-shadow: 0 0 10px currentColor;
}

.bid-action-btn {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 12px !important;
  border-radius: 6px !important;
  background-color: var(--neon-green) !important;
  color: #000000 !important;
  box-shadow: 0 0 8px rgba(57, 255, 20, 0.3) !important;
}

.bid-action-btn:hover:not(:disabled) {
  box-shadow: 0 0 15px rgba(57, 255, 20, 0.7) !important;
}

.custom-checkbox :deep(.v-label) {
  font-family: 'Outfit', sans-serif !important;
  font-size: 13px !important;
  color: #FFFFFF !important;
}

.custom-checkbox :deep(.v-selection-control__input) {
  color: var(--neon-cyan) !important;
}

.custom-text-field :deep(.v-field) {
  font-family: 'Share Tech Mono', monospace !important;
  border-radius: 6px !important;
  border: 1px solid rgba(0, 240, 255, 0.3) !important;
  background: #05050C !important;
  color: var(--neon-cyan) !important;
}

.trade-item-hud-panel {
  background: #05050c !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.victory-light-ray {
  background: radial-gradient(circle, rgba(255, 242, 0, 0.25) 0%, transparent 70%);
}

.winner-hud-card {
  border: 2px solid var(--neon-yellow) !important;
  box-shadow: 0 0 30px rgba(255, 242, 0, 0.25) !important;
  background: linear-gradient(135deg, rgba(255, 242, 0, 0.1) 0%, rgba(8, 8, 20, 0.6) 100%) !important;
}

.winner-avatar {
  border: 3px solid var(--neon-yellow) !important;
}

.winner-wealth-summary {
  background: #05050c !important;
  border: 1px solid rgba(255, 242, 0, 0.2) !important;
}

.text-gradient {
  background: linear-gradient(135deg, var(--neon-yellow) 0%, var(--neon-magenta) 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.return-menu-btn {
  font-family: 'Orbitron', sans-serif !important;
  background-color: var(--neon-magenta) !important;
  color: #FFFFFF !important;
  box-shadow: 0 0 15px rgba(255, 0, 127, 0.4) !important;
}

.return-menu-btn:hover {
  box-shadow: 0 0 25px rgba(255, 0, 127, 0.8) !important;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.pulse-glow {
  animation: pulse-active 1.8s infinite;
}

@keyframes pulse-active {
  0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(0, 240, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

.animate-pulse-fast {
  animation: pulse-fast 0.6s infinite alternate;
}

@keyframes pulse-fast {
  from { opacity: 0.5; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1.03); }
}

:deep(.v-btn) {
  text-transform: none !important;
  letter-spacing: 0.05em !important;
  font-family: 'Outfit', sans-serif !important;
}

/* Custom Confirmation Dialog Styles */
.confirm-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.confirm-pulse-circle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  z-index: -1;
}

.confirm-pulse-circle.error-pulse {
  background: rgba(255, 0, 60, 0.1);
  border: 1px solid rgba(255, 0, 60, 0.3);
  animation: pulse-fast 1s infinite alternate;
}

.confirm-pulse-circle.warning-pulse {
  background: rgba(255, 108, 0, 0.1);
  border: 1px solid rgba(255, 108, 0, 0.3);
  animation: pulse-fast 1s infinite alternate;
}

.confirm-pulse-circle.primary-pulse {
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  animation: pulse-fast 1s infinite alternate;
}

.confirm-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  filter: drop-shadow(0 0 10px currentColor);
}

/* Cyberpunk Vector Banners */
.city-banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.city-vector-banner {
  width: 100%;
  height: 100%;
  opacity: 0.95;
  filter: saturate(1.2);
}
.property-modal-header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2px) brightness(0.6);
  z-index: 1;
  border-bottom: 2px solid rgba(0, 240, 255, 0.3);
}
.property-modal-header-content {
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}
.glow-title-text {
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px currentColor;
}
.block-badge {
  background: rgba(13, 10, 24, 0.75);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: 4px;
  display: inline-block;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.1);
}
.drop-shadow-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 6px currentColor);
}
</style>
