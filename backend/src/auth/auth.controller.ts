import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
  // the @All decorador catches ANY method (GET, POST, PUT, etc.) 
  // that arrives at the /api/auth route and its subroutes
  @All('/*')
  async handler(@Req() req: Request, @Res() res: Response) {
    // we pass full control of the request to Better Auth
    return toNodeHandler(auth)(req, res);
  }
}
