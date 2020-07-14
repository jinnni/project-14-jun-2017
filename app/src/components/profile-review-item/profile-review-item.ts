import {Component, Input} from '@angular/core';
import {Review} from "../../data/review.interface";
import {Product} from "../../data/product.interface";
import {ReviewService} from "../../services/reviewService";
import {ProductService} from "../../services/productService";
import {Util} from "../../global/util";
import {NavController} from "ionic-angular";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";

@Component({
  selector: 'profile-review-item',
  templateUrl: 'profile-review-item.html'
})
export class ProfileReviewItemComponent {

  @Input() reviewId: number;

  util = Util;

  reviewData: Review;
  productData: Product;

  constructor(private navCtrl: NavController,
              private reviewService: ReviewService,
              private productService: ProductService) {
  }

  ngAfterViewInit() {
    this.reviewData = this.reviewService.getReviewById(this.reviewId);
    console.log(this.reviewData);
    
    // this.productData = this.productService.getProductById(this.reviewData.productId);
    // this.rating = this.reviewData.rating;
    // console.log(this.rating);
  }

  showProduct() {
    this.navCtrl.push(ProductDetailPage, {id: this.productData.id});
  }

}


