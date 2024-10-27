import { IndexController } from './index.controller.ts';
import { Module } from '@nestjs/common';

@Module({
  controllers: [IndexController],
})
export class IndexModule {}
