import {SurveyQuestion} from "./surveyQuestion.interface";
export interface SurveyAnswer {
  id: number,
  createdOn: Date,
  updatedOn: Date,
  questionId: number,
  question: SurveyQuestion,
  userId: number,
  user:{
    id:number;
    login:string;
    name:string;
    nickname:string;
    email:string;
    profileImage:string;
    backgroundImage:string;
    activated:boolean;
    langKey:string;
    score:number;
    createdBy:string;
    createdDate:Date;
    lastModifiedBy:string;
    lastModifiedDate:Date;
    authorities:string[];
  },
  selectedOptions?: Array<{
    id: number,
    createdOn: Date,
    updatedOn?: Date,
    value:string
  }>,
  answer:string;
  skipped:boolean;
}
