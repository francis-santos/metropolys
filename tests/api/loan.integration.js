const { Pool } = require('pg');

async function runLoanTests() {
  console.log('[QA] Iniciando testes do Sistema de Empréstimo...');
  const API_URL = 'http://localhost:3008/api/rooms';
  const pool = new Pool({ connectionString: 'postgres://postgres:689101@localhost:5432/metropolys' });

  try {
    // 1. Criar sala
    console.log('[QA] 1. Criando sala...');
    const createRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostName: 'Jogador 1 (QA)',
        hostColor: '#FF0000',
        cityCode: 'NY'
      })
    });
    
    if (!createRes.ok) {
      const txt = await createRes.text();
      throw new Error(`Falha ao criar sala: ${txt}`);
    }
    const room = await createRes.json();
    
    // Buscar o jogador no banco
    const dbPlayerQuery = await pool.query('SELECT * FROM players WHERE "roomId" = $1 AND "isHost" = true', [room.id]);
    const player1 = dbPlayerQuery.rows[0];
    
    console.log(`[QA] Sala criada: ${room.code}. ID Jogador: ${player1.id}. Saldo Inicial: ${player1.money}M`);

    const initialLiquidity = room.bankingLiquidity;

    // 2. Testar Empréstimo Bancário
    console.log('[QA] 2. Testando Empréstimo com o Banco (Bank Loan)...');
    const loanAmount = 500;
    const loanRes = await fetch(`${API_URL}/${room.code}/loan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: player1.id,
        amount: loanAmount
      })
    });

    if (!loanRes.ok) {
      const err = await loanRes.text();
      throw new Error(`Falha no empréstimo bancário: ${err}`);
    }

    const loanResult = await loanRes.json();
    console.log(`[QA] Empréstimo bancário de ${loanAmount}M realizado com sucesso.`);
    
    const expectedMoney = player1.money + loanAmount;
    if (loanResult.balance !== expectedMoney) {
      throw new Error(`Saldo incorreto! Esperado: ${expectedMoney}, Atual: ${loanResult.balance}`);
    }

    const expectedLiquidity = initialLiquidity - loanAmount;
    if (loanResult.bankingLiquidity !== expectedLiquidity) {
      throw new Error(`Liquidez bancária incorreta! Esperada: ${expectedLiquidity}, Atual: ${loanResult.bankingLiquidity}`);
    }

    console.log('[QA] Validação de memória (Backend): OK ✅');

    // 3. DBA - Validar persistência no banco
    console.log('[DBA] 3. Validando persistência no PostgreSQL...');
    
    // Dar 1 segundo para o save() assíncrono ocorrer no NestJS (se houver debouce ou atraso)
    await new Promise(r => setTimeout(r, 1000));

    const dbRoomQuery = await pool.query('SELECT "bankingLiquidity" FROM rooms WHERE code = $1', [room.code]);
    if (dbRoomQuery.rowCount === 0) throw new Error('Sala não encontrada no PostgreSQL!');
    
    const dbLiquidity = dbRoomQuery.rows[0].bankingLiquidity;
    if (Number(dbLiquidity) !== expectedLiquidity) {
      throw new Error(`[DBA] Falha de persistência! Liquidez no DB: ${dbLiquidity}, Esperada: ${expectedLiquidity}`);
    }

    const dbPlayerQuery2 = await pool.query('SELECT money FROM players WHERE id = $1', [player1.id]);
    const dbMoney = dbPlayerQuery2.rows[0].money;
    if (Number(dbMoney) !== expectedMoney) {
      throw new Error(`[DBA] Falha de persistência! Saldo no DB: ${dbMoney}, Esperado: ${expectedMoney}`);
    }

    console.log('[DBA] Validação de persistência (Banco de Dados): OK ✅');

    // 4. Testar Empréstimo entre Jogadores (P2P Loan)
    console.log('[QA] 4. Testando Empréstimo entre Jogadores (P2P Loan)...');
    console.log('[QA] ⚠️ AVISO: Funcionalidade não encontrada na API (Não há endpoint POST /api/rooms/:code/player-loan).');
    console.log('[QA] ❌ Teste de Empréstimo entre Jogadores: FALHOU (Não Implementado).');

    console.log('\\n🎉 Relatório de QA: Empréstimo com Banco FUNCIONAL. Empréstimo P2P INEXISTENTE.');

  } catch (error) {
    console.error(`\\n❌ ERRO NO TESTE: ${error.message}`);
  } finally {
    await pool.end();
  }
}

runLoanTests();
