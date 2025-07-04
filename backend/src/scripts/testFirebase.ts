#!/usr/bin/env node

import { getFirestoreDB, getCollection } from '../config/firebase';

const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Firebase 연결 테스트 시작...\n');
    
    // Firestore 인스턴스 가져오기
    const db = getFirestoreDB();
    console.log('✅ Firestore 인스턴스 생성 성공');
    
    // 컬렉션 참조 테스트
    const usersCollection = getCollection('users');
    console.log(`✅ Users 컬렉션 참조 성공 (경로: ${usersCollection.path})`);
    
    // 컬렉션 목록 가져오기 테스트
    const collections = await db.listCollections();
    console.log('✅ 컬렉션 목록 조회 성공');
    console.log(`📁 현재 컬렉션 수: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('📋 컬렉션 목록:');
      collections.forEach(collection => {
        console.log(`  - ${collection.id}`);
      });
    } else {
      console.log('📋 아직 컬렉션이 없습니다.');
    }
    
    console.log('\n🎉 Firebase 연결 테스트 완료!');
    console.log('이제 데이터 시드를 실행할 수 있습니다.');
    
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  testFirebaseConnection();
} 