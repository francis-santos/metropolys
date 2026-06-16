<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const activeEvent = ref('NONE');
let eventTimeout = null;
let delayTimeout = null;

const eventList = ['UFO', 'COMET', 'WINDOWS', 'COPTERS'];
let lastEvent = '';

const triggerRandomEvent = () => {
  // Filter out the last event so we don't repeat the exact same event back-to-back
  const choices = eventList.filter(e => e !== lastEvent);
  const nextEvent = choices[Math.floor(Math.random() * choices.length)];
  lastEvent = nextEvent;
  activeEvent.value = nextEvent;

  // Set timeout to turn off the event after its duration
  let duration = 5000; // default fallback
  if (nextEvent === 'UFO') {
    duration = 12000; // UFO duration
  } else if (nextEvent === 'COMET') {
    duration = 2500;  // Comet duration
  } else if (nextEvent === 'WINDOWS') {
    duration = 10000; // Windows lighting duration
  } else if (nextEvent === 'COPTERS') {
    duration = 14000; // Helicopter patrol duration
  }

  eventTimeout = setTimeout(() => {
    activeEvent.value = 'NONE';
    
    // Minimum delay between events: random between 6 and 12 seconds
    const delay = 6000 + Math.random() * 6000;
    delayTimeout = setTimeout(triggerRandomEvent, delay);
  }, duration);
};

onMounted(() => {
  // Start the first event after 8 seconds (gives time for the city to finish building!)
  delayTimeout = setTimeout(triggerRandomEvent, 8000);
});

onUnmounted(() => {
  clearTimeout(eventTimeout);
  clearTimeout(delayTimeout);
});
</script>

