import {TimeLinePage} from "./timeline";
import {ProductService} from "../../services/productService";
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
import {IonicPageModule} from "ionic-angular";
import {NgModule} from "@angular/core";
import {ImageSlidesModule} from "../../components/image-slides/image-slides.module";
import {ProductDetailPageModule} from "../product-detail/product-detail.module";
import {ProductCategoryPageModule} from "../product-category/product-category.module";
import {ArticlePageModule} from "../article/article.module";
import {ArticleItemComponent} from "../../components/article-item/article-item";
import { IonicImageLoader } from 'ionic-image-loader';
import { SearchListPageModule } from "../search-list/search-list.module";
import { SwiperModule } from 'ngx-swiper-wrapper';
import { SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
     a11y: true,




    direction: 'horizontal',
    slidesPerView: 1,
    speed: 1000,
    keyboard: true,
    autoplay: {
      delay: 2000,
      reverseDirection: false,
      disableOnInteraction: false,
      stopOnLastSlide: false
    },
    loop: true,
    mousewheel: true,
    scrollbar: false,
    navigation: false,
    pagination: false,

};

@NgModule({
  declarations: [
    TimeLinePage,
    ArticleItemComponent
  ],
  imports: [
    IonicPageModule.forChild(TimeLinePage),
    FooterMenuModule,
    ImageSlidesModule,
    ProductDetailPageModule,
    ProductCategoryPageModule,
    IonicImageLoader,
    ArticlePageModule,
    SearchListPageModule,
    SwiperModule
  ],
  providers: [
    
    ProductService, {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG

    }
  ]
})
export class TimeLinePageModule {
}

