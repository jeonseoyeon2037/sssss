import { Router } from 'express';
import { getCollection } from '../config/firebase';
import { NotFoundError } from '../middleware/errorHandler';

const router = Router();

// 모든 컬렉션의 데이터 개수 조회
router.get('/counts', async (_req, res) => {
  try {
    const collections = ['users', 'projects', 'schedules', 'conflicts', 'analytics'];
    const counts: Record<string, number> = {};

    for (const collectionName of collections) {
      const collection = getCollection(collectionName);
      const snapshot = await collection.get();
      counts[collectionName] = snapshot.size;
    }

    res.json({
      success: true,
      data: counts,
      message: '모든 컬렉션의 데이터 개수 조회 완료'
    });
  } catch (error) {
    console.error('데이터 개수 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: '데이터 개수 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 컬렉션의 모든 데이터 조회
router.get('/:collection', async (_req, res) => {
  try {
    const { collection } = _req.params;
    const { limit = 50, offset = 0 } = _req.query;

    const validCollections = ['users', 'projects', 'schedules', 'conflicts', 'analytics'];
    if (!validCollections.includes(collection)) {
      throw new NotFoundError(`유효하지 않은 컬렉션: ${collection}`);
    }

    const collectionRef = getCollection(collection);
    const snapshot = await collectionRef
      .limit(Number(limit))
      .offset(Number(offset))
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: {
        collection,
        total: snapshot.size,
        limit: Number(limit),
        offset: Number(offset),
        items: data
      },
      message: `${collection} 컬렉션 데이터 조회 완료`
    });
  } catch (error) {
    console.error(`${_req.params.collection} 데이터 조회 실패:`, error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: '데이터 조회 중 오류가 발생했습니다.'
      });
    }
  }
});

// 특정 문서 조회
router.get('/:collection/:id', async (_req, res) => {
  try {
    const { collection, id } = _req.params;

    const validCollections = ['users', 'projects', 'schedules', 'conflicts', 'analytics'];
    if (!validCollections.includes(collection)) {
      throw new NotFoundError(`유효하지 않은 컬렉션: ${collection}`);
    }

    const docRef = getCollection(collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError(`${collection} 컬렉션에서 ID ${id}를 찾을 수 없습니다.`);
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      },
      message: `${collection} 컬렉션의 ${id} 문서 조회 완료`
    });
  } catch (error) {
    console.error(`문서 조회 실패:`, error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: '문서 조회 중 오류가 발생했습니다.'
      });
    }
  }
});

export default router; 