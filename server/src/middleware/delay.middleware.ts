import { Request, Response, NextFunction } from 'express';

// The cap stops ?delay being used to tie up the server with very long waits
export const MAX_DELAY_MS = 5000;

export function delay(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.query.delay;
  const n = typeof raw === 'string' ? Number(raw) : NaN;
  const ms = Number.isFinite(n) ? Math.min(Math.max(n, 0), MAX_DELAY_MS) : 0;
  if (ms > 0) setTimeout(next, ms);
  else next();
}
