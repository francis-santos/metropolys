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

      <div class="mb-8 d-flex align-center mt-2">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          color="white"
          class="mr-4 hover-glow-red back-btn"
          @click="$emit('navigate', 'HOME')"
        ></v-btn>
        <div>
          <h2 class="text-h4 font-weight-bold text-white mb-1 title-font glow-text-cyan">Ajustes</h2>
          <p class="text-caption font-mono text-disabled mb-0">[ CONSOLE DE CONFIGURAÇÃO ]</p>
        </div>
      </div>

      <v-row class="settings-content mb-2">
        <!-- Left Column: Options -->
        <v-col cols="12" md="6" class="pr-md-8 border-r-md">
          <!-- Starting Money -->
          <div class="setting-item mb-6">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-1 font-weight-medium text-white">Capital Inicial</span>
              <span class="text-body-1 font-weight-bold font-mono glow-text-cyan">${{ startingMoney }} M</span>
            </div>
            <v-slider
              v-model="startingMoney"
              min="1000"
              max="3000"
              step="500"
              color="cyan"
              track-color="rgba(0, 240, 255, 0.15)"
              hide-details
              class="cyber-slider"
            ></v-slider>
            <span class="text-caption font-mono text-disabled d-block mt-1">
              A quantia padrão que cada magnata recebe ao iniciar.
            </span>
          </div>

          <v-divider class="my-6 divider-cyan"></v-divider>

          <!-- Speed / Animation settings -->
          <div class="setting-item mb-6">
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <span class="text-body-1 font-weight-medium text-white d-block">Velocidade das Peças</span>
                <span class="text-caption font-mono text-disabled">Velocidade do token pelo tabuleiro</span>
              </div>
              <v-switch
                v-model="fastTokens"
                color="cyan"
                hide-details
                inset
                class="cyber-switch"
              ></v-switch>
            </div>
          </div>

          <!-- Mute Audio -->
          <div class="setting-item">
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <span class="text-body-1 font-weight-medium text-white d-block">Efeitos Sonoros (SFX)</span>
                <span class="text-caption font-mono text-disabled">Habilita efeitos sonoros e ambientação</span>
              </div>
              <v-switch
                v-model="enableSFX"
                color="cyan"
                hide-details
                inset
                class="cyber-switch"
              ></v-switch>
            </div>
          </div>
        </v-col>

        <!-- Right Column: Player Pin Selection -->
        <v-col cols="12" md="6" class="pl-md-8">
          <!-- Player Pin Selection -->
          <div class="setting-item mb-6">
            <div class="mb-3">
              <span class="text-body-1 font-weight-medium text-white d-block">Pino do Jogador</span>
              <span class="text-caption font-mono text-disabled">Escolha o seu marcador no tabuleiro (ou deixe em branco para aleatório)</span>
            </div>
            
            <v-item-group v-model="selectedPin" class="pin-grid">
              <v-row class="gap-2 justify-center">
                <v-col cols="3" sm="3" v-for="n in 8" :key="n" class="pa-1">
                  <v-item :value="`pin-${n}`" v-slot="{ isSelected, toggle }">
                    <v-card
                      :class="['pin-card', { 'selected-pin': isSelected }]"
                      @click="toggle"
                    >
                      <v-img
                        :src="gameStore.transparentPins[`pin-${n}`] || `/pins/pin-${n}.png`"
                        height="60"
                        width="60"
                        class="mx-auto"
                        contain
                      >
                        <template v-slot:placeholder>
                          <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular indeterminate size="16" color="cyan"></v-progress-circular>
                          </div>
                        </template>
                      </v-img>
                      <span class="pin-label font-mono">#{{ n }}</span>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>
            
            <div class="text-center mt-3">
              <v-btn
                variant="outlined"
                color="cyan"
                size="small"
                class="font-mono text-caption"
                @click="selectedPin = null"
              >
                [ Limpar Seleção (Aleatório) ]
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-6 divider-cyan"></v-divider>

      <!-- Save and Apply button -->
      <v-btn
        block
        size="large"
        variant="flat"
        class="text-black font-weight-bold py-4 custom-btn arcade-btn-green"
        @click="saveSettings"
      >
        Salvar e Voltar
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { gameStore } from '../game/gameStore';

const emit = defineEmits(['navigate']);

const startingMoney = ref(gameStore.startingCapital);
const fastTokens = ref(true);
const enableSFX = ref(false);
const selectedPin = ref(gameStore.selectedPin);

const saveSettings = () => {
  gameStore.startingCapital = startingMoney.value;
  gameStore.selectedPin = selectedPin.value;
  if (selectedPin.value) {
    localStorage.setItem('metropolys_selected_pin', selectedPin.value);
  } else {
    localStorage.removeItem('metropolys_selected_pin');
  }
  emit('navigate', 'HOME');
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

.title-font {
  font-family: 'Orbitron', sans-serif !important;
}

.font-mono {
  font-family: 'Share Tech Mono', monospace !important;
}

.divider-cyan {
  border-color: rgba(0, 240, 255, 0.15) !important;
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  height: 36px !important;
  width: 36px !important;
}

.hover-glow-red:hover {
  color: var(--neon-red) !important;
  border-color: var(--neon-red) !important;
  box-shadow: 0 0 8px var(--neon-red);
}

/* Custom styles for sliders and switches to feel retro */
.cyber-slider :deep(.v-slider-thumb__surface) {
  background: var(--neon-cyan) !important;
  box-shadow: 0 0 10px var(--neon-cyan) !important;
}

.cyber-slider :deep(.v-slider-track__fill) {
  background: var(--neon-cyan) !important;
}

.cyber-switch :deep(.v-selection-control__input) {
  color: var(--neon-cyan) !important;
}

.cyber-switch :deep(.v-switch__thumb) {
  background: var(--neon-cyan) !important;
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

.arcade-btn-green {
  background-color: var(--neon-green) !important;
  color: #000000 !important;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4) !important;
}

.arcade-btn-green:hover {
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.8) !important;
  transform: translateY(-2px);
}

.pin-grid {
  width: 100%;
}
.pin-card {
  background: rgba(13, 10, 24, 0.6) !important;
  border: 1px solid rgba(0, 240, 255, 0.15) !important;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 8px !important;
  padding: 4px;
}
.pin-card:hover {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3) !important;
}
.selected-pin {
  border: 2px solid var(--neon-magenta) !important;
  box-shadow: 0 0 15px rgba(255, 0, 127, 0.5) !important;
  background: rgba(255, 0, 127, 0.05) !important;
}
.pin-label {
  font-size: 10px;
  position: absolute;
  bottom: 2px;
  right: 6px;
  color: rgba(255, 255, 255, 0.4);
}
.gap-2 {
  gap: 8px;
}
@media (min-width: 960px) {
  .border-r-md {
    border-right: 1px dashed rgba(0, 240, 255, 0.15) !important;
  }
}
</style>
