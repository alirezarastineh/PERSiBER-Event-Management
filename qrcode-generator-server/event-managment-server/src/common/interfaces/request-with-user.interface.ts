import { IncomingHttpHeaders } from 'http';

import { User } from 'src/users/schemas/users.schema/users.schema';

export interface RequestWithUser {
  user: User;
  headers: IncomingHttpHeaders;
  cookies: Record<string, string>;
}
