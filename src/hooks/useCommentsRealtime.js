import { useEffect } from "react";
import { subscribeToComments } from "../domain/comments/comment.realtime";

export function useCommentsRealtime(params, setComments) {
  useEffect(() => {
    const unsubscribe = subscribeToComments(params, (event) => {
      // setComments((prev) => {
      //   if (!Array.isArray(prev)) return [];

      //   if (event.type === "INSERT") {
      //     if (prev.some((c) => c.id === event.comment.id)) return prev;
      //     return [event.comment, ...prev];
      //   }

      //   if (event.type === "DELETE") {
      //     return prev.filter((c) => c.id !== event.id);
      //   }

      //   if (event.type === "UPDATE") {
      //     return prev.map((c) =>
      //       c.id === event.comment.id ? event.comment : c
      //     );
      //   }

      //   return prev;
      // });
    setComments((prev) => {
  const safePrev = Array.isArray(prev) ? prev : [];

  if (event.type === "INSERT") {
    if (safePrev.some((c) => c.id === event.new.id)) return safePrev;
    return [event.new, ...safePrev];
  }

  if (event.type === "DELETE") {
    return safePrev.filter((c) => c.id !== event.old.id);
  }

  return safePrev;
});
    });

    return unsubscribe;
  }, [params, setComments]);
}