// Project Metropolys - Board Configuration Data (MVP 1)
// Designed for internal Phaser resolution of 1600 x 900.
// Coordinates layout: A large rectangular track centering the board on canvas.

export const boardSlots = [
  {
    id: 0,
    name: "Partida (START)",
    type: "START",
    x: 200,
    y: 100,
    color: "#4F46E5", // Indigo accent for Start
    description: "Ganhe +200 ao passar por aqui"
  },
  {
    id: 1,
    name: "Avenida Paulista A",
    type: "PROPERTY",
    neighborhood: "Zona Central (Red)",
    color: "#EF4444", // Red
    cost: 120,
    rent: 12,
    x: 440,
    y: 100
  },
  {
    id: 2,
    name: "Avenida Paulista B",
    type: "PROPERTY",
    neighborhood: "Zona Central (Red)",
    color: "#EF4444", // Red
    cost: 140,
    rent: 14,
    x: 680,
    y: 100
  },
  {
    id: 3,
    name: "Avenida Paulista C",
    type: "PROPERTY",
    neighborhood: "Zona Central (Red)",
    color: "#EF4444", // Red
    cost: 160,
    rent: 16,
    x: 920,
    y: 100
  },
  {
    id: 4,
    name: "Imposto Predial",
    type: "TAX",
    color: "#6B7280", // Grey
    cost: 150,
    x: 1160,
    y: 100,
    description: "Pague 150 ao banco"
  },
  {
    id: 5,
    name: "Copacabana A",
    type: "PROPERTY",
    neighborhood: "Zona Sul (Blue)",
    color: "#3B82F6", // Blue
    cost: 200,
    rent: 20,
    x: 1400,
    y: 100
  },
  {
    id: 6,
    name: "Copacabana B",
    type: "PROPERTY",
    neighborhood: "Zona Sul (Blue)",
    color: "#3B82F6", // Blue
    cost: 220,
    rent: 22,
    x: 1400,
    y: 230
  },
  {
    id: 7,
    name: "Event Slot A",
    type: "EVENT",
    color: "#8B5CF6", // Purple Event
    x: 1400,
    y: 360,
    description: "Sorte ou Revés"
  },
  {
    id: 8,
    name: "Copacabana C",
    type: "PROPERTY",
    neighborhood: "Zona Sul (Blue)",
    color: "#3B82F6", // Blue
    cost: 240,
    rent: 24,
    x: 1400,
    y: 490
  },
  {
    id: 9,
    name: "Copacabana D",
    type: "PROPERTY",
    neighborhood: "Zona Sul (Blue)",
    color: "#3B82F6", // Blue
    cost: 260,
    rent: 26,
    x: 1400,
    y: 620
  },
  {
    id: 10,
    name: "Savassi A",
    type: "PROPERTY",
    neighborhood: "Zona Leste (Green)",
    color: "#10B981", // Green
    cost: 300,
    rent: 30,
    x: 1400,
    y: 750
  },
  {
    id: 11,
    name: "Savassi B",
    type: "PROPERTY",
    neighborhood: "Zona Leste (Green)",
    color: "#10B981", // Green
    cost: 320,
    rent: 32,
    x: 1160,
    y: 750
  },
  {
    id: 12,
    name: "Taxa de Luxo",
    type: "TAX",
    color: "#6B7280", // Grey
    cost: 200,
    x: 920,
    y: 750,
    description: "Pague 200 ao banco"
  },
  {
    id: 13,
    name: "Savassi C",
    type: "PROPERTY",
    neighborhood: "Zona Leste (Green)",
    color: "#10B981", // Green
    cost: 350,
    rent: 35,
    x: 680,
    y: 750
  },
  {
    id: 14,
    name: "Savassi D",
    type: "PROPERTY",
    neighborhood: "Zona Leste (Green)",
    color: "#10B981", // Green
    cost: 400,
    rent: 40,
    x: 440,
    y: 750
  },
  {
    id: 15,
    name: "Batista Campos A",
    type: "PROPERTY",
    neighborhood: "Zona Norte (Yellow)",
    color: "#F59E0B", // Yellow
    cost: 70,
    rent: 7,
    x: 200,
    y: 750
  },
  {
    id: 16,
    name: "Batista Campos B",
    type: "PROPERTY",
    neighborhood: "Zona Norte (Yellow)",
    color: "#F59E0B", // Yellow
    cost: 90,
    rent: 9,
    x: 200,
    y: 620
  },
  {
    id: 17,
    name: "Event Slot B",
    type: "EVENT",
    color: "#8B5CF6", // Purple Event
    x: 200,
    y: 490,
    description: "Sorte ou Revés"
  },
  {
    id: 18,
    name: "Batista Campos C",
    type: "PROPERTY",
    neighborhood: "Zona Norte (Yellow)",
    color: "#F59E0B", // Yellow
    cost: 100,
    rent: 10,
    x: 200,
    y: 360
  },
  {
    id: 19,
    name: "Batista Campos D",
    type: "PROPERTY",
    neighborhood: "Zona Norte (Yellow)",
    color: "#F59E0B", // Yellow
    cost: 110,
    rent: 11,
    x: 200,
    y: 230
  }
];
