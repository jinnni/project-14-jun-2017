import {Question} from "../data/question.interface";
import questions from "../data/questions";
import answers from "../data/answers";
import {Answer} from "../data/answer.interface";
import {AnswerComment} from "../data/answerComment.interface";
import answerComments from "../data/answerComments";
import {QnaItemType} from "../global/qnaItemType";

export class QnaService {
  private questionList: Question[];
  private answerList: Answer[];
  private answerCommentList: AnswerComment[];

  constructor() {
    this.questionList = questions;
    this.answerList = answers;
    this.answerCommentList = answerComments;
  }

  getQuestionsListByProductId(productId: number): Question[] {
    return this.questionList.filter((question: Question) => {
      return question.productId == productId;
    });
  }

  getQuestionsListByUserId(userId: number): Question[] {
    return this.questionList.filter((question: Question) => {
      return question.writer.id == userId;
    });
  }

  getAnswerListByQuestionId(questionId: number): Answer[] {
    return this.answerList.filter((answer: Answer) => {
      return answer.questionId == questionId;
    });
  }

  getAnswerListByUserId(userId: number): Answer[] {
    return this.answerList.filter((answer: Answer) => {
      return answer.writer.id == userId;
    });
  }

  getAnswerCommentListByAnswerId(answerId: number): AnswerComment[] {
    return this.answerCommentList.filter((answerComment: AnswerComment) => {
      return answerComment.answerId == answerId;
    });
  }

  updatePropertyByTypeAndId(type: string, id: number, key: string, value: any) {
    const targetArray = this.getTargetArray(type);
    const foundItem = targetArray.find((item) => {
      return item.id == id;
    });
    foundItem[key] = value;
  }

  getTargetArray(type: string): any[] {
    switch (type) {
      case QnaItemType.QUESTION:
        return this.questionList;
      case QnaItemType.ANSWER:
        return this.answerList;
      case QnaItemType.ANSWER_COMMENT:
        return this.answerCommentList;
    }
  }


}
