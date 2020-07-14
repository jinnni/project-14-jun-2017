import {Component, Input} from '@angular/core';
import {NavController} from "ionic-angular";
import {ProductService} from "../../services/productService";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {QnaItemType} from "../../global/qnaItemType";
import {Util} from "../../global/util";
import {Answer} from "../../data/answer.interface";
import {Question} from "../../data/question.interface";

@Component({
  selector: 'profile-qna-item',
  templateUrl: 'profile-qna-item.html'
})
export class ProfileQnaItemComponent {

  Util = Util;
  QnaItemType = QnaItemType;
  productName: string;
  userData:any;
  socialProfilePic:any;
  @Input() type: string;
  @Input() qnaData: Answer | Question;

  constructor(private navCtrl: NavController,
              private productService: ProductService) {
                this.userData =JSON.parse(localStorage.getItem("UserData"));
                this.socialProfilePic =localStorage.getItem("socialProfilePic");
  }

  ngOnInit() {
    const product = this.productService.getProductById(this.qnaData.productId);
    console.log(product);
    
    // this.productName = product.name;
  }

  showProduct() {
    this.navCtrl.push(ProductDetailPage, {id: this.qnaData.productId});
  }

}
