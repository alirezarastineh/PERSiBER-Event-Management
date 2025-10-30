import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const jwtService = {
      verify: () => ({}),
    } as unknown as JwtService;
    const configService = {
      get: () => 'secret',
    } as unknown as ConfigService;

    expect(new JwtAuthGuard(jwtService, configService)).toBeDefined();
  });
});
