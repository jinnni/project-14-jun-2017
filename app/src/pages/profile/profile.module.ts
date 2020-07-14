import {ProfilePage} from "./profile";
import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {ProfileSocialImpactPage} from "../profile-social-impact/profile-social-impact";
import {ProfileSettingsModule} from "../profile-settings/profile-settings.module";
import {SettingsProvider} from "../../providers/settingsProvider";
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
import {CampaignListPageModule} from "../campaign-list/campaign-list.module";
import {ProfileMyBadgePageModule} from "../profile-my-badge/profile-my-badge.module";
import {SurveyIntroPageModule} from "../survey-intro/survey-intro.module";
import {CustomHtmlPageModule} from "../custom-html/custom-html.module";
import {ProfileMyUgcPageModule} from "../profile-my-ugc/profile-my-ugc.module";
import {ProfileMyPicturePageModule} from "../profile-my-picture/profile-my-picture.module";
import {ProfileMyLikePageModule} from "../profile-my-like/profile-my-like.module";
import {FollowersPageModule} from "../followers/followers.module";
import {FollowingsPageModule} from "../followings/followings.module";
import { IonicImageLoader } from 'ionic-image-loader';
import {KnowMorePage} from "../know-more/know-more";
import {EditorScorePageModule} from "../editor-score/editor-score.module";



@NgModule({
  declarations: [
    ProfilePage,
    KnowMorePage,
    ProfileSocialImpactPage
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    ProfileSettingsModule,
    FooterMenuModule,
    CampaignListPageModule,
    ProfileMyBadgePageModule,
    SurveyIntroPageModule,
    CustomHtmlPageModule,
    ProfileMyUgcPageModule,
    ProfileMyPicturePageModule,
    ProfileMyLikePageModule,
    FollowersPageModule,
    FollowingsPageModule,
    IonicImageLoader,
    EditorScorePageModule
  ],
  entryComponents: [
    ProfilePage,
    ProfileSocialImpactPage,
    KnowMorePage
  ],
  providers: [
    SettingsProvider
  ]
})
export class ProfilePageModule {
}
