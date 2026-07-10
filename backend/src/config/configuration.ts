export interface AppConfig {
  port: number;
  tourApi: {
    key?: string;
    baseUrl: string;
  };
  corsOrigins: string[];
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  tourApi: {
    key: process.env.TOUR_API_KEY,
    baseUrl: process.env.TOUR_API_BASE_URL ?? 'https://apis.data.go.kr/B551011/KorService1',
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
