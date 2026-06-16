import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RoomsModule } from './rooms/rooms.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [DatabaseModule, RoomsModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
