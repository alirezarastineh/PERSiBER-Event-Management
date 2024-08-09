import { GuestsSchema } from './guests.schema';

describe('GuestsSchema', () => {
  it('should be defined', () => {
    expect(new GuestsSchema()).toBeDefined();
  });
});
