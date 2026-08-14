export function rankComments(comments) {
  return [...comments].sort((a, b) => {
    const scoreA =
      a.likes * 2 +
      (Date.now() - new Date(a.createdAt)) * -0.000001;

    const scoreB =
      b.likes * 2 +
      (Date.now() - new Date(b.createdAt)) * -0.000001;

    return scoreB - scoreA;
  });
}