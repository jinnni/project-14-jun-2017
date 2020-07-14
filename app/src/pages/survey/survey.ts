import {Component, ViewChild, ElementRef} from '@angular/core';
import {IonicPage, NavParams, ToastController, Platform, NavController, TextInput, Content} from "ionic-angular";
import {SurveyQuestion} from "../../data/surveyQuestion.interface";
import {SurveyAnswer} from "../../data/surveyAnswer.interface";
import {HttpService} from "../../services/httpService";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-survey',
  templateUrl: 'survey.html'
})
export class SurveyPage {
  // @ViewChild('mydiv') mydiv: ElementRef;
  // @ViewChild('mydiv1') mydiv1: ElementRef;
  // @ViewChild('myInput') myInput: TextInput;
  @ViewChild('mydiv') mydiv: ElementRef;
  @ViewChild('banner') banner: ElementRef;
  @ViewChild('answer1') answer1: ElementRef;
  @ViewChild('myInput') myInput: TextInput;
  @ViewChild(Content) content: Content;
  marginValue = '0px';
  contain:any;
  surveyType: string;
  questionData: SurveyQuestion;
  questionList: SurveyQuestion[];
  answer: SurveyAnswer;
  selectedItems: Array<number>;
  selectedIntensityItems: any;
  // selectedIntensityItems: {
  //   [index: string]: number
  // } = {};
  open_text_answer: string="";
  enableOther:boolean=false
  selectLanguage = "chinese";
  imageUrl: string;
  options:any;
  questionIntensityDTOList:any;
  questionSubjectDTOList:any;
  imageTypeMultipleChoice:boolean;
  imageTypeSingleChoice:boolean;
  imageTypeIntensity:boolean;
  counter: boolean = true;
  surveyStatus = "";
  maxCharacterLength = 5;
  clearTimeOut:any;
  load = false;
  characterLength = 0;
  constructor(public navParams: NavParams,
              private toastCtrl: ToastController,
              public navCtrl: NavController,
              public platform: Platform,
              private httpService: HttpService,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    clearTimeout(this.clearTimeOut);
    this.open_text_answer = "";
    this.surveyType = navParams.get("type");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.selectLanguage = "chinese";
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform, this.navCtrl);
    this.selectedItems = [];
    this.selectedIntensityItems = [];
    this.getNextQuestionData();
  }
  change(value) {
    let trimValue = value.replace(/\s/g,'');
    this.open_text_answer = trimValue;
    this.characterLength = trimValue.length;
    if (trimValue.length >= this.maxCharacterLength) {
      this.counter = false;
    } else {
      this.counter = true;
    }
    if(trimValue.length > 50){
      value = '';
      this.open_text_answer = value;
    }
  }

  jsonStringyfy(data){
    return JSON.stringify(data);
  }
  /*Get next Question Data if the Previous Question is Answered or Skipped*/
  getNextQuestionData() {
    this.httpService.GetNextQuestionData().subscribe(res => {
      this.load = false;
      var ele = document.querySelector(".submit-btn");
      if(ele != null){
        ele.removeAttribute('disabled');
      }
      this.enableOther=false;
      this.imageTypeMultipleChoice=false;
      this.imageTypeSingleChoice=false;
      this.imageTypeIntensity=false;
      this.counter = true;
      this.open_text_answer = "";
      this.selectedItems = [];
      this.characterLength = 0;
      clearTimeout(this.clearTimeOut);
      this.marginValue = '0px';
      this.mydiv.nativeElement.scrollTop = 0;
      if(res.hasOwnProperty("surveyStatus") == true){
        if(res["surveyStatus"] == "completed"){
          this.surveyStatus = 'complete';
          return;
        }
      }
      this.enableOther=false;
      if (!res.hasOwnProperty("surveyStatus")) {
        res.isTitleSelected = false;
        this.questionData = res;
        this.options = [];
        this.questionIntensityDTOList = [];
        this.questionSubjectDTOList = [];
        this.selectedIntensityItems = [];
        if(this.questionData.options != []){
          for(let index = 0; index < this.questionData.options.length; index++){
            if(this.questionData.type == "multiple_choice" && this.questionData.options[index].hasOwnProperty("imageName") == true){
              if(this.questionData.options[index]["imageName"] != "" || this.questionData.options[index]["imageName"] != null || this.questionData.options[index]["imageName"] != undefined){
                this.imageTypeMultipleChoice=true;
              }
            }
            if(this.questionData.type == "single_choice" && this.questionData.options[index].hasOwnProperty("imageName") == true){
              if(this.questionData.options[index]["imageName"] != "" || this.questionData.options[index]["imageName"] != null || this.questionData.options[index]["imageName"] != undefined){
                this.imageTypeSingleChoice=true;
              }
            }
            if(this.questionData.options[index]["language"].toLowerCase() == this.selectLanguage.toLowerCase()){
              this.options.push(this.questionData.options[index]);
            }
          }
        }
        if(res.hasOwnProperty("questionIntensityDTOList")){
          if(this.questionData.questionIntensityDTOList != []){
            for(let index = 0; index < this.questionData.questionIntensityDTOList.length; index++){
              if(this.questionData.questionIntensityDTOList[index]["language"].toLowerCase() == this.selectLanguage.toLowerCase()){
                if(this.questionData.type == "intensity" && this.questionData.questionIntensityDTOList[index].hasOwnProperty("imageName") == true){
                  if(this.questionData.questionIntensityDTOList[index]["imageName"] != "" || this.questionData.questionIntensityDTOList[index]["imageName"] != null || this.questionData.questionIntensityDTOList[index]["imageName"] != undefined){
                    this.imageTypeIntensity=true;
                  }
                }
                if(this.questionData.questionIntensityDTOList[index].hasOwnProperty("intensity")){
                  this.questionData.questionIntensityDTOList[index].value = this.questionData.questionIntensityDTOList[index].intensity;
                  this.questionIntensityDTOList.push(this.questionData.questionIntensityDTOList[index]);
                  this.selectedIntensityItems[this.questionData.questionIntensityDTOList[index].id] = [];
                }
              }
            }
          }
        }
        if(res.hasOwnProperty("questionSubjectDTOList")){
          if(this.questionData.questionSubjectDTOList != []){
            for(let index = 0; index < this.questionData.questionSubjectDTOList.length; index++){
              if(this.questionData.questionSubjectDTOList[index]["language"].toLowerCase() == this.selectLanguage.toLowerCase()){
                if(this.questionData.questionSubjectDTOList[index].hasOwnProperty("subject")){
                  this.questionData.questionSubjectDTOList[index].value = this.questionData.questionSubjectDTOList[index].subject;
                  this.questionSubjectDTOList.push(this.questionData.questionSubjectDTOList[index]);
                }
              }
            }
          }
        }
        setTimeout(() => {
          var ele = document.querySelector(".submit-btn");
          ele.removeAttribute("disabled");
        }, 500);
      } else {
        this.questionData = null;
      }
    });
  }
  isSelected(choice) {
    const indexFound = this.selectedItems.findIndex(item => {
      return item == choice.id;
    });
    return indexFound >= 0;
  }
  isSelectedIntensity(choice, subject) {
    const indexFound = this.selectedIntensityItems[choice.id].findIndex(item => {
      return item == subject.id;
    });
    return indexFound >= 0;
  }

  toggleCheckboxItem(choice) {
    const indexFound = this.selectedItems.findIndex(item => {
      return item == choice.id;
    });

    // add if item doesn't exist
    if (indexFound < 0) {
      this.selectedItems.push(choice.id);
    }
    // remove if item exists
    else {
      this.selectedItems.splice(indexFound, 1);
    }
  }
  toggleCheckboxItemForIntensity(choice,subject) {
    const indexFound = this.selectedIntensityItems[choice.id].findIndex(item => {
      return item == subject.id;
    });
    
    // add if item doesn't exist
    if (indexFound < 0) {
      this.selectedIntensityItems[choice.id].push(subject.id);
    }
    // remove if item exists
    else {
      this.selectedIntensityItems[choice.id].splice(indexFound, 1);
    }
  }
  onBlurText(questionData){
    this.clearTimeOut = setTimeout(() => {
      this.marginValue = "0px";
      this.mydiv.nativeElement.scrollTop = 100000 * 2;
    }, 1000);
    // console.log('1',this.marginValue);
    // if(questionData.type == "single_choice"){
    //   this.mydiv.nativeElement.style.marginTop = '0px';
    // }else if(questionData.type == "multiple_choice"){
    //   this.mydiv1.nativeElement.style.marginTop = '0px';
    // }
    // console.log("1",this.mydiv1.nativeElement.style.marginTop);
    
  }
  onFocusText(questionData){
    
    // if(questionData.type == "single_choice"){
    //   this.mydiv.nativeElement.style.marginTop = -(this.mydiv.nativeElement.clientHeight - 100) + 'px';
    // }else if(questionData.type == "multiple_choice"){
    //   this.mydiv1.nativeElement.style.marginTop = -(this.mydiv1.nativeElement.clientHeight - 100) + 'px';
    // }
    // console.log("ee",this.mydiv1.nativeElement.style.marginTop);
    let viewport = (this.content.getElementRef().nativeElement.clientHeight / 2);
    if (this.banner != undefined){
      this.contain = this.banner.nativeElement.clientHeight + this.answer1.nativeElement.clientHeight + 100;
      if(this.contain >= this.mydiv.nativeElement.clientHeight){
        if(questionData.type == "single_choice" || questionData.type == "multiple_choice" || questionData.type == "open_text"){
          this.marginValue = - (this.contain - 165) + 'px';
        }
      }else{
        if(questionData.type == "single_choice" || questionData.type == "multiple_choice" || questionData.type == "open_text"){
          this.marginValue = - (this.banner.nativeElement.clientHeight + this.answer1.nativeElement.clientHeight - 65) + 'px';
        }
      }
    }else{
      this.contain = this.answer1.nativeElement.clientHeight + 100;
      if(this.contain >= this.mydiv.nativeElement.clientHeight){
        if(questionData.type == "single_choice" || questionData.type == "multiple_choice" || questionData.type == "open_text"){
          this.marginValue = - (this.contain - 165) + 'px';
        }
      }else{
        if(questionData.type == "single_choice" || questionData.type == "multiple_choice"){
          this.marginValue = - (this.answer1.nativeElement.clientHeight - 65) + 'px';
        }
      }
    }
    console.log( this.marginValue);
  }
  
  clickItem(choice, subject) {
    switch (this.questionData.type) {
      case "single_choice": {
        if(typeof(choice) == 'object'){
          if(choice.openResponseFlag == true){
            this.enableOther = true;
            this.mydiv.nativeElement.scrollTop = 100000 * 2;
          }
          else{
            this.enableOther = false;
            this.open_text_answer = '';
          }
          this.selectRadioButtonItem(choice);
        }
      }
      break;
      case "multiple_choice": {
        if(typeof(choice) == 'object'){
          if(choice.openResponseFlag == true){
            this.enableOther = !this.enableOther;
            if(this.enableOther  == true){
              this.mydiv.nativeElement.scrollTop = 100000 * 2;
            }else{
              this.enableOther = false;
              this.open_text_answer = '';
            }
          }
        this.toggleCheckboxItem(choice);
      }
      }
      break;
      case "intensity": {
        this.selectRadioButtonItemForIntensity(choice,subject);
      }
      break;
      case "multiple_choice_intensity": {
        this.toggleCheckboxItemForIntensity(choice,subject);
      }
      break;
      case "multiple_columns": {
        if(typeof(choice) == 'object'){
          if(choice.openResponseFlag == true){
            this.enableOther = true;
            this.mydiv.nativeElement.scrollTop = 100000 * 2;
          }
          else{
            this.enableOther = false;
            this.open_text_answer = '';
          }
          this.selectRadioButtonItem(choice);
        }
      }
      break;
    }
  }

  /*drop_down_list*/
  onChange(selectedValue, options) {
    for (let value of options) {
      if (value.value == selectedValue) {
        this.selectedItems[0] = value.id;
      }
    }
  }
  toastMessage(msg){
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
  
  /*submit answer*/
  submit(questionId: number) {
    var ele = document.querySelector(".submit-btn");
    this.open_text_answer = this.open_text_answer.trimLeft();
    this.open_text_answer = this.open_text_answer.trimRight();
    clearTimeout(this.clearTimeOut);
    if (this.questionData.type == "open_text") {
      this.selectedItems = [];
      this.selectedIntensityItems = [];
      if (this.counter) {
        this.toastMessage("请添加不少于 5 字符 ");
        return;
      }
      ele.setAttribute("disabled","true");
      this.load = true;
      this.httpService.GiveProfileSurveyAnswer(questionId, this.selectedItems, this.open_text_answer, false).subscribe(res => {
        this.getNextQuestionData();
      });
    } else if (this.questionData.type == "single_choice" || this.questionData.type == "multiple_choice" || this.questionData.type == "drop_down_list"){
      if(this.selectedItems.length == 0){
        this.toastMessage("请选择一个选项！");
        return;
      }
      if (this.selectedItems.length > 0){
        if (this.counter && this.enableOther) {
          this.toastMessage("请添加不少于 5 字符 ");
          return;
        } else {
          ele.setAttribute("disabled","true");
          this.load = true;
          this.httpService.GiveProfileSurveyAnswer(questionId, this.selectedItems, this.open_text_answer, false).subscribe(res => {
            this.getNextQuestionData();
          });
        }
      }
    } else if (this.questionData.type == "intensity"){
       if(this.selectedIntensityItems.length > 0) {
        var options = [];
        var value;
        let subject = [];
        var jsonArray = [];
        for (const key in this.selectedIntensityItems) {
          if (this.selectedIntensityItems.hasOwnProperty(key)) {
            if(this.selectedIntensityItems[key][0] != undefined){
              options.push(key);
              subject.push(this.selectedIntensityItems[key][0]);
            }
          }
        }
        if(subject.length == this.questionIntensityDTOList.length  && subject.length == options.length){
          ele.setAttribute("disabled","true");
          for (const key in this.selectedIntensityItems) {
            if (this.selectedIntensityItems.hasOwnProperty(key)) {
              value = this.selectedIntensityItems[key][0];
              jsonArray.push({"questionId":questionId,"subjectId":value,"intensityId": Number(key)});
            }
          }
          this.httpService.GiveProfileSurveyIntensityAnswerNew(questionId, jsonArray,false).subscribe(res => {
            if(options.length == this.questionIntensityDTOList.length && subject.length == options.length){
              this.httpService.GiveProfileSurveyAnswer(questionId, options, this.open_text_answer, false).subscribe(res => {
                this.getNextQuestionData();
              });
            }
          });
        }else{
          this.toastMessage("请将每一行回答补充完整！");
        }
      } else {
        this.toastMessage("请选择一个选项！");
      }
    }
  }
  selectRadioButtonItem(choice) {
    this.selectedItems.length = 0;
    this.selectedItems.push(choice.id);
    this.open_text_answer == "";
  }
  selectRadioButtonItemForIntensity(choice,subject) {
    choice.isTitleSelected = true;
    this.selectedIntensityItems[choice.id] = ([subject.id]);
  }
}
