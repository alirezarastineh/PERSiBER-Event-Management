import { Module } from '@nestjs/common';

import { CommonController } from './common.controller.js';
import { CommonService } from './common.service.js';

@Module({
  providers: [CommonService],
  controllers: [CommonController],
})
export class CommonModule {}
