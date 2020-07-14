export interface AnswerComment {
  id: number;
  answerId: number;
  writer : {
    name: string;
    age: number;
    location: string;
    profileImage: string;
  }
  content: string;
  likeCount: number;
}
