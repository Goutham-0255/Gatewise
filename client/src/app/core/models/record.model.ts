export interface RecordItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
