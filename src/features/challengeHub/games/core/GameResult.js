export function createGameResult({
  correct = false,
  points = 0,
  feedback = null,
  meta = {},
}) {

  return {
    correct,
    points,
    feedback,
    meta,
  };

}