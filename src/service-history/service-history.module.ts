import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServiceHistoryController } from './service-history.controller';
import { ServiceHistoryService } from './service-history.service';

@Module({
  imports: [AuthModule],
  controllers: [ServiceHistoryController],
  providers: [ServiceHistoryService],
})
export class ServiceHistoryModule {}
