export interface Environment {
    name: string,
    production : boolean,
    isDebugMode: boolean,
    backendUrl: string,
    apkDownloadUrl: string,
    iosDownloadUrl: string,
    ugcPageSize: number,
    ugcRelated: boolean,
    imageUrl: string,
    setGuest:boolean,
    webpageUrl: string
}