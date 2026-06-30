/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';

describe('App & Health & Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 and health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('projectlink-backend');
          expect(res.body.timestamp).toBeDefined();
          expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('GET /api/v1/auth/me (Protected)', () => {
    it('should return 401 Unauthorized if Authorization header is missing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401)
        .expect((res) => {
          expect(res.body.statusCode).toBe(401);
          expect(res.body.message).toBe('Authorization header is missing');
          expect(res.body.error).toBe('Unauthorized');
        });
    });

    it('should return 401 Unauthorized if Authorization header is not Bearer', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Basic dGVzdDp0ZXN0')
        .expect(401)
        .expect((res) => {
          expect(res.body.statusCode).toBe(401);
          expect(res.body.message).toBe('Authorization header must be in the format: Bearer <token>');
          expect(res.body.error).toBe('Unauthorized');
        });
    });

    it('should return 401 or 500 depending on config if token is invalid', () => {
      // If Supabase is not configured, it will throw a 500 Internal Server Error (with our custom config error message)
      // If it is configured, it will throw 401 Unauthorized because the token is invalid.
      // Either way, it should not succeed (should not be 200).
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect((res) => {
          expect(res.status).not.toBe(200);
        });
    });
  });
});
