import { Module } from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [StorageModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
