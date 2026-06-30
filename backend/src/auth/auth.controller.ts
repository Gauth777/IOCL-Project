import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently authenticated user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMe(@Req() req: Request) {
    const authReq = req as unknown as AuthenticatedRequest;
    const user = authReq.user;
    return {
      id: user.id,
      email: user.email,
      emailVerified: !!user.email_confirmed_at,
    };
  }
}
