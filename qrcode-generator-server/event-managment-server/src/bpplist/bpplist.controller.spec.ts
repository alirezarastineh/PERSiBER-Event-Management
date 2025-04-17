import { Test, TestingModule } from '@nestjs/testing';
import { BpplistController } from './bpplist.controller';

describe('BpplistController', () => {
  let controller: BpplistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BpplistController],
    }).compile();

    controller = module.get<BpplistController>(BpplistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
