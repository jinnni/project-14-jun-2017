import {Component, ViewChild, ElementRef} from '@angular/core';
import {IonicPage,NavController,NavParams,ToastController,Platform,AlertController,App, TextInput, Content} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Util} from "../../global/util";
import { DeliveryInfoPage } from '../../pages/delivery-info/delivery-info';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-pre-survey-campaign',
  templateUrl: 'pre-survey-campaign.html',
})
export class PreSurveyCampaignPage {
  @ViewChild('banner') banner: ElementRef;
  @ViewChild('answer') answer: ElementRef;
  @ViewChild('myInput') myInput: TextInput;
  @ViewChild('cont') content: Content;
  marginValue = '0px';
  contain:any;
  agreementIsChecked: boolean;
  noticeData: any; // campData: any;
  campaignData;
  campaignMember;
  questionList: any;
  selectedItems: Array<number> = [];
  badge: any;
  imageUrl: string;
  maxCharacterLength = 5;
  meter = 0;
  language = 'chinese'
  clearTimeOut:any;
  surveyStatus = false;
  choiceMin = 0;
  choiceMax = 0;
  step = 0;
  limitChoice = false;
  hasIntroStatement = false;
  load = false;
  characterCounter: boolean = true;
  showTncPage = false;
  enableOtherResponse = false;
  hasFocus = false;
  introStatement = '';
  introImage = '';
  question = '';
  description = '';
  extendedQuestion = '';
  optionList = [];
  subjectIntensityList = [];
  openTextAnswer: string = "";
  openTextNumeric: string = "";
  questionData: any;
  buttonElement;
  characterLength = 0;
  rangeValue = 0;
  rangeMin = 0;
  rangeMax = 0;
  constructor(public navCtrl: NavController,
    public appCtrl: App,
    public navParams: NavParams,
    public platform: Platform,
    public httpService: HttpService,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private settingsProvider:SettingsProvider) {
    clearTimeout(this.clearTimeOut);
    this.noticeData = navParams.get("noticeData");
    this.campaignData = this.noticeData.campaignData;
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.badge = navParams.get("badge");
    this.initSurvey();
  }
  initSurvey(){
    let badgeId;
    if (this.badge) {
      badgeId = this.badge.id;
    }
    this.httpService.GetNextSurveyQuestion(this.campaignData.id, this.noticeData.from, badgeId).subscribe(res => {
      console.log(res);
      this.loadSurvey(res);
      this.content.resize();
    },error => {
      console.log(error);
      this.httpService.GetIntroStatement(this.campaignData.id, this.noticeData.from).subscribe(res => {
        this.hasIntroStatement = true;
        this.introStatement = res.introStatement;
        this.introImage = res.ImageName;
      },error => {});
    });
  }
  
