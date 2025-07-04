import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 일정 로직으로 교체
router.get('/', (req, res) => {
  res.json({ message: '일정 목록 조회 - 구현 예정' });
});

router.post('/', (req, res) => {
  res.json({ message: '일정 생성 - 구현 예정' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `일정 상세 조회 (ID: ${req.params.id}) - 구현 예정` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `일정 수정 (ID: ${req.params.id}) - 구현 예정` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `일정 삭제 (ID: ${req.params.id}) - 구현 예정` });
});

router.put('/:id/status', (req, res) => {
  res.json({ message: `일정 상태 변경 (ID: ${req.params.id}) - 구현 예정` });
});

export default router; 