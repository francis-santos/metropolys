<template>
  <v-container class="fill-height d-flex align-center justify-center home-screen-container" fluid>
    <CityBackground class="home-bg-overlay" />
    <v-card
      class="mx-auto pa-8 retro-arcade-panel position-relative overflow-hidden"
      max-width="500"
      width="100%"
      elevation="24"
    >
      <!-- Top Decorative Hazard Stripes -->
      <div class="hazard-stripes absolute-top"></div>

      <div class="text-center mb-8 mt-2">
        <div class="text-caption text-uppercase tracking-widest text-disabled mb-1 font-mono">
          [ SYSTEM INITIALIZED ]
        </div>
        <h1 class="logo-text text-h2 font-weight-black mb-2 tracking-widest glow-text-magenta">
          METROPOLYS
        </h1>
        <p class="text-subtitle-2 text-uppercase tracking-wider glow-text-cyan font-weight-bold">
          Construa seu império imobiliário • Online
        </p>
      </div>

      <!-- Option 1: Local Offline Match -->
      <v-btn
        block
        size="x-large"
        variant="flat"
        prepend-icon="mdi-play"
        class="text-white font-weight-bold py-4 custom-btn mb-4 arcade-btn-magenta"
        @click="startLocal"
      >
        Jogar Local (Hotseat)
      </v-btn>

      <div class="d-flex align-center my-6 justify-center">
        <span class="divider-line"></span>
        <span class="divider-text mx-4 font-mono">[ NETWORK DECK ]</span>
        <span class="divider-line"></span>
      </div>

      <!-- Option 2: Create Online Match -->
      <v-btn
        block
        size="x-large"
        variant="outlined"
        prepend-icon="mdi-plus"
        class="font-weight-bold py-4 custom-btn mb-6 arcade-btn-cyan"
        @click="createOnline"
      >
        Criar Sala Online
      </v-btn>

      <!-- Option 3: Join Room by Code -->
      <v-card class="pa-4 rounded-xl join-sub-card text-center">
        <span class="text-caption text-uppercase text-white mb-3 d-block font-mono tracking-widest">
          >> Conectar em Sala Existente
        </span>
        <v-row no-gutters class="align-center">
          <v-col cols="8" class="pr-2">
            <v-text-field
              v-model="joinCode"
              label="CÓDIGO DE DECRIPTAÇÃO"
              variant="outlined"
              density="comfortable"
              maxlength="6"
              hide-details
              class="text-white terminal-input"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-btn
              block
              size="large"
              variant="flat"
              prepend-icon="mdi-login"
              class="text-black font-weight-bold py-3 arcade-btn-green"
              :disabled="joinCode.length !== 6"
              @click="joinOnline"
            >
              Entrar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
      
      <!-- Settings trigger -->
      <div class="text-center mt-6">
        <v-btn
          variant="text"
          color="white"
          prepend-icon="mdi-cog"
          size="small"
          class="font-mono text-caption text-disabled hover-glow-cyan"
          @click="$emit('navigate', 'SETTINGS')"
        >
          [ AJUSTES DO CONSOLE ]
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { gameStore } from '../game/gameStore';
import CityBackground from './CityBackground.vue';

const emit = defineEmits(['navigate', 'mode-selected']);

const joinCode = ref('');

const startLocal = () => {
  emit('mode-selected', { online: false });
};

const createOnline = () => {
  emit('mode-selected', { online: true });
};

const joinOnline = async () => {
  if (joinCode.value.length === 6) {
    const code = joinCode.value.toUpperCase();
    const guestName = prompt("Insira seu nome de jogador online:", "Jogador " + Math.floor(100 + Math.random() * 900));
    if (!guestName) return;
    
    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const success = await gameStore.joinOnlineRoom(code, guestName, randomColor, gameStore.selectedPin);
    if (success) {
      emit('navigate', 'MATCH');
    }
  }
};
</script>

<style scoped>
.retro-arcade-panel {
  background: rgba(13, 10, 24, 0.9) !important;
  border: 2px solid var(--neon-cyan) !important;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.15) !important;
  border-radius: 12px !important;
}

.absolute-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.logo-text {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 44px !important;
  letter-spacing: 0.18em !important;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace !important;
}

/* Cyberpunk Button Styles */
.custom-btn {
  font-family: 'Orbitron', sans-serif !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  border-radius: 6px !important;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.arcade-btn-magenta {
  background-color: var(--neon-magenta) !important;
  color: #FFFFFF !important;
  font-family: 'Orbitron', sans-serif !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  border-radius: 6px !important;
  box-shadow: 0 0 10px rgba(255, 0, 127, 0.5) !important;
}

.arcade-btn-magenta:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(255, 0, 127, 0.8) !important;
}

.arcade-btn-cyan {
  border: 2px solid var(--neon-cyan) !important;
  color: var(--neon-cyan) !important;
  background-color: rgba(0, 240, 255, 0.05) !important;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15) !important;
}

.arcade-btn-cyan:hover {
  background-color: var(--neon-cyan) !important;
  color: #000000 !important;
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.6) !important;
}

.arcade-btn-green {
  background-color: var(--neon-green) !important;
  color: #000000 !important;
  font-family: 'Orbitron', sans-serif !important;
  border-radius: 6px !important;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4) !important;
}

.arcade-btn-green:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.8) !important;
}

.divider-line {
  flex-grow: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
}

.divider-text {
  font-size: 10px;
  color: var(--neon-cyan);
  letter-spacing: 0.1em;
}

.join-sub-card {
  background: rgba(8, 8, 20, 0.85) !important;
  border: 1px dashed rgba(0, 240, 255, 0.3) !important;
  border-radius: 8px !important;
}

/* Terminal style text inputs */
.terminal-input :deep(.v-field) {
  font-family: 'Share Tech Mono', monospace !important;
  color: var(--neon-cyan) !important;
  background: #05050C !important;
  border: 1px solid rgba(0, 240, 255, 0.4) !important;
  border-radius: 6px !important;
}

.terminal-input :deep(.v-field__input) {
  text-align: center;
  letter-spacing: 0.15em;
  font-size: 16px;
  text-transform: uppercase;
}

.terminal-input :deep(.v-label) {
  font-family: 'Share Tech Mono', monospace !important;
  font-size: 9px !important;
  color: rgba(0, 240, 255, 0.5) !important;
}

.hover-glow-cyan:hover {
  color: var(--neon-cyan) !important;
  text-shadow: 0 0 8px var(--neon-cyan);
}

.home-screen-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.home-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.35; /* Delicate opacity */
  pointer-events: none;
  z-index: 0;
  animation: bg-pan-slow 80s linear infinite alternate;
}

@keyframes bg-pan-slow {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.06);
  }
}

.retro-arcade-panel {
  z-index: 1;
}
</style>
