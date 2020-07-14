
export interface SurveyQuestion {
  id: number,
  createdOn: Date,
  updatedOn: Date,
  question?: string,
  type: string,
  category: string,
  options?: Array<{
    id: number,
    createdOn: Date,
    updatedOn?: Date,
    value:string
  }>,
  languageDetailDTOList?:Array<{
    id: number,
    createdOn: Date,
    updatedOn?: Date,
    extendedQuestion:string,
    questionDescription:string,
    language: string
  }>,
  questionIntensityDTOList?: Array<{
    id: number,
    createdOn: Date,
    updatedOn?: Date,
    intensity:string,
    value:string
  }>,
  questionSubjectDTOList?: Array<{
    id: number,
    createdOn: Date,
    updatedOn?: Date,
    subject:string,
    value:string
  }>,
  child:boolean;
}
