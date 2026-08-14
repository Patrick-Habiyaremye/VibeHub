import { CONTENT_TYPES } from "../content";

export function prepareContent(content) {

  const adapter = CONTENT_TYPES[content.type];

  if (!adapter) {
    throw new Error(
      `Unknown content type: ${content.type}`
    );
  }


  return {
    ...content,

    questions: content.questions.map(q =>
      adapter.transformQuestion(q)
    ),

    validator: adapter.validateAnswer,

    answerType: adapter.answerType,

    hasMedia: adapter.hasMedia,
  };
}