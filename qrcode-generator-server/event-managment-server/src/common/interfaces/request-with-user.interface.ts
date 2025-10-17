import { IncomingHttpHeaders } from 'node:http';

import { User } from '../../users/schemas/users.schema/users.schema';

export interface RequestWithUser {
  user: User;
  headers: IncomingHttpHeaders;
  cookies: Record<string, string>;
}
