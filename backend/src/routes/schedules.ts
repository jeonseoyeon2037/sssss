import { Router } from 'express';

const router = Router();

// 임시 라우트 - 나중에 실제 일정 로직으로 교체
router.get('/', (_req, res) => {
  res.json({ message: '일정 목록 조회 - 구현 예정' });
});

router.post('/', (_req, res) => {
  res.json({ message: '일정 생성 - 구현 예정' });
});

router.get('/:id', (_req, res) => {
  res.json({ message: `일정 상세 조회 (ID: ${_req.params.id}) - 구현 예정` });
});

router.put('/:id', (_req, res) => {
  res.json({ message: `일정 수정 (ID: ${_req.params.id}) - 구현 예정` });
});

router.delete('/:id', (_req, res) => {
  res.json({ message: `일정 삭제 (ID: ${_req.params.id}) - 구현 예정` });
});

router.put('/:id/status', (_req, res) => {
  res.json({ message: `일정 상태 변경 (ID: ${_req.params.id}) - 구현 예정` });
});

export default router; 