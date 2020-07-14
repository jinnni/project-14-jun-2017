export interface Article {
  id: number;
  title: string;
  content: string;
  writer: string;
  writerImage: string;
  headerImage: string;
  created: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}
