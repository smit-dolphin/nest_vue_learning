import { Module } from '@nestjs/common';
import { GuardsService } from './guards.service.js';

@Module({
  providers: [GuardsService]
})
export class GuardsModule {}
