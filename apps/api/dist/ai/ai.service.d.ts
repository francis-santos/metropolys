import { OnModuleInit } from '@nestjs/common';
export interface BotDecision {
    action: 'BUY' | 'PASS' | 'BID' | 'ACCEPT' | 'DECLINED';
    bidAmount?: number;
    rationale: string;
}
export interface CityEvent {
    eventName: string;
    rentMultiplier: number;
    narrative: string;
}
export interface NewsHeadline {
    headline: string;
    body: string;
}
export declare class AiService implements OnModuleInit {
    private genAI;
    private hasKey;
    onModuleInit(): void;
    private promptGemini;
    getBotDecision(personality: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED', standings: any, landedSlot: any, actionType: 'BUY' | 'BID' | 'TRADE_RESPONSE', extraInfo?: any): Promise<BotDecision>;
    generateCityEvent(round: number, standings: any[]): Promise<CityEvent>;
    generateNewsCommentary(eventDescription: string): Promise<NewsHeadline>;
}
