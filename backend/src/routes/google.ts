import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 Google Calendar 로직으로 교체
router.post('/connect', (_req, res) => {
  res.json({ message: 'Google Calendar 연동 - 구현 예정' });
});

router.post('/sync', (_req, res) => {
  res.json({ message: 'Google Calendar 동기화 - 구현 예정' });
});

router.delete('/disconnect', (_req, res) => {
  res.json({ message: 'Google Calendar 연동 해제 - 구현 예정' });
});

export default router; 