<template>
  <div class="city-bg-wrapper">
    <svg viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="city-svg">
      <!-- Definitions for gradients, glow filters, etc. -->
      <defs>
        <!-- Background Sky Gradient -->
        <radialGradient id="skyGrad" cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
          <stop offset="0%" stop-color="#140b24" stop-opacity="1" />
          <stop offset="60%" stop-color="#07060f" stop-opacity="1" />
          <stop offset="100%" stop-color="#030308" stop-opacity="1" />
        </radialGradient>

        <!-- Neon Sun / Horizon Glow -->
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff007f" stop-opacity="0.25" />
          <stop offset="40%" stop-color="#ff007f" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#ff007f" stop-opacity="0" />
        </radialGradient>

        <!-- Abduction Tractor Beam Gradient -->
        <linearGradient id="abductionBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#39ff14" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#39ff14" stop-opacity="0.03" />
        </linearGradient>

        <!-- Helicopter Spotlight Gradients -->
        <linearGradient id="spotlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fff200" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#fff200" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="spotlightGradLeft" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#fff200" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#fff200" stop-opacity="0" />
        </linearGradient>

        <!-- Comet/Shooting Star Gradient (Solid head, trailing off to the right) -->
        <linearGradient id="cometGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="25%" stop-color="#00f0ff" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#00f0ff" stop-opacity="0" />
        </linearGradient>

        <!-- Skyscraper neon gradients -->
        <linearGradient id="cyanSkyscraper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#05050c" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="magentaSkyscraper" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff007f" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#05050c" stop-opacity="0" />
        </linearGradient>
        
        <!-- Neon strokes -->
        <linearGradient id="strokeCyan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
          <stop offset="70%" stop-color="#00f0ff" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#00f0ff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="strokeMagenta" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff007f" stop-opacity="0.7" />
          <stop offset="70%" stop-color="#ff007f" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#ff007f" stop-opacity="0" />
        </linearGradient>

        <!-- Glow Filter -->
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="40" result="blur" />
        </filter>
      </defs>

      <!-- Background Base -->
      <rect width="1920" height="1080" fill="url(#skyGrad)" />

      <!-- Giant Synthwave Sun / Core Glow -->
      <circle cx="960" cy="540" r="450" fill="url(#sunGlow)" filter="url(#softGlow)" />
      <!-- Sun outlines -->
      <path d="M 660 540 A 300 300 0 0 1 1260 540" stroke="#ff007f" stroke-width="1.5" stroke-opacity="0.2" fill="none" filter="url(#neonGlow)" />
      <line x1="610" y1="560" x2="1310" y2="560" stroke="#ff007f" stroke-width="1" stroke-opacity="0.1" />
      <line x1="630" y1="580" x2="1290" y2="580" stroke="#ff007f" stroke-width="1" stroke-opacity="0.1" />

      <!-- Perspective Grid lines (Horizon at y=540) -->
      <g opacity="0.35">
        <!-- Horizon Line -->
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.4" filter="url(#neonGlow)" />
        
        <!-- Vanishing Lines from horizon center -->
        <line x1="960" y1="540" x2="-200" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.3" />
        <line x1="960" y1="540" x2="100" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.3" />
        <line x1="960" y1="540" x2="400" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.4" />
        <line x1="960" y1="540" x2="700" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.4" />
        <line x1="960" y1="540" x2="960" y2="1080" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.5" filter="url(#neonGlow)" />
        <line x1="960" y1="540" x2="1220" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.4" />
        <line x1="960" y1="540" x2="1520" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.4" />
        <line x1="960" y1="540" x2="1820" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.3" />
        <line x1="960" y1="540" x2="2120" y2="1080" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.3" />
        
        <!-- Horizontal lines with perspective scaling -->
        <line x1="0" y1="555" x2="1920" y2="555" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.15" />
        <line x1="0" y1="575" x2="1920" y2="575" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.18" />
        <line x1="0" y1="605" x2="1920" y2="605" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.22" />
        <line x1="0" y1="645" x2="1920" y2="645" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.26" />
        <line x1="0" y1="700" x2="1920" y2="700" stroke="#00f0ff" stroke-width="1.2" stroke-opacity="0.32" />
        <line x1="0" y1="775" x2="1920" y2="775" stroke="#00f0ff" stroke-width="1.2" stroke-opacity="0.4" />
        <line x1="0" y1="875" x2="1920" y2="875" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.5" filter="url(#neonGlow)" />
        <line x1="0" y1="1005" x2="1920" y2="1005" stroke="#00f0ff" stroke-width="2.0" stroke-opacity="0.6" filter="url(#neonGlow)" />
      </g>

      <!-- Glowing Stars in Sky -->
      <g opacity="0.8">
        <circle cx="200" cy="120" r="1.5" fill="#00f0ff" filter="url(#neonGlow)" />
        <circle cx="450" cy="80" r="1" fill="#fff" />
        <circle cx="800" cy="150" r="2" fill="#ff007f" filter="url(#neonGlow)" />
        <circle cx="1150" cy="90" r="1" fill="#00f0ff" />
        <circle cx="1400" cy="140" r="1.5" fill="#fff" />
        <circle cx="1600" cy="70" r="2.5" fill="#ff007f" filter="url(#neonGlow)" />
        <circle cx="1780" cy="130" r="1" fill="#00f0ff" />
      </g>

      <!-- Far Layer Skyline (Deep Purple / low opacity) -->
      <g opacity="0.4">
        <!-- Building 1 -->
        <g class="b-far-1">
          <rect x="150" y="320" width="80" height="220" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="150" y="320" width="80" height="220" stroke="url(#strokeMagenta)" stroke-width="1" fill="none" class="build-stroke" />
        </g>
        <!-- Building 2 -->
        <g class="b-far-2">
          <rect x="270" y="260" width="100" height="280" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="270" y="260" width="100" height="280" stroke="url(#strokeCyan)" stroke-width="1" fill="none" class="build-stroke" />
          <line x1="320" y1="200" x2="320" y2="260" stroke="#00f0ff" stroke-width="1" class="build-spire" />
        </g>
        <!-- Building 3 -->
        <g class="b-far-3">
          <rect x="420" y="340" width="70" height="200" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="420" y="340" width="70" height="200" stroke="url(#strokeMagenta)" stroke-width="1" fill="none" class="build-stroke" />
        </g>
        <!-- Building 4 (Tower with pyramid top) -->
        <g class="b-far-4">
          <path d="M 570 300 L 610 240 L 650 300 Z" fill="url(#cyanSkyscraper)" class="build-path" />
          <path d="M 570 300 L 610 240 L 650 300 Z" stroke="url(#strokeCyan)" stroke-width="1" fill="none" class="build-stroke" />
          <rect x="570" y="300" width="80" height="240" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="570" y="300" width="80" height="240" stroke="url(#strokeCyan)" stroke-width="1" fill="none" class="build-stroke" />
        </g>
        <!-- Building 5 (Middle tall spire) -->
        <g class="b-far-5">
          <rect x="880" y="180" width="50" height="360" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="880" y="180" width="50" height="360" stroke="url(#strokeMagenta)" stroke-width="1" fill="none" class="build-stroke" />
          <line x1="905" y1="100" x2="905" y2="180" stroke="#ff007f" stroke-width="1.5" class="build-spire" />
        </g>
        <!-- Building 6 -->
        <g class="b-far-6">
          <rect x="1200" y="280" width="90" height="260" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="1200" y="280" width="90" height="260" stroke="url(#strokeCyan)" stroke-width="1" fill="none" class="build-stroke" />
        </g>
        <!-- Building 7 -->
        <g class="b-far-7">
          <rect x="1350" y="350" width="60" height="190" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="1350" y="350" width="60" height="190" stroke="url(#strokeMagenta)" stroke-width="1" fill="none" class="build-stroke" />
        </g>
        <!-- Building 8 -->
        <g class="b-far-8">
          <rect x="1480" y="220" width="110" height="320" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="1480" y="220" width="110" height="320" stroke="url(#strokeCyan)" stroke-width="1" fill="none" class="build-stroke" />
          <line x1="1535" y1="150" x2="1535" y2="220" stroke="#00f0ff" stroke-width="1" class="build-spire" />
        </g>
      </g>

      <!-- Mid Layer Skyline (More detail, cyan/magenta) -->
      <g opacity="0.65">
        <!-- Building A (Left blocky tower) -->
        <g class="b-mid-a">
          <rect x="50" y="250" width="120" height="290" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="50" y="250" width="120" height="290" stroke="url(#strokeCyan)" stroke-width="1.5" fill="none" class="build-stroke" />
          <line x1="110" y1="200" x2="110" y2="250" stroke="#00f0ff" stroke-width="1.5" class="build-spire" />
          <circle cx="110" cy="195" r="2" fill="#00f0ff" class="beacon-cyan" />
        </g>
        
        <!-- Building B (Tall stepped magenta tower) -->
        <g class="b-mid-b">
          <rect x="220" y="200" width="90" height="340" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="235" y="160" width="60" height="40" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="250" y="110" width="30" height="50" fill="url(#magentaSkyscraper)" class="build-rect" />
          
          <rect x="220" y="200" width="90" height="340" stroke="url(#strokeMagenta)" stroke-width="1.5" fill="none" class="build-stroke" />
          <rect x="235" y="160" width="60" height="40" stroke="url(#strokeMagenta)" stroke-width="1.5" fill="none" class="build-stroke" />
          <rect x="250" y="110" width="30" height="50" stroke="url(#strokeMagenta)" stroke-width="1.5" fill="none" class="build-stroke" />
          <line x1="265" y1="50" x2="265" y2="110" stroke="#ff007f" stroke-width="1.5" class="build-spire" />
          <circle cx="265" cy="50" r="2" fill="#ff007f" class="beacon-magenta" />
        </g>
        
        <!-- Building C (Grid building) -->
        <g class="b-mid-c">
          <rect x="360" y="290" width="80" height="250" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="360" y="290" width="80" height="250" stroke="url(#strokeCyan)" stroke-width="1.5" fill="none" class="build-stroke" />
          <path d="M 380 320 H 420 M 380 350 H 420 M 380 380 H 420 M 380 410 H 420 M 380 440 H 420" stroke="#00f0ff" stroke-width="1" stroke-opacity="0.3" class="build-spire" />
        </g>
        
        <!-- Building D (Angled roof) -->
        <g class="b-mid-d">
          <path d="M 720 220 L 820 160 L 820 540 L 720 540 Z" fill="url(#cyanSkyscraper)" class="build-path" />
          <path d="M 720 220 L 820 160 L 820 540 L 720 540 Z" stroke="url(#strokeCyan)" stroke-width="1.5" fill="none" class="build-stroke" />
        </g>
        
        <!-- Building E (Giant central monolith) -->
        <g class="b-mid-e">
          <rect x="990" y="120" width="140" height="420" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="990" y="120" width="140" height="420" stroke="url(#strokeMagenta)" stroke-width="2" fill="none" class="build-stroke" filter="url(#neonGlow)" />
          <line x1="1020" y1="160" x2="1100" y2="360" stroke="#ff007f" stroke-width="3" class="build-spire" filter="url(#neonGlow)" />
        </g>
        
        <!-- Building F (High tech tower) -->
        <g class="b-mid-f">
          <rect x="1190" y="230" width="80" height="310" fill="url(#cyanSkyscraper)" class="build-rect" />
          <rect x="1190" y="230" width="80" height="310" stroke="url(#strokeCyan)" stroke-width="1.5" fill="none" class="build-stroke" />
          <circle cx="1230" cy="270" r="15" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-opacity="0.6" class="build-spire" />
          <line x1="1230" y1="170" x2="1230" y2="230" stroke="#00f0ff" stroke-width="1.5" class="build-spire" />
          <circle cx="1230" cy="170" r="2" fill="#00f0ff" class="beacon-green" />
        </g>
        
        <!-- Building G -->
        <g class="b-mid-g">
          <rect x="1380" y="270" width="110" height="270" fill="url(#magentaSkyscraper)" class="build-rect" />
          <rect x="1380" y="270" width="110" height="270" stroke="url(#strokeMagenta)" stroke-width="1.5" fill="none" class="build-stroke" />
        </g>
        
        <!-- Building H (Rightmost tall tower) -->
        <g class="b-mid-h">
          <rect x="1650" y="180" width="130" height="360" fill="url(#cyanSkyscraper)" class="build-rect" />
          <path d="M 1650 180 L 1715 100 L 1780 180 Z" fill="url(#cyanSkyscraper)" class="build-path" />
          
          <rect x="1650" y="180" width="130" height="360" stroke="url(#strokeCyan)" stroke-width="2" fill="none" class="build-stroke" />
          <path d="M 1650 180 L 1715 100 L 1780 180 Z" stroke="url(#strokeCyan)" stroke-width="2" fill="none" class="build-stroke" />
          <line x1="1715" y1="40" x2="1715" y2="100" stroke="#00f0ff" stroke-width="2" class="build-spire" filter="url(#neonGlow)" />
          <circle cx="1715" cy="40" r="2" fill="#00f0ff" class="beacon-cyan" />
        </g>
      </g>

      <!-- Foremost detailed structures (Very subtle overlay shadows at bottom) -->
      <rect x="0" y="520" width="1920" height="20" fill="#05050c" />

      <!-- ================= SCENE 1: UFO ABDUCTION ================= -->
      <!-- Hovers above Building F (center x = 1230, roof y = 230) -->
      <g v-if="activeEvent === 'UFO'">
        <!-- Animated Person (floats up, static relative position) -->
        <g class="abducted-person">
          <!-- Head -->
          <circle cx="1230" cy="220" r="2.5" fill="#39ff14" filter="url(#neonGlow)" />
          <!-- Torso -->
          <line x1="1230" y1="222.5" x2="1230" y2="228" stroke="#39ff14" stroke-width="1.2" />
          <!-- Arms (waving frantically) -->
          <line x1="1227" y1="225" x2="1233" y2="224" stroke="#39ff14" stroke-width="0.8" />
          <!-- Legs -->
          <line x1="1230" y1="228" x2="1228" y2="233" stroke="#39ff14" stroke-width="0.8" />
          <line x1="1230" y1="228" x2="1232" y2="233" stroke="#39ff14" stroke-width="0.8" />
        </g>

        <g class="ufo-group">
          <!-- Tractor Beam (pulses and scales) -->
          <polygon points="1230,105 1200,230 1260,230" fill="url(#abductionBeamGrad)" class="ufo-beam" />

          <!-- UFO Space Ship -->
          <g class="ufo-ship">
            <!-- Dome Cockpit -->
            <path d="M 1212 95 A 18 18 0 0 1 1248 95 Z" fill="#00f0ff" opacity="0.8" filter="url(#neonGlow)" />
            <!-- Metal Body -->
            <ellipse cx="1230" cy="100" rx="35" ry="9" fill="#140b24" stroke="#ff007f" stroke-width="1.8" filter="url(#neonGlow)" />
            <!-- Flashing Lights on the Ring -->
            <circle cx="1205" cy="100" r="1.5" fill="#fff" class="ufo-rim-light-1" />
            <circle cx="1217" cy="102" r="1.5" fill="#fff" class="ufo-rim-light-2" />
            <circle cx="1230" cy="103" r="1.5" fill="#fff" class="ufo-rim-light-1" />
            <circle cx="1243" cy="102" r="1.5" fill="#fff" class="ufo-rim-light-2" />
            <circle cx="1255" cy="100" r="1.5" fill="#fff" class="ufo-rim-light-1" />
          </g>
        </g>
      </g>

      <!-- ================= SCENE 2: COMET / SHOOTING STAR ================= -->
      <!-- Adjusted to pass above the buildings (y values are smaller/higher up) -->
      <g class="comet-group" v-if="activeEvent === 'COMET'">
        <!-- Comet tail points towards top-right. Trajectory is from y=50 down to y=100 (horizontal high altitude) -->
        <path d="M 1700,50 L 1880,45" stroke="url(#cometGrad)" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="1700" cy="50" r="3.5" fill="#fff" filter="url(#neonGlow)" />
      </g>

      <!-- ================= SCENE 3: RANDOM WINDOW LIGHTS ================= -->
      <!-- Windows glow in neon colors, twinkling/flickering -->
      <g v-if="activeEvent === 'WINDOWS'" class="windows-event-group">
        <!-- Monolith Building E Windows -->
        <rect x="1015" y="180" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1015" y="220" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1015" y="260" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1015" y="300" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1015" y="340" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1015" y="380" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1015" y="420" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        
        <rect x="1060" y="180" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1060" y="220" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1060" y="260" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1060" y="300" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1060" y="340" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1060" y="380" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1060" y="420" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        
        <rect x="1105" y="180" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1105" y="220" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1105" y="260" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1105" y="300" width="10" height="15" rx="1" class="window-glow w-anim-2" />
        <rect x="1105" y="340" width="10" height="15" rx="1" class="window-glow w-anim-3" />
        <rect x="1105" y="380" width="10" height="15" rx="1" class="window-glow w-anim-1" />
        <rect x="1105" y="420" width="10" height="15" rx="1" class="window-glow w-anim-2" />

        <!-- Left Tower Building A Windows -->
        <rect x="80" y="280" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="80" y="320" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="80" y="360" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="80" y="400" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="80" y="440" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="130" y="280" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="130" y="320" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="130" y="360" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="130" y="400" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="130" y="440" width="8" height="12" rx="1" class="window-glow w-anim-1" />

        <!-- Tower Building B Windows -->
        <rect x="245" y="220" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="245" y="270" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="245" y="320" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="245" y="370" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="275" y="220" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="275" y="270" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="275" y="320" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="275" y="370" width="8" height="12" rx="1" class="window-glow w-anim-1" />

        <!-- Right Tower Building H Windows -->
        <rect x="1680" y="220" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="1680" y="270" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="1680" y="320" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="1680" y="370" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="1740" y="220" width="8" height="12" rx="1" class="window-glow w-anim-3" />
        <rect x="1740" y="270" width="8" height="12" rx="1" class="window-glow w-anim-2" />
        <rect x="1740" y="320" width="8" height="12" rx="1" class="window-glow w-anim-1" />
        <rect x="1740" y="370" width="8" height="12" rx="1" class="window-glow w-anim-3" />
      </g>

      <!-- ================= SCENE 4: Patrolling Helicopters ================= -->
      <g v-if="activeEvent === 'COPTERS'">
        <!-- Left Helicopter patrolling -->
        <g class="copter-left">
          <!-- Spotlight facing right -->
          <polygon points="0,0 120,45 120,-45" fill="url(#spotlightGrad)" />
          <!-- Copter structure -->
          <rect x="-12" y="-5" width="24" height="10" rx="5" fill="#0c0a18" stroke="#00f0ff" stroke-width="1.8" filter="url(#neonGlow)" />
          <line x1="-12" y1="0" x2="-25" y2="-3" stroke="#00f0ff" stroke-width="1.5" />
          <rect x="-27" y="-6" width="4" height="6" fill="#00f0ff" />
          <line x1="0" y1="-5" x2="0" y2="-9" stroke="#00f0ff" stroke-width="1.5" />
          <ellipse cx="0" cy="-9" rx="22" ry="1.5" stroke="#00f0ff" stroke-width="1" class="rotor-spin" />
        </g>

        <!-- Right Helicopter patrolling -->
        <g class="copter-right">
          <!-- Spotlight facing left -->
          <polygon points="0,0 -120,45 -120,-45" fill="url(#spotlightGradLeft)" />
          <!-- Copter structure -->
          <rect x="-12" y="-5" width="24" height="10" rx="5" fill="#0c0a18" stroke="#ff007f" stroke-width="1.8" filter="url(#neonGlow)" />
          <line x1="12" y1="0" x2="25" y2="-3" stroke="#ff007f" stroke-width="1.5" />
          <rect x="23" y="-6" width="4" height="6" fill="#ff007f" />
          <line x1="0" y1="-5" x2="0" y2="-9" stroke="#ff007f" stroke-width="1.5" />
          <ellipse cx="0" cy="-9" rx="22" ry="1.5" stroke="#ff007f" stroke-width="1" class="rotor-spin" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.city-bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.city-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ================= BUILDING CONSTRUCTION ANIMATION ================= */
.build-rect, .build-path {
  transform-origin: 50% 540px;
  animation: build-fill 3.2s cubic-bezier(0.19, 1, 0.22, 1) both;
  animation-delay: inherit;
}

.build-stroke {
  transform-origin: 50% 540px;
  stroke-dasharray: 1800;
  stroke-dashoffset: 1800;
  animation: draw-outline 3.2s cubic-bezier(0.19, 1, 0.22, 1) both;
  animation-delay: inherit;
}

.build-spire {
  transform-origin: 50% 540px;
  animation: build-spire-anim 3.2s cubic-bezier(0.19, 1, 0.22, 1) both;
  animation-delay: inherit;
}

@keyframes draw-outline {
  0% {
    stroke-dashoffset: 1800;
  }
  65%, 100% {
    stroke-dashoffset: 0;
  }
}

@keyframes build-fill {
  0% {
    transform: scaleY(0);
    fill-opacity: 0;
  }
  30% {
    transform: scaleY(0);
    fill-opacity: 0;
  }
  100% {
    transform: scaleY(1);
    fill-opacity: 1;
  }
}

@keyframes build-spire-anim {
  0%, 45% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Delay configurations for each building group */
.b-far-1 { animation-delay: 0.1s; }
.b-far-2 { animation-delay: 0.3s; }
.b-far-3 { animation-delay: 0.5s; }
.b-far-4 { animation-delay: 0.7s; }
.b-far-5 { animation-delay: 0.9s; }
.b-far-6 { animation-delay: 1.1s; }
.b-far-7 { animation-delay: 1.3s; }
.b-far-8 { animation-delay: 1.5s; }

.b-mid-a { animation-delay: 1.2s; }
.b-mid-b { animation-delay: 1.5s; }
.b-mid-c { animation-delay: 1.8s; }
.b-mid-d { animation-delay: 2.1s; }
.b-mid-e { animation-delay: 2.4s; }
.b-mid-f { animation-delay: 2.7s; }
.b-mid-g { animation-delay: 3.0s; }
.b-mid-h { animation-delay: 3.3s; }


/* ================= FLASHING BEACON LIGHTS ================= */
.beacon-cyan {
  animation: beacon-blink 0.8s infinite alternate ease-in-out;
}
.beacon-magenta {
  animation: beacon-blink 1.2s infinite alternate ease-in-out;
  animation-delay: 0.3s;
}
.beacon-green {
  animation: beacon-blink 0.6s infinite alternate ease-in-out;
  animation-delay: 0.1s;
}

@keyframes beacon-blink {
  0% {
    opacity: 0.1;
    r: 1px;
    filter: drop-shadow(0 0 0px transparent);
  }
  100% {
    opacity: 1;
    r: 3.5px;
    filter: drop-shadow(0 0 4px currentColor);
  }
}


/* ================= UFO ABDUCTION ANIMATIONS ================= */
.ufo-group {
  animation: ufo-flight 12s linear forwards;
  transform-origin: 1230px 100px;
}

.ufo-ship {
  animation: ufo-bob 2.5s infinite ease-in-out;
}

.ufo-beam {
  animation: beam-glow 12s ease-in-out forwards;
  transform-origin: 1230px 100px;
}

.abducted-person {
  animation: person-float 12s ease-in-out forwards;
  transform-origin: 1230px 220px;
}

/* Rim lights flashing */
.ufo-rim-light-1 {
  animation: blink-rim-1 0.4s infinite alternate ease-in-out;
}
.ufo-rim-light-2 {
  animation: blink-rim-2 0.4s infinite alternate ease-in-out;
}

@keyframes ufo-flight {
  0% {
    transform: translate(-700px, -200px) scale(0.3) rotate(-15deg);
    opacity: 0;
  }
  /* Flies in fast, slows down and stops */
  15% {
    transform: translate(0px, 0px) scale(1) rotate(0deg);
    opacity: 1;
  }
  /* Hovers while abduction occurs */
  85% {
    transform: translate(0px, 0px) scale(1) rotate(0deg);
    opacity: 1;
  }
  /* Zips away extremely fast to the right and top */
  95%, 100% {
    transform: translate(800px, -300px) scale(0.2) rotate(25deg);
    opacity: 0;
  }
}

@keyframes ufo-bob {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes beam-glow {
  0%, 20% {
    opacity: 0;
    transform: scaleX(0);
  }
  /* Turns on and pulses */
  25% {
    opacity: 0.75;
    transform: scaleX(1);
  }
  70% {
    opacity: 0.85;
    transform: scaleX(1.1);
  }
  /* Turns off after abduction is complete */
  75%, 100% {
    opacity: 0;
    transform: scaleX(0);
  }
}

@keyframes person-float {
  0%, 22% {
    opacity: 1;
    transform: translateY(0px) scale(1) rotate(0deg);
  }
  /* Pulled up into the beam */
  28% {
    opacity: 1;
    transform: translateY(-15px) scale(0.9) rotate(10deg);
  }
  65% {
    opacity: 0.9;
    transform: translateY(-90px) scale(0.55) rotate(-20deg);
  }
  /* Enters ship and becomes invisible */
  70%, 100% {
    opacity: 0;
    transform: translateY(-110px) scale(0.1) rotate(45deg);
  }
}

@keyframes blink-rim-1 {
  0% { fill: #ff007f; filter: drop-shadow(0 0 2px #ff007f); }
  100% { fill: #fff; filter: none; }
}

@keyframes blink-rim-2 {
  0% { fill: #fff; filter: none; }
  100% { fill: #00f0ff; filter: drop-shadow(0 0 2px #00f0ff); }
}


/* ================= COMET ANIMATIONS ================= */
.comet-group {
  animation: comet-move 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes comet-move {
  0% {
    transform: translate(0px, 0px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translate(-2100px, 50px); /* Moves almost horizontally to the left, remaining high in the sky */
    opacity: 0;
  }
}


/* ================= RANDOM WINDOW LIGHTS ANIMATIONS ================= */
.window-glow {
  opacity: 0;
  filter: drop-shadow(0 0 3px currentColor);
}

.w-anim-1 {
  animation: window-flicker-1 10s ease-in-out forwards;
}

.w-anim-2 {
  animation: window-flicker-2 10s ease-in-out forwards;
}

.w-anim-3 {
  animation: window-flicker-3 10s ease-in-out forwards;
}

@keyframes window-flicker-1 {
  0%, 100% { opacity: 0; }
  10%, 40% { opacity: 0.85; fill: #fff200; color: #fff200; }
  45%, 70% { opacity: 0; }
  75%, 95% { opacity: 0.9; fill: #00f0ff; color: #00f0ff; }
}

@keyframes window-flicker-2 {
  0%, 15% { opacity: 0; }
  25%, 55% { opacity: 0.9; fill: #ff007f; color: #ff007f; }
  60%, 80% { opacity: 0; }
  85%, 98% { opacity: 0.85; fill: #fff200; color: #fff200; }
  100% { opacity: 0; }
}

@keyframes window-flicker-3 {
  0%, 30% { opacity: 0; }
  40%, 65% { opacity: 0.85; fill: #00f0ff; color: #00f0ff; }
  70%, 85% { opacity: 0; }
  90%, 97% { opacity: 0.95; fill: #ff007f; color: #ff007f; }
  100% { opacity: 0; }
}


/* ================= PATROLLING HELICOPTER ANIMATIONS ================= */
.copter-left {
  animation: copter-left-anim 14s ease-in-out forwards;
}

.copter-right {
  animation: copter-right-anim 14s ease-in-out forwards;
}

.rotor-spin {
  animation: rotor-rotate 0.08s infinite linear;
}

@keyframes rotor-rotate {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(0.05); }
  100% { transform: scaleX(1); }
}

@keyframes copter-left-anim {
  0% {
    transform: translate(-150px, 180px) scale(0.85) rotate(5deg);
    opacity: 0;
  }
  10% {
    opacity: 0.95;
    transform: translate(200px, 170px) scale(0.85) rotate(3deg);
  }
  30% {
    transform: translate(600px, 200px) scale(0.9) rotate(-4deg);
  }
  50% {
    transform: translate(950px, 160px) scale(0.8) rotate(5deg);
  }
  70% {
    transform: translate(1300px, 210px) scale(0.9) rotate(-3deg);
  }
  90% {
    transform: translate(1750px, 170px) scale(0.85) rotate(4deg);
    opacity: 0.95;
  }
  100% {
    transform: translate(2100px, 150px) scale(0.85) rotate(0deg);
    opacity: 0;
  }
}

@keyframes copter-right-anim {
  0% {
    transform: translate(2050px, 240px) scale(0.9) rotate(-5deg);
    opacity: 0;
  }
  10% {
    opacity: 0.95;
    transform: translate(1700px, 230px) scale(0.9) rotate(-2deg);
  }
  30% {
    transform: translate(1350px, 190px) scale(0.8) rotate(4deg);
  }
  50% {
    transform: translate(980px, 250px) scale(0.9) rotate(-5deg);
  }
  70% {
    transform: translate(620px, 180px) scale(0.8) rotate(3deg);
  }
  90% {
    transform: translate(180px, 220px) scale(0.9) rotate(-4deg);
    opacity: 0.95;
  }
  100% {
    transform: translate(-200px, 200px) scale(0.9) rotate(0deg);
    opacity: 0;
  }
}
</style>
