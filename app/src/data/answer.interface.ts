export interface Answer {
  id: number;
  productId: number;
  questionId: number;
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
  // created: Date;
}
