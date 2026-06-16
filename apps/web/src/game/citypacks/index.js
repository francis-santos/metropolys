// Project Metropolys - City Packs Configurations (Brazil Pack I)
// Maintains 20-slot coordinate layouts matching original boardcene paths

export const cityPacks = {
  salvador: {
    id: 'salvador',
    name: 'Salvador',
    packName: 'América do Sul - Brasil Pack I',
    startingCapital: 1500,
    theme: {
      primary: '#F59E0B', // Gold/Amber
      secondary: '#EF4444', // Red
      background: '#181003', // Warm dark
      skylineGlow: 0xF59E0B,
      skylineColor: 0x3F2B0F,
    },
    slots: [
      { id: 0, name: "Partida (START)", type: "START", color: "#F59E0B", description: "Ganhe +200 ao passar" },
      { id: 1, name: "Pelourinho A", type: "PROPERTY", neighborhood: "Pelourinho", color: "#EF4444", cost: 120, rent: 12 },
      { id: 2, name: "Pelourinho B", type: "PROPERTY", neighborhood: "Pelourinho", color: "#EF4444", cost: 140, rent: 14 },
      { id: 3, name: "Elevador Lacerda", type: "PROPERTY", neighborhood: "Pelourinho", color: "#EF4444", cost: 160, rent: 16 },
      { id: 4, name: "Taxa Municipal", type: "TAX", color: "#6B7280", cost: 150, description: "Pague 150" },
      { id: 5, name: "Barra A", type: "PROPERTY", neighborhood: "Barra", color: "#3B82F6", cost: 200, rent: 20 },
      { id: 6, name: "Barra B", type: "PROPERTY", neighborhood: "Barra", color: "#3B82F6", cost: 220, rent: 22 },
      { id: 7, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés Salvador" },
      { id: 8, name: "Farol da Barra", type: "PROPERTY", neighborhood: "Barra", color: "#3B82F6", cost: 240, rent: 24 },
      { id: 9, name: "Porto da Barra", type: "PROPERTY", neighborhood: "Barra", color: "#3B82F6", cost: 260, rent: 26 },
      { id: 10, name: "Rio Vermelho A", type: "PROPERTY", neighborhood: "Rio Vermelho", color: "#10B981", cost: 300, rent: 30 },
      { id: 11, name: "Rio Vermelho B", type: "PROPERTY", neighborhood: "Rio Vermelho", color: "#10B981", cost: 320, rent: 32 },
      { id: 12, name: "Taxa Turística", type: "TAX", color: "#6B7280", cost: 200, description: "Pague 200" },
      { id: 13, name: "Largo da Dinha", type: "PROPERTY", neighborhood: "Rio Vermelho", color: "#10B981", cost: 350, rent: 35 },
      { id: 14, name: "Rio Vermelho C", type: "PROPERTY", neighborhood: "Rio Vermelho", color: "#10B981", cost: 400, rent: 40 },
      { id: 15, name: "Caminho das Árvores A", type: "PROPERTY", neighborhood: "C. das Árvores", color: "#EC4899", cost: 70, rent: 7 },
      { id: 16, name: "Caminho das Árvores B", type: "PROPERTY", neighborhood: "C. das Árvores", color: "#EC4899", cost: 90, rent: 9 },
      { id: 17, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés Salvador" },
      { id: 18, name: "Alameda das Espatódeas", type: "PROPERTY", neighborhood: "C. das Árvores", color: "#EC4899", cost: 100, rent: 10 },
      { id: 19, name: "Tancredo Neves", type: "PROPERTY", neighborhood: "C. das Árvores", color: "#EC4899", cost: 110, rent: 11 },
    ],
    events: [
      { text: "Turistas lotam o Pelourinho no Carnaval! Receba +150", amount: 150 },
      { text: "Manutenção obrigatória de fachada histórica no Pelourinho. Pague 100", amount: -100 },
      { text: "Sucesso no Festival de Verão! Receba +200", amount: 200 },
      { text: "Taxa de licença de ambulante na Barra. Pague 50", amount: -50 },
    ],
  },
  'sao-paulo': {
    id: 'sao-paulo',
    name: 'São Paulo',
    packName: 'América do Sul - Brasil Pack I',
    startingCapital: 1500,
    theme: {
      primary: '#10B981', // Emerald/Green
      secondary: '#3B82F6', // Blue
      background: '#041E15', // Cool industrial dark
      skylineGlow: 0x10B981,
      skylineColor: 0x0A3022,
    },
    slots: [
      { id: 0, name: "Partida (START)", type: "START", color: "#10B981", description: "Ganhe +200 ao passar" },
      { id: 1, name: "Av. Paulista A", type: "PROPERTY", neighborhood: "Av. Paulista", color: "#EF4444", cost: 130, rent: 13 },
      { id: 2, name: "Av. Paulista B", type: "PROPERTY", neighborhood: "Av. Paulista", color: "#EF4444", cost: 150, rent: 15 },
      { id: 3, name: "MASP", type: "PROPERTY", neighborhood: "Av. Paulista", color: "#EF4444", cost: 180, rent: 18 },
      { id: 4, name: "Imposto Predial", type: "TAX", color: "#6B7280", cost: 150, description: "Pague 150" },
      { id: 5, name: "Pinheiros A", type: "PROPERTY", neighborhood: "Pinheiros", color: "#3B82F6", cost: 220, rent: 22 },
      { id: 6, name: "Pinheiros B", type: "PROPERTY", neighborhood: "Pinheiros", color: "#3B82F6", cost: 240, rent: 24 },
      { id: 7, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés SP" },
      { id: 8, name: "Largo da Batata", type: "PROPERTY", neighborhood: "Pinheiros", color: "#3B82F6", cost: 260, rent: 26 },
      { id: 9, name: "Faria Lima", type: "PROPERTY", neighborhood: "Pinheiros", color: "#3B82F6", cost: 280, rent: 28 },
      { id: 10, name: "Itaim Bibi A", type: "PROPERTY", neighborhood: "Itaim Bibi", color: "#F59E0B", cost: 320, rent: 32 },
      { id: 11, name: "Itaim Bibi B", type: "PROPERTY", neighborhood: "Itaim Bibi", color: "#F59E0B", cost: 340, rent: 34 },
      { id: 12, name: "Taxa Corporativa", type: "TAX", color: "#6B7280", cost: 200, description: "Pague 200" },
      { id: 13, name: "JK Iguatemi", type: "PROPERTY", neighborhood: "Itaim Bibi", color: "#F59E0B", cost: 380, rent: 38 },
      { id: 14, name: "Berrini Office", type: "PROPERTY", neighborhood: "Itaim Bibi", color: "#F59E0B", cost: 420, rent: 42 },
      { id: 15, name: "Moema A", type: "PROPERTY", neighborhood: "Moema", color: "#EC4899", cost: 80, rent: 8 },
      { id: 16, name: "Moema B", type: "PROPERTY", neighborhood: "Moema", color: "#EC4899", cost: 100, rent: 10 },
      { id: 17, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés SP" },
      { id: 18, name: "Parque Ibirapuera", type: "PROPERTY", neighborhood: "Moema", color: "#EC4899", cost: 110, rent: 11 },
      { id: 19, name: "Av. Moema", type: "PROPERTY", neighborhood: "Moema", color: "#EC4899", cost: 120, rent: 12 },
    ],
    events: [
      { text: "Trânsito caótico na Marginal Pinheiros! Pague 80 de multa de atraso", amount: -80 },
      { text: "Virada Cultural atrai milhares de turistas! Receba +150", amount: 150 },
      { text: "Startup do Itaim Bibi recebe aporte milionário! Receba +250", amount: 250 },
      { text: "Taxa de estacionamento na Faria Lima. Pague 60", amount: -60 },
    ],
  },
  'rio-de-janeiro': {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    packName: 'América do Sul - Brasil Pack I',
    startingCapital: 1500,
    theme: {
      primary: '#3B82F6', // Azure/Blue
      secondary: '#EC4899', // Pink
      background: '#041424', // Deep sea dark
      skylineGlow: 0x3B82F6,
      skylineColor: 0x082544,
    },
    slots: [
      { id: 0, name: "Partida (START)", type: "START", color: "#3B82F6", description: "Ganhe +200 ao passar" },
      { id: 1, name: "Copacabana A", type: "PROPERTY", neighborhood: "Copacabana", color: "#EF4444", cost: 120, rent: 12 },
      { id: 2, name: "Copacabana B", type: "PROPERTY", neighborhood: "Copacabana", color: "#EF4444", cost: 140, rent: 14 },
      { id: 3, name: "Av. Atlântica", type: "PROPERTY", neighborhood: "Copacabana", color: "#EF4444", cost: 160, rent: 16 },
      { id: 4, name: "Taxa de Condomínio", type: "TAX", color: "#6B7280", cost: 150, description: "Pague 150" },
      { id: 5, name: "Ipanema A", type: "PROPERTY", neighborhood: "Ipanema", color: "#3B82F6", cost: 210, rent: 21 },
      { id: 6, name: "Ipanema B", type: "PROPERTY", neighborhood: "Ipanema", color: "#3B82F6", cost: 230, rent: 23 },
      { id: 7, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés Rio" },
      { id: 8, name: "Garota de Ipanema", type: "PROPERTY", neighborhood: "Ipanema", color: "#3B82F6", cost: 250, rent: 25 },
      { id: 9, name: "Praia de Ipanema", type: "PROPERTY", neighborhood: "Ipanema", color: "#3B82F6", cost: 270, rent: 27 },
      { id: 10, name: "Leblon A", type: "PROPERTY", neighborhood: "Leblon", color: "#F59E0B", cost: 310, rent: 31 },
      { id: 11, name: "Leblon B", type: "PROPERTY", neighborhood: "Leblon", color: "#F59E0B", cost: 330, rent: 33 },
      { id: 12, name: "Taxa de Iluminação", type: "TAX", color: "#6B7280", cost: 200, description: "Pague 200" },
      { id: 13, name: "Delfim Moreira", type: "PROPERTY", neighborhood: "Leblon", color: "#F59E0B", cost: 370, rent: 37 },
      { id: 14, name: "Mirante do Leblon", type: "PROPERTY", neighborhood: "Leblon", color: "#F59E0B", cost: 410, rent: 41 },
      { id: 15, name: "Centro A", type: "PROPERTY", neighborhood: "Centro", color: "#10B981", cost: 70, rent: 7 },
      { id: 16, name: "Centro B", type: "PROPERTY", neighborhood: "Centro", color: "#10B981", cost: 90, rent: 9 },
      { id: 17, name: "Sorte ou Revés", type: "EVENT", color: "#8B5CF6", description: "Sorte/Revés Rio" },
      { id: 18, name: "Arcos da Lapa", type: "PROPERTY", neighborhood: "Centro", color: "#10B981", cost: 100, rent: 10 },
      { id: 19, name: "Carioca", type: "PROPERTY", neighborhood: "Centro", color: "#10B981", cost: 110, rent: 11 },
    ],
    events: [
      { text: "Bossa Nova Concert at Copacabana Palace! Receba +150", amount: 150 },
      { text: "Taxa de licença de quiosque na praia. Pague 50", amount: -50 },
      { text: "Fim de ano atrai recorde de hotéis! Receba +200", amount: 200 },
      { text: "Reparo urgente de ar condicionado em Leblon. Pague 120", amount: -120 },
    ],
  },
};
