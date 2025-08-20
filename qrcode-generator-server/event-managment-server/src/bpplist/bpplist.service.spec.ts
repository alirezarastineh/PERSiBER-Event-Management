import { Test, TestingModule } from '@nestjs/testing';

import { BpplistService } from './bpplist.service';

describe('BpplistService', () => {
  let service: BpplistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BpplistService],
    }).compile();

    service = module.get<BpplistService>(BpplistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
