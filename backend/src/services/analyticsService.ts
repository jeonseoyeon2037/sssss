import { getCollection } from '../config/firebase';
import { Analytics } from '../types/database';

export interface AnalyticsQuery {
  id?: string | undefined;
  project_id?: string | undefined;
  metric_name?: string | undefined;
  period?: 'daily' | 'weekly' | 'monthly' | 'current' | undefined;
  start_date?: Date | undefined;
  end_date?: Date | undefined;
}

export const getAnalytics = async (query: AnalyticsQuery = {}): Promise<Analytics[]> => {
  try {
    let collectionRef: any = getCollection('personal_tasks');
    if (query.id) {
      collectionRef = collectionRef.where('id', '==', query.id);
    }
    // if (query.metric_name) {
    //   collectionRef = collectionRef.where('metric_name', '==', query.metric_name);
    // }
    // if (query.period) {
    //   collectionRef = collectionRef.where('period', '==', query.period);
    // }
    // if (query.start_date) {
    //   collectionRef = collectionRef.where('date', '>=', query.start_date);
    // }
    // if (query.end_date) {
    //   collectionRef = collectionRef.where('date', '<=', query.end_date);
    // }
    const snapshot = await collectionRef.get();
    const analytics: Analytics[] = [];
    snapshot.forEach((doc: any) => {
      analytics.push({
        id: doc.id,
        ...doc.data()
      } as Analytics);
    });
    return analytics;
  } catch (error) {
    console.error('Analytics 데이터 조회 실패:', error);
    throw error;
  }
}; 