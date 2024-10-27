import { DataController } from './data.controller.ts';
import { DataService } from './data.service.ts';
import { Module } from '@nestjs/common';

@Module({
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule {}
