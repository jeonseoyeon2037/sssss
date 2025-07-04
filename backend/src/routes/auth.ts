import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 인증 로직으로 교체
router.post('/login', (req, res) => {
  res.json({ message: '로그인 엔드포인트 - 구현 예정' });
});

router.post('/logout', (req, res) => {
  res.json({ message: '로그아웃 엔드포인트 - 구현 예정' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: '토큰 갱신 엔드포인트 - 구현 예정' });
});

export default router; 