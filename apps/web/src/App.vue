<script setup>
import { ref } from 'vue';
import HomeScreen from './components/HomeScreen.vue';
import CitySelectionScreen from './components/CitySelectionScreen.vue';
import SettingsScreen from './components/SettingsScreen.vue';
import MatchScreen from './components/MatchScreen.vue';
import { gameStore } from './game/gameStore';

// Pre-process transparent images for player pins
gameStore.loadTransparentPins();

const currentScreen = ref('HOME');
const isOnlineMode = ref(false);

const navigate = (screen) => {
  currentScreen.value = screen;
};

// Handle choice of local vs online setup
const handleModeSelected = ({ online }) => {
  isOnlineMode.value = online;
  navigate('CITY_SELECTION');
};

const handleCitySelected = async (cityCode) => {
  if (isOnlineMode.value) {
    // Online matchmaking: prompt for guest name & color
    const hostName = prompt("Insira seu nome de jogador online:", "Jogador " + Math.floor(100 + Math.random() * 900));
    if (!hostName) return;
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    await gameStore.createOnlineRoom(hostName, randomColor, cityCode, gameStore.selectedPin);
    navigate('MATCH');
  } else {
    // Local match: configure temporary guest profiles and start
    const localPlayers = [
      { name: 'Alice', color: '#6366F1', pin: gameStore.selectedPin },
      { name: 'Bob', color: '#10B981', pin: 'random' },
    ];
    gameStore.initializeGame(localPlayers);
    navigate('MATCH');
  }
};
</script>

<template>
  <v-app class="app-container">
    <!-- Global CRT Scanlines Overlay -->
    <div class="retro-scanlines"></div>
    
    <v-main class="pa-0 fill-height bg-dark-bg position-relative">
      <!-- Cyberpunk Grid Background -->
      <div class="retro-grid"></div>
      
      <transition name="retro-fade" mode="out-in">
        <component
          :is="
            currentScreen === 'HOME'
              ? HomeScreen
              : currentScreen === 'CITY_SELECTION'
              ? CitySelectionScreen
              : currentScreen === 'SETTINGS'
              ? SettingsScreen
              : MatchScreen
          "
          @navigate="navigate"
          @mode-selected="handleModeSelected"
          @city-selected="handleCitySelected"
        />
      </transition>
    </v-main>
  </v-app>
</template>

<style>
.app-container {
  background-color: var(--cyber-bg) !important;
}

.bg-dark-bg {
  background: radial-gradient(circle at center, var(--cyber-bg-accent) 0%, var(--cyber-bg) 100%) !important;
}

/* Retro arcade screen transitions with subtle scanline flickers */
.retro-fade-enter-active,
.retro-fade-leave-active {
  transition: opacity 0.15s steps(4), transform 0.15s ease-out;
}

.retro-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(2px);
  filter: brightness(2);
}

.retro-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-2px);
  filter: brightness(0.2);
}
</style>
