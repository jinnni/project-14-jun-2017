import { Environment } from "./environment.interface";

export const ENV: Environment = {
  name: 'pre-prod',
  production: false,
  isDebugMode: true,
  backendUrl: 'http://47.100.253.183:8080/',
  apkDownloadUrl: 'http://47.100.253.183/releases/android/pjdaren-latest.apk',
  iosDownloadUrl: 'http://ios.pjdaren.com/',
  ugcPageSize: 4,
  ugcRelated: false,
  imageUrl: "http://pjdaren.oss-cn-shanghai.aliyuncs.com/wom/prod/",
  setGuest: false,
  webpageUrl: "http://show.pjdaren.com/"
};
