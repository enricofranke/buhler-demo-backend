export default () => ({
    port: parseInt(process.env.APP_PORT || '3000', 10),
    host: process.env.APP_HOST || 'localhost',
    appName: process.env.APP_NAME || 'buhler-demo-backend',
    nodeEnv: process.env.NODE_ENV || 'development',
    api: {
      version: process.env.API_VERSION || 'v1',
      prefix: process.env.API_PREFIX || 'api',
      corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200', 'http://localhost:3000'],
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '24h',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'combined',
    },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '300', 10),
      max: parseInt(process.env.CACHE_MAX || '100', 10),
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },
  });