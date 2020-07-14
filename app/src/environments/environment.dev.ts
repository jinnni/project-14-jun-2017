import { Environment } from "./environment.interface";

var backendUrl = 'http://106.14.164.125:8082/';
// var backendUrl = 'http://47.100.219.37:8081/services/pjdarenapi/';
export const ENV: Environment = {
  name: 'dev',
  production: true,
  isDebugMode: false,
  backendUrl: backendUrl,
  apkDownloadUrl: 'http://android.pjdaren.com/',
  iosDownloadUrl: 'http://ios.pjdaren.com/',
  ugcPageSize: 4,
  ugcRelated: false,
  imageUrl: "http://pjdaren.oss-cn-shanghai.aliyuncs.com/wom/prod/",
  setGuest: false,
  webpageUrl: "http://show.pjdaren.com/"
};
