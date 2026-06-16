import { DatabaseService } from './database.service';
export declare class DatabaseController {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    getTable(table: string, query: any): any[];
}
