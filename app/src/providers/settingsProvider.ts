export class SettingsProvider {
  currentTab: number = 0;
  isMenuOpened:boolean = false;
  currentPageRefresh: string = "none";
  isActivate = false;
  badgeCount = '';
  badgeCounter = '';
  qtcBadgeCounter = '';
  msgBadgeCounter = '';
  campBadgeCounter = '';
  userStatus:any;
  statusbarStatus=false;
  statusbarColor='#ffffff';
  showSearch = false;
  slider:any;
  productSlider:any;
  statusBar:any;
  campaignListResp:any;
  campaigns=[];
  // TODO: save and provide the id of current user
  getCurrentUserId(): number {
    return 1;
  }
  getCurrentPage(): string{
    return this.currentPageRefresh;
  }
  setCurrentPage(pageName: string){
    this.currentPageRefresh = pageName;
  }
  setUserStatus(resp){
    if(resp){
      this.userStatus = resp;
    }
  }
  getUserStatus(){
    return this.userStatus;
  }
}
