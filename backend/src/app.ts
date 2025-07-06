import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

// 라우터 import
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import scheduleRoutes from './routes/schedules';
import conflictRoutes from './routes/conflicts';
import googleRoutes from './routes/google';
import dataRoutes from './routes/data';
import analyticsRoutes from './routes/analytics';
import personalTasksRoutes from './routes/personal-tasks';

// 미들웨어 import
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();

// 기본 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(express.json({ limit: '10mb' })); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// CORS 설정
const corsOptions = {
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  message: {
    error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
});
app.use('/api/', limiter);

// 요청 로깅 미들웨어
app.use(requestLogger);

// API 라우터 설정
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/personal-tasks', personalTasksRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.originalUrl,
    method: req.method
  });
});

// 에러 핸들링 미들웨어 (마지막에 배치)
app.use(errorHandler);

export default app; 