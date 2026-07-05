const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');

class CommunityAgent extends BaseAgent {
  constructor() {
    super(
      'community-agent',
      'Agente de Comunidade',
      'SOCIAL',
      'Simula reações de chat, rankings globais e comentários da comunidade.'
    );
    this.metrics = { chatMessages: 0 };
  }

  async handleEvent(event, bus) {}

  async selfTest() {
    return { passed: true, message: 'Sistema de comunidade simulado OK.' };
  }

  async runStandalone() {
    console.log(`  ${bold('Chat da Partida (Simulado):')}\n`);

    const reactions = [
      { user: 'SpectatorPro', msg: 'Bob tá comprando tudo! 🔥', time: '13:01:22' },
      { user: 'MetropolysBot', msg: 'Rodada 3 iniciada. Economia em EXPANSÃO.', time: '13:01:45' },
      { user: 'RealEstateKing', msg: 'Alguém vende o Beco do Jazz? Pago bem 💰', time: '13:02:10' },
      { user: 'Alice_BR', msg: 'Sorte nos dados, finalmente! 🎲', time: '13:02:33' },
      { user: 'MetropolysBot', msg: 'EVENTO: Boom de Turismo! Aluguéis +40% nesta rodada.', time: '13:03:00' },
      { user: 'ClaraInvest', msg: 'Vou esperar a crise pra comprar barato 📉', time: '13:03:15' },
    ];

    reactions.forEach(r => {
      const isBot = r.user === 'MetropolysBot';
      const nameColor = isBot ? COLORS.CYAN : COLORS.WHITE;
      console.log(`  ${COLORS.GRAY}${r.time}${COLORS.RESET} ${nameColor}${r.user.padEnd(18)}${COLORS.RESET} ${r.msg}`);
    });

    console.log(`\n  ${bold('Ranking Global (Top 5):')}\n`);
    const ranking = [
      { name: 'MagnataOficial', wins: 42, rating: 1850 },
      { name: 'Bob_Investe', wins: 38, rating: 1780 },
      { name: 'ClaraCapital', wins: 35, rating: 1720 },
      { name: 'Alice_BR', wins: 31, rating: 1680 },
      { name: 'NovoJogador99', wins: 5, rating: 1200 },
    ];
    ranking.forEach((r, i) => {
      const medal = ['🥇', '🥈', '🥉', '  ', '  '][i];
      console.log(`  ${medal} ${r.name.padEnd(18)} ${COLORS.GREEN}${r.wins} vitórias${COLORS.RESET}  Rating: ${COLORS.YELLOW}${r.rating}${COLORS.RESET}`);
    });
  }
}

module.exports = CommunityAgent;
if (require.main === module) runAgentCLI(CommunityAgent);
