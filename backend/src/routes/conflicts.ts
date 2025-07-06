import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 충돌 로직으로 교체
router.get('/', (_req, res) => {
  res.json({ message: '충돌 목록 조회 - 구현 예정' });
});

router.post('/check', (_req, res) => {
  res.json({ message: '충돌 검사 - 구현 예정' });
});

router.put('/:id/resolve', (_req, res) => {
  res.json({ message: `충돌 해결 (ID: ${_req.params.id}) - 구현 예정` });
});

export default router; 