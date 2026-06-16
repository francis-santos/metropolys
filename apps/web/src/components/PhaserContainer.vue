<template>
  <div class="phaser-wrapper border border-light elevation-10">
    <div ref="phaserContainer" class="phaser-canvas-parent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Phaser from 'phaser';
import { BoardScene } from '../game/boardScene';

const phaserContainer = ref(null);
let gameInstance = null;

onMounted(() => {
  if (!phaserContainer.value) return;

  const config = {
    type: Phaser.AUTO,
    parent: phaserContainer.value,
    width: 1600,
    height: 900,
    antialias: true,
    antialiasGL: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    backgroundColor: '#0B0F19',
    scene: [BoardScene]
  };

  gameInstance = new Phaser.Game(config);
});

onBeforeUnmount(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
});
</script>

<style scoped>
.phaser-wrapper {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  background-color: #0B0F19;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phaser-canvas-parent {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-light {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
</style>
