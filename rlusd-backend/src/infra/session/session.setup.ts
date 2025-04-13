import session from 'express-session';
import { INestApplication } from '@nestjs/common';
import { RequestHandler } from 'express';

/**
 * Configures and applies session middleware to a NestJS application
 */
export function setupSession(
  app: INestApplication,
  env: { SESSION_SECRET: string; NODE_ENV?: string },
): RequestHandler {
  const sessionMiddleware = session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  });

  app.use(sessionMiddleware);

  return sessionMiddleware;
}
