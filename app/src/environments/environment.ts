import { Environment } from "./environment.interface";

var backendUrl = 'http://10.183.227.162:8080/';
export const ENV: Environment = {
  name: 'default',
  production: false,
  isDebugMode: true,
  backendUrl: backendUrl,
  apkDownloadUrl: 'http://android.pjdaren.com/',
  iosDownloadUrl: 'http://ios.pjdaren.com/',
  ugcPageSize: 4,
  ugcRelated: true,
  imageUrl: backendUrl + "api/v1/image/",
  setGuest: false,
  webpageUrl: "http://show.pjdaren.com/"
};
