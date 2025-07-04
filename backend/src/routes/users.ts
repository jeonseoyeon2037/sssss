import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 사용자 로직으로 교체
router.get('/profile', (req, res) => {
  res.json({ message: '사용자 프로필 조회 - 구현 예정' });
});

router.put('/profile', (req, res) => {
  res.json({ message: '사용자 프로필 수정 - 구현 예정' });
});

router.get('/team', (req, res) => {
  res.json({ message: '팀원 목록 조회 - 구현 예정' });
});

export default router; 