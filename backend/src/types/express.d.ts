import { TokenPayload } from '../utils/jwt/token';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
