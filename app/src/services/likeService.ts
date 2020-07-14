export class LikeService {
  private liked = {
    product: [],
    article: [],
    question: [],
    answer: [],
    answerComment: [],
    ugc: []
  };

  constructor() {
  }

  addLike(type: string, id: number) {
    this.liked[type].push(id);
  }

  removeLike(type: string, id: number) {
    const index = this.liked[type].indexOf(id);
    if (index > -1) {
      this.liked[type].splice(index, 1);
    }
  }

  checkLike(type: string, id: number): boolean {
    const index = this.liked[type].indexOf(id);
    return index > -1;
  }
}
