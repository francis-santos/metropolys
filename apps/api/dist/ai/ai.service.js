"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let AiService = class AiService {
    genAI = null;
    hasKey = false;
    onModuleInit() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'undefined') {
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
                this.hasKey = true;
                console.log('Gemini API Client initialized successfully');
            }
            catch (e) {
                console.error('Failed to initialize Gemini SDK:', e);
            }
        }
        else {
            console.log('No GEMINI_API_KEY found. Running in local fallback mode.');
        }
    }
    async promptGemini(prompt, fallbackJson) {
        if (!this.hasKey || !this.genAI)
            return fallbackJson;
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await Promise.race([
                model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                    },
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000)),
            ]);
            const text = result.response.text();
            return JSON.parse(text);
        }
        catch (e) {
            console.warn('Gemini prompt failed or timed out. Falling back to local rules:', e.message);
            return fallbackJson;
        }
    }
    async getBotDecision(personality, standings, landedSlot, actionType, extraInfo = {}) {
        const { money, propertiesOwned = [] } = standings;
        const cost = landedSlot?.cost || landedSlot?.highestBid || 100;
        const rent = landedSlot?.rent || 15;
        let fallbackDecision = { action: 'PASS', rationale: 'Pensando estrategicamente.' };
        if (actionType === 'BUY') {
            if (personality === 'AGGRESSIVE') {
                fallbackDecision = money >= cost
                    ? { action: 'BUY', rationale: `Imóvel barato! Vou arrematar para aumentar meu portfólio de aluguéis.` }
                    : { action: 'PASS', rationale: `Saldo insuficiente para comprar esta propriedade.` };
            }
            else if (personality === 'CONSERVATIVE') {
                fallbackDecision = (money - cost >= 500)
                    ? { action: 'BUY', rationale: `Compra segura. Meu saldo continuará confortável acima de 500M.` }
                    : { action: 'PASS', rationale: `Melhor poupar capital para despesas de aluguel futuras.` };
            }
            else {
                fallbackDecision = (money - cost >= 200)
                    ? { action: 'BUY', rationale: `Excelente oportunidade de rentabilidade média na região.` }
                    : { action: 'PASS', rationale: `Saldo muito apertado. Passando a vez.` };
            }
        }
        else if (actionType === 'BID') {
            const maxBid = personality === 'AGGRESSIVE' ? money * 0.9
                : personality === 'CONSERVATIVE' ? money * 0.4
                    : money * 0.65;
            const nextBid = cost + 10;
            if (nextBid <= maxBid && money >= nextBid) {
                fallbackDecision = { action: 'BID', bidAmount: nextBid, rationale: `Lance estratégico para disputar o leilão.` };
            }
            else {
                fallbackDecision = { action: 'PASS', rationale: `O valor do lance ultrapassa meu limite prudente.` };
            }
        }
        else if (actionType === 'TRADE_RESPONSE') {
            const offerCash = extraInfo.offerCash || 0;
            if (offerCash >= 150) {
                fallbackDecision = { action: 'ACCEPT', rationale: `Oferta financeira aceitável pelo meu patrimônio.` };
            }
            else {
                fallbackDecision = { action: 'DECLINED', rationale: `A contrapartida oferecida é muito baixa para as minhas propriedades.` };
            }
        }
        if (!this.hasKey)
            return fallbackDecision;
        const prompt = `Você é um investidor imobiliário de inteligência artificial jogando Metropolys.
Sua personalidade é: ${personality}.
Seu saldo atual: ${money}M.
Seu portfólio (IDs dos slots possuídos): ${JSON.stringify(propertiesOwned)}.
O imóvel em foco é o Slot ${landedSlot?.id} (${landedSlot?.name}), com custo/lance de ${cost}M e aluguel de ${rent}M.
A ação solicitada é do tipo: ${actionType}.
Se for uma proposta de troca recebida, detalhes adicionais: ${JSON.stringify(extraInfo)}.

Tome uma decisão estratégica alinhada com sua personalidade.
Você DEVE responder estritamente no formato JSON:
{
  "action": "BUY" | "PASS" | "BID" | "ACCEPT" | "DECLINED",
  "bidAmount": (apenas se a ação for BID, número inteiro sugerido para lance),
  "rationale": "Uma frase curta justificando a decisão em português"
}`;
        return this.promptGemini(prompt, fallbackDecision);
    }
    async generateCityEvent(round, standings) {
        const list = [
            { eventName: 'Greve de Ônibus', rentMultiplier: 0.8, narrative: 'A greve de transporte público esvaziou os bairros centrais, reduzindo a atividade comercial e os aluguéis temporariamente.' },
            { eventName: 'Boom de Turismo', rentMultiplier: 1.4, narrative: 'O aumento repentino de voos internacionais lotou hotéis e orlas, gerando lucros extras para proprietários.' },
            { eventName: 'Crise de Crédito', rentMultiplier: 0.75, narrative: 'O banco central elevou a taxa básica, encarecendo os juros e enfraquecendo o poder de compra.' },
            { eventName: 'Festival da Metrópole', rentMultiplier: 1.3, narrative: 'Festivais culturais atraíram multidões para os distritos históricos, valorizando os aluguéis na região.' },
        ];
        const fallbackEvent = list[Math.floor(Math.random() * list.length)];
        if (!this.hasKey)
            return fallbackEvent;
        const prompt = `Você é o Game Master do simulador econômico Metropolys. Estamose na rodada ${round}.
Os saldos dos jogadores são: ${JSON.stringify(standings.map(p => ({ name: p.name, money: p.money })))}.
Crie um evento econômico macroeconômico fictício para a cidade afetando o aluguel dos bairros.
Você DEVE responder estritamente no formato JSON:
{
  "eventName": "Nome curto do evento (ex: Greve Geral)",
  "rentMultiplier": (número float entre 0.70 e 1.40 representando o multiplicador de aluguel),
  "narrative": "Uma frase de jornal em português explicando as razões do evento"
}`;
        return this.promptGemini(prompt, fallbackEvent);
    }
    async generateNewsCommentary(eventDescription) {
        const fallbackNews = {
            headline: 'Acontecimento em Foco',
            body: `${eventDescription}. Analistas locais monitoram as reações do mercado imobiliário nesta rodada.`,
        };
        if (!this.hasKey)
            return fallbackNews;
        const prompt = `Você é o editor do jornal Diário da Metrópole.
Escreva uma manchete de jornal e um parágrafo rápido reagindo a este acontecimento do jogo:
"${eventDescription}"

Mantenha um tom satírico, corporativo ou jornalístico em português.
Você DEVE responder estritamente no formato JSON:
{
  "headline": "Uma manchete sensacionalista curta",
  "body": "Um corpo de texto rápido contendo entre 1 e 2 frases jornalísticas"
}`;
        return this.promptGemini(prompt, fallbackNews);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map