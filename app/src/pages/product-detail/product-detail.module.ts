import {NgModule} from "@angular/core";
import {ProductDetailPage} from "./product-detail";
import {IonicPageModule} from "ionic-angular";
import {QnaService} from "../../services/qnaService";
import {ReviewService} from "../../services/reviewService";
import {LikeService} from "../../services/likeService";
import {ProductQnaDetailPageModule} from "../product-qna/product-qna-detail/product-qna-detail.module";
import {ProductQnaListPageModule} from "../product-qna/product-qna-list/product-qna-list.module";
import {ProductReviewListPageModule} from "../product-review/product-review-list/product-review-list.module";
import {CreateProductReviewPageModule} from "../create-product-review/create-product-review.module";
import {ProductWriteReviewPage} from "../product-review/product-write-review/product-write-review";
import {ProductQnaAskQuestionPage} from "../product-qna/product-qna-ask-question/product-qna-ask-question";
import {LocalImageRetrieverProvider} from "../../services/local-image-retriever/local-image-retriever.provider";
import {RatingModule} from "../../components/rating/rating.module";
import {IonicImageLoader} from "ionic-image-loader";
import {CreateProductReviewPage} from "../create-product-review/create-product-review";

@NgModule({
  declarations: [
    ProductDetailPage,
    ProductWriteReviewPage,
    ProductQnaAskQuestionPage,
    CreateProductReviewPage
  ],
  imports: [
    IonicPageModule.forChild(ProductDetailPage),
    RatingModule,
    ProductQnaDetailPageModule,
    ProductQnaListPageModule,
    IonicImageLoader,
    ProductReviewListPageModule
  ],
  providers: [
    QnaService,
    ReviewService,
    LikeService,
    LocalImageRetrieverProvider
  ],
  entryComponents: [
    ProductWriteReviewPage,
    ProductQnaAskQuestionPage,
    CreateProductReviewPage
  ]
})
export class ProductDetailPageModule {
}
