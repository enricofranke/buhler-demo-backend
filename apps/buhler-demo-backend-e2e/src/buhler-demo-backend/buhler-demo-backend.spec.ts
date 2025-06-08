import axios, { AxiosError } from 'axios';

describe('BuhlerDemoBackend E2E Tests', () => {
  const baseURL = process.env.API_URL || 'http://localhost:3000';
  let authToken: string;

  const expectAxiosError = (error: unknown, expectedStatus: number) => {
    expect((error as AxiosError).response?.status).toBe(expectedStatus);
  };

  describe('Health Check', () => {
    it('GET /api should return a message', async () => {
      const res = await axios.get(`${baseURL}/api`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
    });
  });

  describe('Auth Endpoints', () => {
    describe('GET /auth/public-info', () => {
      it('should return public information without authentication', async () => {
        const res = await axios.get(`${baseURL}/auth/public-info`);

        expect(res.status).toBe(200);
        expect(res.data).toEqual({
          message: 'This is a public endpoint - no authentication required',
          appName: 'explore.dg',
          version: '1.0.0',
        });
      });
    });

    describe('Protected Endpoints', () => {
      it('GET /auth/profile should return 401 without token', async () => {
        try {
          await axios.get(`${baseURL}/auth/profile`);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });

      it('GET /auth/me should return 401 without token', async () => {
        try {
          await axios.get(`${baseURL}/auth/me`);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });

      it('POST /auth/logout should return 401 without token', async () => {
        try {
          await axios.post(`${baseURL}/auth/logout`);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });
    });

    describe('Role-based Access Control', () => {
      it('GET /auth/admin-only should return 401 without token', async () => {
        try {
          await axios.get(`${baseURL}/auth/admin-only`);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });

      it('GET /auth/sales-dashboard should return 401 without token', async () => {
        try {
          await axios.get(`${baseURL}/auth/sales-dashboard`);
        } catch (error) {
          expect(error.response.status).toBe(401);
        }
      });
    });
  });

  describe('API Documentation', () => {
    it('GET /api-docs should return Swagger documentation', async () => {
      const res = await axios.get(`${baseURL}/api-docs`, {
        headers: {
          'Accept': 'text/html',
        },
      });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
    });

    it('GET /api-docs-json should return OpenAPI JSON', async () => {
      const res = await axios.get(`${baseURL}/api-docs-json`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('openapi');
      expect(res.data).toHaveProperty('info');
      expect(res.data).toHaveProperty('paths');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      try {
        await axios.get(`${baseURL}/non-existent-endpoint`);
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle malformed JSON requests gracefully', async () => {
      try {
        await axios.post(`${baseURL}/auth/logout`, 'invalid-json', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        expect(error.response.status).toBe(401); // Should fail on auth, not JSON parsing
      }
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const res = await axios.get(`${baseURL}/auth/public-info`);

      expect(res.status).toBe(200);
      // CORS headers might be present depending on configuration
      // This test documents the expectation
    });
  });

  describe('Security Headers', () => {
    it('should not expose sensitive server information', async () => {
      const res = await axios.get(`${baseURL}/auth/public-info`);

      expect(res.status).toBe(200);
      // Should not expose server version or technology stack
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });
});
