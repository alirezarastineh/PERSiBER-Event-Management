import { UsersSchema } from './users.schema';

describe('UsersSchema', () => {
  it('should be defined', () => {
    expect(new UsersSchema()).toBeDefined();
  });
});