  loadSurvey(res){
    this.reset();
    this.meter = Math.round(res.completion);
    this.surveyStatus = res.surveyStatus;
    if(!this.surveyStatus) {
      if(res.question){
        this.questionData = res.question;
        this.question = this.questionData.question;
        if(this.questionData.options){
          for (let index = 0; index < this.questionData.options.length; index++) {
            if (this.questionData.options[index].language.toLowerCase() === this.language.toLowerCase()) {
              this.questionData.options[index].isSelected = false;
              this.questionData.options[index].isShaded = false;
              if(this.questionData.type == 'slider'){
                console.log("removed 2");
                this.rangeMin = Number(this.questionData.options[0].value);
                this.rangeMax = Number(this.questionData.options.length - 1);
                this.step = Number(this.questionData.options.length);
                let self = this;
                setTimeout(() => {
                  self.rangeValue = 0;
                  let ele = document.querySelectorAll(".range-tick");
                  console.log("removed 3",ele.length);
                  for (let index = 0; index < ele.length; index++) {
                    let x = ele[index];
                    if(self.questionData.options[index] != undefined){
                      x.innerHTML = '<b>'+self.questionData.options[index].value+'</b>';
                    }
                  }
                }, 800);
              }
              if(this.questionData.options[index].openResponseFlag){
                if(this.questionData.type == 'rating'){
                  this.questionData.options[index].isSelected = true;
                  this.enableOtherResponse = true;
                }
              }
              this.optionList.push(this.questionData.options[index]);
            }
          }
        }
        let subject = [];
        let combination;
        if(this.questionData.questionSubjectDTOList){
          subject = this.questionData.questionSubjectDTOList;
          for (let index = 0; index < subject.length; index++) {
            if (subject[index].language.toLowerCase() === this.language.toLowerCase()) {
              subject[index].isTitleSelected = false;
              subject[index].toggle = false;
              subject[index].value = [];
              let intensity = [];
              if(this.questionData.questionIntensityDTOList){
                intensity = this.questionData.questionIntensityDTOList;
                let temp = [];
                combination = [];
                for (let index1 = 0; index1 < intensity.length; index1++) {
                  if (intensity[index1].language.toLowerCase() === this.language.toLowerCase()) {
                    combination = subject[index].questionSubjectCode + '.' + intensity[index1].questionIntensityCode;
                    temp.push({isSelected: false, isShaded:false, combination: combination, optionId: this.matchingOption(combination), option: intensity[index1]});
                  }
                }
                subject[index].options = temp;
              }
              this.subjectIntensityList.push(subject[index]);
            }
          }
        }
        if(this.questionData.languageDetailDTOList.length > 0){
          if(this.questionData.languageDetailDTOList[0].questionDescription){
            this.description = this.questionData.languageDetailDTOList[0].questionDescription;
          }
          if(this.questionData.languageDetailDTOList[0].extendedQuestion){
            this.extendedQuestion = this.questionData.languageDetailDTOList[0].extendedQuestion;
          }
        }
        if(this.questionData.limitChoice){
          this.limitChoice = this.questionData.limitChoice;
          this.choiceMax = this.questionData.choiceMax;
          this.choiceMin = this.questionData.choiceMin;
        }
      }
      if(res.campaignMember){
        this.campaignMember = res.campaignMember;
      }
    } else {
      if(this.noticeData.from == "pre-survey" || this.noticeData.from == "quick-try-free"){
        this.showTncPage = true;
        this.agreementIsChecked = true;
        this.httpService.GetPendingCampaignCount().subscribe(res =>{
          this.settingsProvider.qtcBadgeCounter = res.pendingQTC;
          this.settingsProvider.campBadgeCounter = res.pendingChallenges + res.pendingPostSurveys;
        });
      } else if(this.noticeData.from == "post-survey"){
        this.showAlert('恭喜恭喜，已完成启动！', '如最终被选的话你即将还会收到通知，感谢您的配合！',this.navCtrl.pop());
      }
    }
  }
  onInput(event){
    let hasDot = false;
    if (this.openTextNumeric != '') {
      if (this.openTextNumeric.indexOf('.') >= 0) {
        hasDot = true;
      }
    }
    if((event.which === 190 && hasDot) || (event.which === 46 && hasDot)){
      event.preventDefault();
    }
    if(event.which === 45 || event.which === 43) {
      event.preventDefault();
    }
  }
  selectOption(subject, intensity, option){
    if (this.questionData.type == 'rating') {
      this.questionData.options.forEach(element => {
        if(!element.openResponseFlag){
          element.isShaded = false;
          element.isSelected = false;
        }
      });
      this.questionData.options.forEach(element => {
        if(Number(element.value) <= Number(option.value)){
          element.isShaded = true;
        }
      });
      option.isSelected = true;
      option.isShaded = true;
    } else if (this.questionData.type == 'single_choice' || this.questionData.type == 'screening_single') {
      this.questionData.options.forEach(element => {
        element.isSelected = false;
      });
      option.isSelected = true;
      this.enableOtherResponse = option.openResponseFlag;
    } else if (this.questionData.type == 'multiple_choice' || this.questionData.type == 'screening_multiple') {
      option.isSelected = !option.isSelected;
      this.questionData.options.forEach(element => {
        if (element.isSelected && element.openResponseFlag) {
          this.enableOtherResponse = true;
        }
      });
      if (!option.isSelected && option.openResponseFlag) {
        this.enableOtherResponse = false;
      }
    } else {
      if(this.questionData.type == 'intensity'){
        for (let index = 0; index < subject.options.length; index++) {
          if (subject.options[index].isSelected) {
            subject.options[index].isSelected = !subject.options[index].isSelected;
          }
        }
        intensity.isSelected = !intensity.isSelected;
        subject.value[0] = intensity.option.intensity;
      }
      if(this.questionData.type == 'intensity_multiple'){
        intensity.isSelected = !intensity.isSelected;
        let temp = [];
        for (let index = 0; index < subject.options.length; index++) {
          if (subject.options[index].isSelected == true) {
            temp.push(subject.options[index].option.intensity);
          }
        }
        subject.value = temp;
      }
      if(this.questionData.type == 'ranking'){
        this.subjectIntensityList.forEach(element => {
          if(intensity.option.intensity == element.value[0]){
            element.value.length = 0;
          }
          element.options.forEach(element1 => {
            element1.isSelected = false;
            element1.isShaded = false;
            if(intensity.option.intensity == element1.option.intensity || element1.option.intensity == element.value[0]){
              element1.isShaded = true;
            }
          });
        });
        intensity.isSelected = !intensity.isSelected;
        subject.value[0] = intensity.option.intensity;
        this.subjectIntensityList.forEach(element => {
          element.options.forEach(element1 => {
            if(element.value[0] == element1.option.intensity){
              element1.isSelected = true;
            }
            if(element.value.length > 0){
              element1.isShaded = true;
            }
            this.subjectIntensityList.forEach(element2 => {
              if (element2.value[0] == element1.option.intensity) {
                element1.isShaded = true;
              }
            });
          });
        });
      }
      if(this.questionData.type == 'intensity_multiple' && this.limitChoice){
        if(subject.value.length >= this.choiceMin && subject.value.length <= this.choiceMax){
          subject.isTitleSelected = true;
        }else{
          subject.isTitleSelected = false;
        }
      } else {
        if(subject.value.length > 0){
          subject.isTitleSelected = true;
        }else{
          subject.isTitleSelected = false;
        }
      }
      
    }
    if (this.enableOtherResponse && this.questionData.type != 'rating') {
      let bannerHeight = '0';
      if(this.banner) {
        bannerHeight = this.banner.nativeElement.clientHeight;
      }
      setTimeout(() => {
        this.content._scrollContent.nativeElement.scrollTop = this.answer.nativeElement.clientHeight + bannerHeight;
        console.log(this.content._scrollContent.nativeElement.scrollTop);
      }, 100);
    } else {
      if(this.questionData.type != 'rating'){
        this.openTextAnswer = '';
        this.characterCounter = true;
      }
    }
  }
  onOpentextClick(){
    setTimeout(() => {
      this.myInput.setFocus();
    },100);
  }
  onOpentextBlur(){
    setTimeout(() => {
      this.marginValue = '0px';
    }, 100);
  }
  onOpentextFocus(){
    setTimeout(()=>{
      this.spaceCalculation();
    },200);
  }
  spaceCalculation(){
    let self = this;
    let bannerHeight = '0';
    if(this.banner) {
      bannerHeight = this.banner.nativeElement.clientHeight;
    }
    setTimeout(() => {
      this.contain = this.answer.nativeElement.clientHeight + Number(bannerHeight);
      console.log(this.contain,this.content.getElementRef().nativeElement.clientHeight);
      if(this.contain >= this.content.getElementRef().nativeElement.clientHeight){
        if(self.questionData.type == 'rating' || self.questionData.type == 'numeric_input' || self.questionData.type == 'open_text'){
          self.content._scrollContent.nativeElement.scrollTop = self.contain - 100;
          console.log("if",self.content._scrollContent.nativeElement.scrollTop);
        } else{
          self.content._scrollContent.nativeElement.scrollTop = self.contain;
        }
      }else{
        if (self.questionData.type == 'rating' && bannerHeight == '0'){
          self.content._scrollContent.nativeElement.scrollTop = 110;
          console.log("else 1",self.content._scrollContent.nativeElement.scrollTop);
        } else if ((self.questionData.type == 'numeric_input' || self.questionData.type == 'open_text') && bannerHeight == '0') {
          self.content._scrollContent.nativeElement.scrollTop = 0;
        } else if(self.questionData.type == 'rating' || self.questionData.type == 'numeric_input' || self.questionData.type == 'open_text'){
          self.content._scrollContent.nativeElement.scrollTop = self.contain / 2;
          console.log("else 2",self.content._scrollContent.nativeElement.scrollTop);
        } else{
          self.content._scrollContent.nativeElement.scrollTop = self.contain;
        }
      }
    }, 100);
  }
  submitIntroStatement(){
    this.httpService.AddIntroStatementSataus(this.campaignData.id, this.noticeData.from).subscribe(res => {
      this.initSurvey();
    },error => {});
  }
  submitSurvey(){
    let selectedOptionArray = [];
    let selectedMultipleChoiceIntensityOptionArray = [];
    let answer = '';
    let subjectList = this.subjectIntensityList;
    let optionList = this.optionList;
    let hasNotSelected = false;
    if(this.questionData.type == 'numeric_input'){
      if (this.openTextNumeric === "") {
        this.showToast('请添加不少于1字符 ','bottom');
        return;
      }
      if (this.limitChoice) {
        if (Number(this.openTextNumeric) < this.choiceMin) {
          this.showToast(' 至少选择 ' + this.choiceMin + ' 项', 'bottom');
          return;
        }
        if (Number(this.openTextNumeric) > this.choiceMax) {
          this.showToast(' 你最多可以选择 ' + this.choiceMax + ' 项', 'bottom');
          return;
        }
      }
      answer = this.openTextNumeric;
    }
    if (this.questionData.type == 'open_text' || this.enableOtherResponse) {
      if (this.openTextAnswer.length == 0 || this.openTextAnswer == null || this.openTextAnswer.length < this.maxCharacterLength) {
        this.showToast('请添加不少于5字符 ','top');
        return;
      }
      answer = this.openTextAnswer;
    }
    if (this.questionData.type == 'single_choice' || this.questionData.type == 'multiple_choice' || this.questionData.type == 'slider') {
      optionList.forEach(element => {
        if (element.isSelected) {
          selectedOptionArray.push(element.id);
        }
      });
      if(selectedOptionArray.length == 0){
        this.showToast('请将每一行回答补充完整！','bottom');
        return;
      }
    }
    if (this.questionData.type == 'rating') {
      optionList.forEach(element => {
        if (element.isSelected) {
          selectedOptionArray.push(element.id);
        }
      });
      if (this.enableOtherResponse) {
        if(selectedOptionArray.length < 2){
          this.showToast('请将每一行回答补充完整！','bottom');
          return;
        }
      } else {
        if(selectedOptionArray.length == 0){
          this.showToast('请将每一行回答补充完整！','bottom');
          return;
        }
      }
    }
    if(this.questionData.type == 'ranking') {
      subjectList.forEach(element => {
        element.options.forEach(option => {
          if (option.isSelected) {
            selectedOptionArray.push(option.optionId);
          }
        });
      });
      if(selectedOptionArray.length == 0){
        this.showToast('请将每一行回答补充完整！','bottom');
        return;
      }
      if(selectedOptionArray.length < subjectList.length){
        this.showToast('请将每一行回答补充完整！','bottom');
        return;
      }
    }
    if (this.questionData.type == 'intensity' || this.questionData.type == 'intensity_multiple') {
      subjectList.forEach((element, index) => {
        selectedMultipleChoiceIntensityOptionArray[index] = {minOpt:0};
        if (!element.isTitleSelected) {
          hasNotSelected = true;
        }
        let count = 0;
        element.options.forEach(option => {
          if (option.isSelected) {
            count++;
            selectedMultipleChoiceIntensityOptionArray[index] = {minOpt:count};
            selectedOptionArray.push(option.optionId);
          }
        });
      });
      console.log('ansData');
      if(selectedMultipleChoiceIntensityOptionArray.length == 0){
        this.showToast('请将每一行回答补充完整！','bottom');
        return;
      }
      if (this.limitChoice) {
        for (let index = 0; index < selectedMultipleChoiceIntensityOptionArray.length; index++) {
          if (selectedMultipleChoiceIntensityOptionArray[index].minOpt < this.questionData.choiceMin) {
            this.showToast(' 至少选择 ' + this.choiceMin + ' 项', 'bottom');
            return;
          }
          if (selectedMultipleChoiceIntensityOptionArray[index].minOpt > this.questionData.choiceMax) {
            this.showToast(' 你最多可以选择 ' + this.choiceMax + ' 项', 'bottom');
            return;
          }
        }
      } else {
        for (let index = 0; index < selectedMultipleChoiceIntensityOptionArray.length; index++) {
          if (selectedMultipleChoiceIntensityOptionArray[index].minOpt < 1 || selectedMultipleChoiceIntensityOptionArray.length < subjectList.length) {
            this.showToast('请将每一行回答补充完整！','bottom');
            return;
          }
        }
      }
      // if(selectedOptionArray.length == 0){
      //   this.showToast('请将每一行回答补充完整！','bottom');
      //   return;
      // }
    }
    if(this.limitChoice && (this.questionData.type == 'multiple_choice' || this.questionData.type == 'screening_multiple')){
      if(selectedOptionArray.length < this.choiceMin){
        this.showToast(' 至少选择 ' + this.choiceMin + ' 项', 'bottom');
        return;
      }
      if(selectedOptionArray.length > this.choiceMax){
        this.showToast(' 你最多可以选择 ' + this.choiceMax + ' 项', 'bottom');
        return;
      }
    }
    this.load = true;
    this.buttonElement = document.querySelector(".submit-btn");
    this.buttonElement.setAttribute("disabled","true");
    let ansData = {
      "questionId": this.questionData.id,
      "selectedOptionIds": selectedOptionArray,
      "answer": answer,
      "skipped": false,
      "userId": this.noticeData.userId
    }
    // console.log('ansData',ansData);
    this.httpService.AddPreSurveyAnswer(this.campaignData.id, ansData, this.noticeData.from)
    .subscribe(res => {
      this.questionData.type = 'none';
      this.navCtrl.push(PreSurveyCampaignPage, {'noticeData': this.noticeData, badge:this.badge}).then(()=>{
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
        console.log("removed 1");
      });
    });
  }
  onDropdownChange(selectedValue) {
    for (let value of this.optionList) {
      if (value.value == selectedValue) {
        this.selectedItems[0] = value.id;
      }
    }
  }
  rangeEvent(event){
    let y = 0;
    this.questionData.options.forEach((element, index) => {
      let ele = document.querySelectorAll(".range-tick-active b");
      let x = ele[ele.length - 1];
      y = Number(x.innerHTML);
      let ele1 = document.querySelector(".range-pin");
      ele1.innerHTML = y+'';
      if(y == element.value){
        element.isSelected = true;
      } else {
        element.isSelected = false;
      }
    });
  }
  change(value) {
    let trimValue = value.replace(/\s/g,'');
    this.openTextAnswer = trimValue;
    this.characterLength = trimValue.length;
    if (this.characterLength >= this.maxCharacterLength) {
      this.characterCounter = false;
    } else {
      this.characterCounter = true;
    }
    if(this.characterLength > 50){
      value = '';
      this.openTextAnswer = value;
    }
  }
  showAlert(title, message, callbackMethod){
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      cssClass: 'okcancel',
      buttons: [{
        text: '确认',
        handler: () => {
          if(this.noticeData.from == 'pre-survey'){
            this.httpService.DeleteMessageById(this.noticeData.id).subscribe(res =>{
              this.navCtrl.popToRoot();
              this.navCtrl.parent.select(4);
            });
          } else{
            callbackMethod;
          }
        }
      }]
    });
    alert.present();
  }
  showToast(message, position){
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: position
    });
    toast.present();
  }
  reset(){
    this.question = '';
    this.description = '';
    this.extendedQuestion = '';
    this.campaignMember = undefined;
    this.characterCounter = true;
    this.characterLength = 0;
    this.enableOtherResponse = false;
    this.optionList = [];
    this.subjectIntensityList = [];
    this.hasIntroStatement = false;
    this.openTextAnswer = '';
    this.openTextNumeric = '';
    this.limitChoice = false;
    this.choiceMax = 0;
    this.choiceMin = 0;
    this.rangeValue = 0;
    clearTimeout(this.clearTimeOut);
    if(this.buttonElement){
      this.buttonElement.removeAttribute("disabled");
    }
    this.load = false;
  }
  converted(element){
    var pushHtml = document.querySelector(element);
    pushHtml.innerHTML = this.campaignData.termsAndConditions;
  }
  matchingOption(combination){
    let id;
    this.questionData.options.forEach(element => {
      if(combination == element.questionOptionCode){
        id = element.id;
      }
    });
    return id;
  }
  toggleOption(subject){
    if(subject.toggle){
      subject.toggle = false;
      return;
    }
    let subjectList = this.questionData.questionSubjectDTOList;
    subjectList.forEach(element => {
      element.toggle = false;
    });
    subject.toggle = !subject.toggle;
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      this.settingsProvider.productSlider.startAutoplay();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.productSlider.startAutoplay();
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
        }
      }else{
        this.settingsProvider.productSlider.stopAutoplay();
        this.settingsProvider.slider.stopAutoplay();
        if(this.platform.is("ios")){
          this.settingsProvider.statusBar.styleDefault();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
        }else{
          this.settingsProvider.statusBar.styleLightContent();
          this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
        }
      }
    }
  }
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform, this.navCtrl);
  }
  DenyTerms(){
    if(this.noticeData.from == 'quick-try-free'){
      this.navCtrl.pop();
    }else{
      this.showAlert('拒绝后不能参与活动！', '你确定拒绝使用条款吗？', function(){});
    }
  }
  AcceptTerms(){
    if(!this.agreementIsChecked) {
      Util.showSimpleToastOnTop("请同意免责声明。", this.toastCtrl);
      return;
    }else{
      this.navCtrl.push(DeliveryInfoPage,{campId: this.campaignData.id, message:this.noticeData.id, from: this.noticeData.from});
    }
  }
}
