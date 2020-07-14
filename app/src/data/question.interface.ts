export interface Question {
  id: number;
  productId: number;
  writer: {
    id: number;
    name: string;
    age: number;
    location: string;
    profileImage: string;
  }
  content: string;
  likeCount: number;
  answerCount: number;
  created: Date;
}
