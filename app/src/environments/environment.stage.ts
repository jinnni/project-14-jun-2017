import { Environment } from "./environment.interface";

var backendUrl = 'http://106.14.164.125:8083/';
export const ENV: Environment = {
  name: 'stage',
  production: false,
  isDebugMode: true,
  backendUrl: backendUrl,
  apkDownloadUrl: 'http://106.14.164.125/releases/android/pjdaren-latest.apk',
  iosDownloadUrl: 'http://ios.pjdaren.com/',
  ugcPageSize: 4,
  ugcRelated: false,
  //imageUrl: backendUrl + "api/v1/image/",
  imageUrl: "http://pjdaren.oss-cn-shanghai.aliyuncs.com/wom/prod/",
  setGuest: false,
  webpageUrl: "http://show.pjdaren.com/"
};