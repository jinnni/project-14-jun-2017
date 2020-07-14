import { Environment } from "./environment.interface";

export const ENV: Environment = {
  name: 'prod',
  production: true,
  isDebugMode: false,
  backendUrl: 'http://47.100.219.37:8081/services/pjdarenapi/',
  apkDownloadUrl: 'http://android.pjdaren.com/',
  iosDownloadUrl: 'http://ios.pjdaren.com/',
  ugcPageSize: 4,
  ugcRelated: false,
  imageUrl: "http://pjdaren.oss-cn-shanghai.aliyuncs.com/wom/prod/",
  setGuest: false,
  webpageUrl: "http://show.pjdaren.com/"
};
