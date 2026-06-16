<template>
  <v-container class="fill-height d-flex align-center justify-center" fluid>
    <v-card
      class="mx-auto pa-8 retro-arcade-panel position-relative overflow-hidden"
      max-width="900"
      width="100%"
      elevation="24"
    >
      <!-- Top Decorative Hazard Stripes -->
      <div class="hazard-stripes absolute-top"></div>

      <div class="text-center mb-8 mt-2">
        <div class="text-caption text-uppercase tracking-widest text-disabled mb-1 font-mono">
          [ AREA MAP SELECTOR ]
        </div>
        <h1 class="logo-text text-h3 font-weight-black mb-2 tracking-widest glow-text-magenta">
          SELECIONE A CIDADE
        </h1>
        <p class="text-subtitle-2 text-uppercase tracking-wider glow-text-cyan font-weight-bold">
          Escolha onde erguer o seu império imobiliário
        </p>
      </div>

      <v-row class="mb-6 justify-center">
        <!-- City Cards -->
        <v-col
          cols="12"
          sm="4"
          v-for="city in availableCities"
          :key="city.id"
        >
          <v-card
            variant="flat"
            class="city-selection-card pa-4 rounded-xl border transition-all text-center position-relative overflow-hidden"
            :class="{ 'selected-city-border': selectedCityId === city.id }"
            :style="{
              background: selectedCityId === city.id 
                ? 'rgba(0, 240, 255, 0.08)' 
                : 'rgba(13, 10, 24, 0.5)'
            }"
            @click="selectedCityId = city.id"
          >
            <!-- Card Scanlines overlay -->
            <div class="card-scanlines"></div>

            <v-avatar size="64" :color="city.theme.primary" class="mb-4 elevation-6 pulse-glow text-white logo-avatar">
              <v-icon size="36">mdi-city</v-icon>
            </v-avatar>

            <h3 class="text-h6 font-weight-bold text-white mb-1 title-font">{{ city.name }}</h3>
            <span class="text-caption text-disabled d-block mb-3 font-mono">{{ city.packName }}</span>
            
            <v-divider class="my-2 divider-cyan"></v-divider>
            
            <div class="text-caption text-medium-emphasis mt-2 text-white font-mono">
              Capital: <span class="font-weight-bold glow-text-green">${{ city.startingCapital }}M</span>
            </div>

            <!-- Colors dot preview -->
            <div class="d-flex justify-center gap-1 mt-3">
              <v-avatar size="10" :color="city.theme.primary" class="mx-1"></v-avatar>
              <v-avatar size="10" :color="city.theme.secondary" class="mx-1"></v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Bottom controls -->
      <v-row class="mt-6 align-center">
        <v-col cols="4">
          <v-btn
            block
            size="large"
            variant="outlined"
            prepend-icon="mdi-shuffle"
            class="font-weight-bold py-3 custom-btn arcade-btn-cyan"
            @click="selectRandom"
          >
            Aleatório
          </v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn
            block
            size="large"
            variant="text"
            class="font-mono text-caption hover-glow-red font-weight-bold text-uppercase"
            @click="$emit('navigate', 'HOME')"
          >
            [ VOLTAR ]
          </v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn
            block
            size="large"
            variant="flat"
            prepend-icon="mdi-check-circle"
            class="text-black font-weight-bold py-3 custom-btn arcade-btn-green"
            :disabled="!selectedCityId"
            @click="confirmSelection"
          >
            Confirmar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { cityPacks } from '../game/citypacks';
import { gameStore } from '../game/gameStore';

const emit = defineEmits(['navigate', 'city-selected']);

const selectedCityId = ref('salvador');

const availableCities = Object.values(cityPacks);

const selectRandom = () => {
  const ids = availableCities.map(c => c.id);
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  selectedCityId.value = randomId;
  confirmSelection();
};

const confirmSelection = () => {
  if (selectedCityId.value) {
    gameStore.initializeCity(selectedCityId.value);
    emit('city-selected', selectedCityId.value);
  }
};
</script>

<style scoped>
.retro-arcade-panel {
  background: rgba(13, 10, 24, 0.95) !important;
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
  font-size: 36px !important;
  letter-spacing: 0.15em !important;
}

.title-font {
  font-family: 'Orbitron', sans-serif !important;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace !important;
}

.divider-cyan {
  border-color: rgba(0, 240, 255, 0.15) !important;
}

/* Holographic City selector cards */
.city-selection-card {
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  border-radius: 10px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.city-selection-card:hover {
  transform: translateY(-4px);
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3) !important;
}

.selected-city-border {
  border: 2px solid var(--neon-cyan) !important;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.45) !important;
}

.selected-city-border .logo-avatar {
  box-shadow: 0 0 15px var(--neon-cyan) !important;
}

/* Subtle scanlines for card terminals */
.card-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.12) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
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
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4) !important;
}

.arcade-btn-green:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.8) !important;
  transform: translateY(-2px);
}

.hover-glow-red:hover {
  color: var(--neon-red) !important;
  text-shadow: 0 0 8px var(--neon-red);
}

.gap-1 {
  gap: 4px;
}
</style>
