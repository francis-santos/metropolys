import Phaser from 'phaser';
import { gameStore } from './gameStore';

export class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BoardScene' });
    this.tokens = {}; // playerId -> Phaser.GameObjects.Container
    this.slotVisuals = []; // slotId -> { card, ownerIndicator }
  }

  preload() {
    // Load city pack custom backgrounds
    this.load.image('bg-salvador', '/bg-salvador.png');
    this.load.image('bg-sao-paulo', '/bg-sao-paulo.png');
    this.load.image('bg-rio-de-janeiro', '/bg-rio-de-janeiro.png');

    // Preload our 8 player pins
    for (let i = 1; i <= 8; i++) {
      this.load.image(`pin-${i}`, `/pins/pin-${i}.png`);
    }
  }

  create() {
    // Register procedural card backgrounds
    this.createProceduralSlotTextures();

    // Process pin textures to remove black background
    this.processPinTextures();

    // Render the custom background image based on the active city config
    this.renderBackgroundImage();

    // Draw background gradient / star grid procedurally
    this.createBackground();

    // Draw central city skyline illustration procedurally
    this.createSkyline();

    // Draw connecting path lines between slots
    this.drawPathLines();

    // Draw slot cards
    this.drawSlots();

    // Spawn player tokens
    this.spawnTokens();

    // Setup dice container and graphics
    this.diceContainer = this.add.container(800, 450);
    this.diceContainer.setDepth(50); // Float above tokens and slot visuals
    this.diceContainer.setVisible(false);

    this.die1Graphics = this.add.graphics();
    this.die2Graphics = this.add.graphics();
    this.die1Graphics.setPosition(-55, 0);
    this.die2Graphics.setPosition(55, 0);

    this.diceContainer.add(this.die1Graphics);
    this.diceContainer.add(this.die2Graphics);

    // Set up window event listeners to bridge Vue controls
    window.addEventListener('phaser-roll-dice', this.handleRollDice.bind(this));
    window.addEventListener('phaser-reset-board', this.handleResetBoard.bind(this));
    window.addEventListener('phaser-sync-board', this.handleSyncBoard.bind(this));
  }

  createBackground() {
    // Clear and draw grid lines for a sci-fi/technological style
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1E293B, 0.4);

    // Vertical grid lines
    for (let x = 0; x < 1600; x += 50) {
      grid.lineBetween(x, 0, x, 900);
    }
    // Horizontal grid lines
    for (let y = 0; y < 900; y += 50) {
      grid.lineBetween(0, y, 1600, y);
    }

    // Outer border glowing effect
    const border = this.add.graphics();
    border.lineStyle(3, 0x6366F1, 0.15);
    border.strokeRect(5, 5, 1590, 890);
  }

  renderBackgroundImage() {
    const cityId = gameStore.activeCityConfig?.id || 'salvador';
    const bgKey = `bg-${cityId}`;
    if (this.textures.exists(bgKey)) {
      const bg = this.add.image(800, 450, bgKey);
      
      // Calculate scale to cover 1600x900 without stretching (maintaining aspect ratio)
      const scaleX = 1600 / bg.width;
      const scaleY = 900 / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale);
      
      // Make it slightly transparent so it fits subtly into the dark game board theme
      bg.setAlpha(0.22);
      
      bg.setDepth(-10); // Draw at the bottom depth
    }
  }

  createSkyline() {
    const cityId = gameStore.activeCityConfig?.id;
    if (cityId && this.textures.exists(`bg-${cityId}`)) {
      // If we have a custom background image, render the glowing game title over it, but bypass buildings
      const titleText = this.add.text(800, 430, 'METROPOLYS', {
        fontFamily: 'Outfit',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 10
      });
      titleText.setOrigin(0.5);
      titleText.setAlpha(0.12);
      return;
    }

    const skyline = this.add.graphics();
    const configTheme = gameStore.activeCityConfig?.theme;
    const glowColor = configTheme?.skylineGlow ?? 0x8B5CF6;
    const fillColor = configTheme?.skylineColor ?? 0x0F172A;
    
    // Draw background hills/distant buildings
    skyline.fillStyle(fillColor, 0.5);
    // Draw a series of tall building silhouettes in the center area (around X: 500 to 1100, Y: 250 to 650)
    const buildings = [
      { x: 500, w: 70, h: 220 },
      { x: 560, w: 90, h: 300 },
      { x: 640, w: 80, h: 200 },
      { x: 700, w: 100, h: 350 },
      { x: 790, w: 70, h: 260 },
      { x: 850, w: 110, h: 380 },
      { x: 950, w: 60, h: 180 },
      { x: 1000, w: 85, h: 280 },
      { x: 1070, w: 75, h: 210 }
    ];

    buildings.forEach(b => {
      // Shadow building
      skyline.fillStyle(fillColor, 0.7);
      skyline.fillRect(b.x, 700 - b.h, b.w, b.h);
      
      // Front glowing edges
      skyline.lineStyle(1, glowColor, 0.3);
      skyline.strokeRect(b.x, 700 - b.h, b.w, b.h);

      // Procedural windows
      const cols = Math.floor(b.w / 18);
      const rows = Math.floor(b.h / 25);
      skyline.fillStyle(Math.random() > 0.5 ? 0xF59E0B : 0x06B6D4, 0.2); // Amber or Cyan windows
      
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.4) { // Only light up some windows
            skyline.fillRect(b.x + 8 + (c * 16), 700 - b.h + 10 + (r * 20), 6, 8);
          }
        }
      }
    });

    // Add a glowing title badge in the center
    const titleText = this.add.text(800, 430, 'METROPOLYS', {
      fontFamily: 'Outfit',
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      letterSpacing: 10
    });
    titleText.setOrigin(0.5);
    titleText.setAlpha(0.08);
  }

  drawPathLines() {
    const pathGraphics = this.add.graphics();
    pathGraphics.lineStyle(3, 0x6366F1, 0.2);

    // Draw paths connecting each slot in the circular track
    for (let i = 0; i < gameStore.boardSlots.length; i++) {
      const current = gameStore.boardSlots[i];
      const next = gameStore.boardSlots[(i + 1) % gameStore.boardSlots.length];
      pathGraphics.lineBetween(current.x, current.y, next.x, next.y);
    }
  }

  drawSlots() {
    gameStore.boardSlots.forEach(slot => {
      const card = this.add.container(slot.x, slot.y);

      // Render card background template
      let bgKey = 'slot-bg-property';
      if (slot.type === 'START') bgKey = 'slot-bg-start';
      else if (slot.type === 'TAX') bgKey = 'slot-bg-tax';
      else if (slot.type === 'EVENT') bgKey = 'slot-bg-event';

      if (this.textures.exists(bgKey)) {
        const bgImg = this.add.image(0, 0, bgKey);
        card.add(bgImg);
      } else {
        // Fallback: draw basic card shape
        const bg = this.add.graphics();
        bg.fillStyle(0x1E293B, 0.85);
        bg.lineStyle(2, 0x334155, 1);
        bg.fillRoundedRect(-80, -45, 160, 90, 8);
        bg.strokeRoundedRect(-80, -45, 160, 90, 8);
        card.add(bg);
      }

      // Top color bar for properties
      if (slot.type === 'PROPERTY') {
        const topBar = this.add.graphics();
        const barColor = Phaser.Display.Color.HexStringToColor(slot.color).color;
        topBar.fillStyle(barColor, 1);
        topBar.fillRoundedRect(-76, -41, 152, 12, { tl: 6, tr: 6, bl: 0, br: 0 });
        card.add(topBar);
      }

      // Slot text details (High DPI rendering to prevent pixelation/aliasing)
      const nameFontSize = slot.name.length > 15 ? '20px' : '22px';
      const nameText = this.add.text(0, -10, slot.name, {
        fontFamily: 'Outfit',
        fontSize: nameFontSize,
        fontWeight: 'bold',
        color: '#F8FAFC',
        wordWrap: { width: 280, useAdvancedWrap: true },
        align: 'center'
      });
      nameText.setOrigin(0.5);
      nameText.setScale(0.5);
      card.add(nameText);

      // Bottom label (Price, Type, etc.)
      let label = '';
      let labelColor = '#94A3B8';
      
      if (slot.type === 'PROPERTY') {
        label = `$${slot.cost} M`;
        labelColor = '#38BDF8';
      } else if (slot.type === 'TAX') {
        label = 'IMPOSTO';
        labelColor = '#F87171';
      } else if (slot.type === 'EVENT') {
        label = 'SORTE/REVÉS';
        labelColor = '#C084FC';
      } else if (slot.type === 'START') {
        label = 'RECEBA +200';
        labelColor = '#34D399';
        // Add a gold/green tint for start
        const startBar = this.add.graphics();
        startBar.fillStyle(0x10B981, 0.15);
        startBar.fillRoundedRect(-80, -45, 160, 90, 8);
        card.add(startBar);
      }

      const labelText = this.add.text(0, 22, label, {
        fontFamily: 'Outfit',
        fontSize: '20px',
        fontWeight: '600',
        color: labelColor
      });
      labelText.setOrigin(0.5);
      labelText.setScale(0.5);
      card.add(labelText);

      // Small ribbon for Owner Indicator (initially hidden/invisible)
      const ownerIndicator = this.add.graphics();
      card.add(ownerIndicator);

      this.slotVisuals[slot.id] = { card, ownerIndicator };
    });
  }

  handleSyncBoard() {
    const playerCount = gameStore.players.length;
    if (Object.keys(this.tokens).length !== playerCount) {
      this.spawnTokens();
    } else {
      // If we are currently animating a roll or movement, do not teleport the tokens immediately
      if (!gameStore.isAnimating) {
        gameStore.players.forEach(p => {
          const token = this.tokens[p.id];
          if (token) {
            const coords = this.getPlayerOffsetCoords(p.id, p.position || 0);
            if (!this.tweens.isTweening(token)) {
              token.setPosition(coords.x, coords.y);
            }
          }
        });
      }
    }
    this.syncOwnershipIndicators();
  }

  spawnTokens() {
    // Destroy existing tokens if resetting
    Object.values(this.tokens).forEach(t => t.destroy());
    this.tokens = {};

    gameStore.players.forEach((p, idx) => {
      const container = this.add.container(0, 0);

      const hexColor = Phaser.Display.Color.HexStringToColor(p.color).color;
      const pinKey = p.pin || `pin-${(idx % 8) + 1}`;
      const transparentPinKey = `${pinKey}-transparent`;
      const finalPinKey = this.textures.exists(transparentPinKey) ? transparentPinKey : pinKey;

      if (this.textures.exists(finalPinKey)) {
        // Drop shadow underneath the pawn base
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.7);
        shadow.fillEllipse(0, 18, 16, 6);
        container.add(shadow);

        // Player colored base glow ring to identify owner
        const baseGlow = this.add.graphics();
        baseGlow.lineStyle(2.5, hexColor, 0.6);
        baseGlow.strokeEllipse(0, 18, 18, 7);
        container.add(baseGlow);

        const pinImg = this.add.image(0, 0, finalPinKey);
        // Scale pin image to stand nicely on the slots
        const targetSize = 42;
        const scale = targetSize / Math.max(pinImg.width, pinImg.height);
        pinImg.setScale(scale);
        container.add(pinImg);
      } else {
        // Fallback: draw circular token fill and number
        const ring = this.add.graphics();
        ring.lineStyle(3, 0xFFFFFF, 1);
        ring.strokeCircle(0, 0, 16);
        
        const fill = this.add.graphics();
        fill.fillStyle(hexColor, 1);
        fill.fillCircle(0, 0, 14);
        
        const numText = this.add.text(0, 0, String(idx + 1), {
          fontFamily: 'Outfit',
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#FFFFFF'
        });
        numText.setOrigin(0.5);
        numText.setScale(0.5);
        
        container.add(ring);
        container.add(fill);
        container.add(numText);
      }

      container.setDepth(10); // Tokens float above slots

      // Position token at actual position with offset
      const coords = this.getPlayerOffsetCoords(p.id, p.position || 0);
      container.setPosition(coords.x, coords.y);

      this.tokens[p.id] = container;
    });
  }

  processPinTextures() {
    for (let i = 1; i <= 8; i++) {
      const pinKey = `pin-${i}`;
      if (this.textures.exists(pinKey)) {
        const texture = this.textures.get(pinKey);
        const sourceImage = texture.getSourceImage();
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = sourceImage.width;
        canvas.height = sourceImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sourceImage, 0, 0);
        
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          
          // Background removal threshold (pixels below this sum/value are removed)
          const threshold = 22;
          for (let j = 0; j < data.length; j += 4) {
            const r = data[j];
            const g = data[j+1];
            const b = data[j+2];
            
            if (r < threshold && g < threshold && b < threshold) {
              data[j+3] = 0; // Transparent
            }
          }
          ctx.putImageData(imgData, 0, 0);
          
          // Add as a new transparent texture
          this.textures.addCanvas(`${pinKey}-transparent`, canvas);
        } catch (e) {
          console.error(`Failed to process texture for ${pinKey}:`, e);
        }
      }
    }
  }

  // Calculate layout offset for players sharing a slot, avoiding token overlap
  getPlayerOffsetCoords(playerId, slotId) {
    const slot = gameStore.boardSlots[slotId];
    if (!slot) return { x: 0, y: 0 };
    let dx = 0;
    let dy = 0;

    const playerIndex = gameStore.players.findIndex(p => p.id === playerId);
    const index = playerIndex === -1 ? 0 : playerIndex;

    switch (index) {
      case 0:
        dx = -25;
        dy = -15;
        break;
      case 1:
        dx = 25;
        dy = -15;
        break;
      case 2:
        dx = -25;
        dy = 20;
        break;
      case 3:
        dx = 25;
        dy = 20;
        break;
    }

    return { x: slot.x + dx, y: slot.y + dy };
  }

  drawDieFace(graphics, value) {
    graphics.clear();
    
    // Shadow block
    graphics.fillStyle(0x020617, 0.4);
    graphics.fillRoundedRect(-27, -27, 60, 60, 10);

    // Main die face
    graphics.fillStyle(0xFFFFFF, 0.95);
    graphics.lineStyle(2.5, 0x1E293B, 1);
    graphics.fillRoundedRect(-30, -30, 60, 60, 10);
    graphics.strokeRoundedRect(-30, -30, 60, 60, 10);

    // Face dots
    graphics.fillStyle(0x0F172A, 1);
    const r = 4.5; // dot radius
    const drawDot = (cx, cy) => graphics.fillCircle(cx, cy, r);

    if (value === 1) {
      drawDot(0, 0);
    } else if (value === 2) {
      drawDot(-14, -14);
      drawDot(14, 14);
    } else if (value === 3) {
      drawDot(-14, -14);
      drawDot(0, 0);
      drawDot(14, 14);
    } else if (value === 4) {
      drawDot(-14, -14);
      drawDot(14, -14);
      drawDot(-14, 14);
      drawDot(14, 14);
    } else if (value === 5) {
      drawDot(-14, -14);
      drawDot(14, -14);
      drawDot(0, 0);
      drawDot(-14, 14);
      drawDot(14, 14);
    } else if (value === 6) {
      drawDot(-14, -14);
      drawDot(14, -14);
      drawDot(-14, 0);
      drawDot(14, 0);
      drawDot(-14, 14);
      drawDot(14, 14);
    }
  }

  handleRollDice(event) {
    const { playerId, roll, die1, die2, from, to } = event.detail;
    
    // Lock animations state immediately to block updates/teleports on all clients
    gameStore.isAnimating = true;
    gameStore.displayedDiceResult = null;
    gameStore.displayedDie1 = null;
    gameStore.displayedDie2 = null;
    
    // Resolve fallback if die1/die2 aren't present (robustness)
    const d1 = die1 || Math.floor(roll / 2) || 1;
    const d2 = die2 || (roll - d1) || 1;

    // Show dice container in center
    this.diceContainer.setVisible(true);
    this.diceContainer.setScale(0.1);
    this.diceContainer.setAlpha(0);

    // Zoom-in fade-in animation
    this.tweens.add({
      targets: this.diceContainer,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Animate rolling values and angles procedurally
    let rollTimer = this.time.addEvent({
      delay: 60,
      callback: () => {
        const val1 = Math.floor(Math.random() * 6) + 1;
        const val2 = Math.floor(Math.random() * 6) + 1;
        this.drawDieFace(this.die1Graphics, val1);
        this.drawDieFace(this.die2Graphics, val2);
        
        this.die1Graphics.setAngle(Math.random() * 360);
        this.die2Graphics.setAngle(Math.random() * 360);
        this.die1Graphics.setPosition(-55 + Math.random() * 30 - 15, Math.random() * 30 - 15);
        this.die2Graphics.setPosition(55 + Math.random() * 30 - 15, Math.random() * 30 - 15);
      },
      repeat: 25 // 25 * 60ms = 1.5 seconds of physical rolling simulation
    });

    // When roll simulation ends, show final faces, pop, pause, and trigger movement
    this.time.delayedCall(1560, () => {
      this.drawDieFace(this.die1Graphics, d1);
      this.drawDieFace(this.die2Graphics, d2);
      this.die1Graphics.setAngle(0);
      this.die2Graphics.setAngle(0);
      this.die1Graphics.setPosition(-55, 0);
      this.die2Graphics.setPosition(55, 0);

      // Bounce/Pop feedback
      this.tweens.add({
        targets: this.diceContainer,
        scale: 1.25,
        duration: 150,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          // Wait 800ms for player to read, then zoom out and start moving pieces
          this.time.delayedCall(800, () => {
            this.tweens.add({
              targets: this.diceContainer,
              scale: 0.1,
              alpha: 0,
              duration: 300,
              ease: 'Back.easeIn',
              onComplete: () => {
                this.diceContainer.setVisible(false);

                // Update displayed dice values on gameStore now that the dice are fully hidden and roll animation is complete
                gameStore.displayedDiceResult = roll;
                gameStore.displayedDie1 = d1;
                gameStore.displayedDie2 = d2;

                // Run actual movement steps
                const token = this.tokens[playerId];
                if (!token) return;

                const totalSlots = gameStore.boardSlots.length;
                const path = [];
                let current = from;
                for (let i = 0; i < roll; i++) {
                  current = (current + 1) % totalSlots;
                  path.push(current);
                }

                this.animatePathSteps(token, playerId, path, 0, () => {
                  this.syncOwnershipIndicators();
                  if (!gameStore.isMultiplayer || playerId === gameStore.myPlayerId) {
                    gameStore.onMovementComplete(to);
                  } else {
                    gameStore.isAnimating = false; // release spectator lock
                  }
                });
              }
            });
          });
        }
      });
    });
  }

  animatePathSteps(token, playerId, path, index, onComplete) {
    if (index >= path.length) {
      onComplete();
      return;
    }

    const nextSlotId = path[index];
    const targetCoords = this.getPlayerOffsetCoords(playerId, nextSlotId);

    this.tweens.add({
      targets: token,
      x: targetCoords.x,
      y: targetCoords.y,
      duration: 250, // fast, snappy step animation
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Recurse to next step
        this.animatePathSteps(token, playerId, path, index + 1, onComplete);
      }
    });
  }

  // Draw colorful flags on properties matching owner's colors
  syncOwnershipIndicators() {
    gameStore.boardSlots.forEach(slot => {
      const visual = this.slotVisuals[slot.id];
      if (!visual) return;

      const indicator = visual.ownerIndicator;
      indicator.clear();

      if (slot.type === 'PROPERTY' && slot.ownerId !== null) {
        const owner = gameStore.players.find(p => p.id === slot.ownerId);
        if (owner && !owner.isBankrupt) {
          const ownerHex = Phaser.Display.Color.HexStringToColor(owner.color).color;
          // Draw a small colorful owner ribbon at the bottom of the slot card
          indicator.fillStyle(ownerHex, 1);
          indicator.fillRoundedRect(-80, 35, 160, 10, { tl: 0, tr: 0, bl: 8, br: 8 });
        }
      }
    });
  }

  handleResetBoard() {
    this.spawnTokens();
    
    // Clear all ownership indicators
    gameStore.boardSlots.forEach(slot => {
      const visual = this.slotVisuals[slot.id];
      if (visual) {
        visual.ownerIndicator.clear();
      }
    });
  }

  createProceduralSlotTextures() {
    const drawTemplate = (key, fillStyle, drawExtra) => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      
      // Base background card (rounded corner glass look)
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 82, 10);
      ctx.fill();
      
      // Extra details (grid, warning stripes, circuits, etc.)
      drawExtra(ctx);
      
      this.textures.addCanvas(key, canvas);
    };

    // 1. Property Slot Background
    drawTemplate('slot-bg-property', '#0D0E15', (ctx) => {
      // Draw tech grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 15; x < 160; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 90); ctx.stroke();
      }
      for (let y = 15; y < 90; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(160, y); ctx.stroke();
      }
      
      // Corner brackets (neon cyan)
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.5;
      
      // Top-left
      ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(8, 8); ctx.lineTo(18, 8); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(152, 18); ctx.lineTo(152, 8); ctx.lineTo(142, 8); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(8, 72); ctx.lineTo(8, 82); ctx.lineTo(18, 82); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(152, 72); ctx.lineTo(152, 82); ctx.lineTo(142, 82); ctx.stroke();
      
      // Outer border stroke
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 82, 10);
      ctx.stroke();
    });

    // 2. Start Slot Background
    drawTemplate('slot-bg-start', '#1A1405', (ctx) => {
      // Golden circuit background lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, 45); ctx.lineTo(50, 45); ctx.lineTo(70, 25);
      ctx.moveTo(150, 45); ctx.lineTo(110, 45); ctx.lineTo(90, 65);
      ctx.stroke();
      
      // Corner brackets (gold/amber)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(8, 8); ctx.lineTo(18, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 18); ctx.lineTo(152, 8); ctx.lineTo(142, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, 72); ctx.lineTo(8, 82); ctx.lineTo(18, 82); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 72); ctx.lineTo(152, 82); ctx.lineTo(142, 82); ctx.stroke();

      // Outer border stroke
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 82, 10);
      ctx.stroke();
    });

    // 3. Tax Slot Background
    drawTemplate('slot-bg-tax', '#1A0808', (ctx) => {
      // Red hazard stripes
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.lineWidth = 4;
      for (let i = -20; i < 200; i += 15) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 30, 90); ctx.stroke();
      }

      // Corner brackets (red warning)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(8, 8); ctx.lineTo(18, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 18); ctx.lineTo(152, 8); ctx.lineTo(142, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, 72); ctx.lineTo(8, 82); ctx.lineTo(18, 82); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 72); ctx.lineTo(152, 82); ctx.lineTo(142, 82); ctx.stroke();

      // Outer border stroke
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 82, 10);
      ctx.stroke();
    });

    // 4. Event Slot Background
    drawTemplate('slot-bg-event', '#0F061E', (ctx) => {
      // Dot matrix pattern
      ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
      for (let x = 20; x < 150; x += 30) {
        for (let y = 15; y < 80; y += 20) {
          ctx.beginPath(); ctx.arc(x + (y % 4), y, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Corner brackets (neon purple)
      ctx.strokeStyle = '#A78BFA';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(8, 8); ctx.lineTo(18, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 18); ctx.lineTo(152, 8); ctx.lineTo(142, 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, 72); ctx.lineTo(8, 82); ctx.lineTo(18, 82); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(152, 72); ctx.lineTo(152, 82); ctx.lineTo(142, 82); ctx.stroke();

      // Outer border stroke
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(4, 4, 152, 82, 10);
      ctx.stroke();
    });
  }

  update() {
    // Dynamic updates if needed
  }
}
