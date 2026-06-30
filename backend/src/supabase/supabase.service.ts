import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!url || !key) {
      this.logger.warn(
        'Supabase URL or Publishable Key is not configured. Features requiring Supabase will fail.',
      );
      return;
    }

    this.supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async verifyToken(token: string): Promise<User> {
    if (!this.supabase) {
      this.logger.error(
        'Supabase client is not initialized due to missing configuration.',
      );
      throw new InternalServerErrorException(
        'Supabase authentication is not configured on the server. Please check environment variables.',
      );
    }

    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.warn(
          `Token verification failed: ${error?.message || 'User not found'}`,
        );
        throw new UnauthorizedException(
          'Invalid or expired authentication token',
        );
      }

      return user;
    } catch (err) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Unexpected error during token verification: ${errorMessage}`,
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
