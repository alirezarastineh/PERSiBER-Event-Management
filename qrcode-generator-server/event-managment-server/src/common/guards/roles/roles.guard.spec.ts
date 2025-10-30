import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  it('should be defined', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;

    expect(new RolesGuard(reflector)).toBeDefined();
  });
});
