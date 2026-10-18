import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type Plan = 'guest' | 'free';

export type ClientIdentity = { clientId: string; plan: Plan };

/**
 * TEMPORARY identity, for development only.
 * Each app install sends a random id in `x-lightkeeper-client` and its plan in `x-lightkeeper-plan`.
 * Anyone can send any id, so this must be replaced by Firebase ID-token verification before going public.
 */
export const CurrentClient = createParamDecorator((_data: unknown, ctx: ExecutionContext): ClientIdentity => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const clientId = String(req.header('x-lightkeeper-client') ?? '').trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(clientId)) {
    throw new BadRequestException({ code: 'NO_CLIENT_ID', message: 'Missing or invalid x-lightkeeper-client header.' });
  }
  const plan: Plan = req.header('x-lightkeeper-plan') === 'guest' ? 'guest' : 'free';
  return { clientId, plan };
});
