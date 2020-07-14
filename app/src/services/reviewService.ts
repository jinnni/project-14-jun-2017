import {Review} from "../data/review.interface";
import reviews from "../data/reviews";

export class ReviewService {
  private reviewList: Review[];

  constructor() {
    this.reviewList = reviews;
  }

  getReviewById(reviewId: number) {
    return this.reviewList.find((review: Review) => {
      return review.id == reviewId;
    });
  }

  getReviewByProductId(productId: number) {
    return this.reviewList.filter((review: Review) => {
      return review.productId == productId;
    });
  }

  getReviewByUserId(userId: number) {
    return this.reviewList.filter((review: Review) => {
      return review.writer.id == userId;
    });
  }
}
