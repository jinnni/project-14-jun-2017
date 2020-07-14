export class QnaItemType {
  static readonly QUESTION_DETAIL = "questionDetail";
  static readonly QUESTION_IN_LIST = "questionInList";
  static readonly ANSWER_DETAIL = "answerDetail";
  static readonly ANSWER_IN_LIST = "answerInList";
  static readonly ANSWER_COMMENT = "answerComment";

  static readonly QUESTION = "question";
  static readonly ANSWER = "answer";

  static getSimplifiedType(type: string): string {
    switch (type) {
      case QnaItemType.QUESTION_DETAIL:
      case QnaItemType.QUESTION_IN_LIST:
        return QnaItemType.QUESTION;
      case QnaItemType.ANSWER_DETAIL:
      case QnaItemType.ANSWER_IN_LIST:
        return QnaItemType.ANSWER;
      default:
        return type;
    }
  }
}
