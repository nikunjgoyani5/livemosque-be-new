// types/express/index.d.ts
import type { JwtPayload } from "jsonwebtoken"; // import type only

declare global {
  namespace Express {
    interface Request {
      adminId?: string; // <-- matches your middleware
      tokenPayload?: JwtPayload; // optional decoded token
    }
  }
}
