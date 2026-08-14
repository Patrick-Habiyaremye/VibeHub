import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

export default function useOptimisticReaction({
  initialReaction = null,
  initialCount = 0,
  onReact,
  onRemove,
  onChange,
}) {
  const [reaction, setReaction] =
    useState(initialReaction);

  const [count, setCount] =
    useState(Number(initialCount) || 0);

  const [loading, setLoading] =
    useState(false);

  const requestId =
    useRef(0);

  /*
   * Keep local state synchronized with the
   * authoritative post data.
   */
  useEffect(() => {
    setReaction(initialReaction ?? null);
  }, [initialReaction]);

  useEffect(() => {
    setCount(Number(initialCount) || 0);
  }, [initialCount]);

  const toggleReaction = useCallback(
    async (type) => {
      if (loading) {
        return;
      }

      if (!type) {
        return;
      }

      const currentRequest =
        ++requestId.current;

      const previous = {
        reaction,
        count,
      };

      const removing =
        reaction === type;

      /*
       * -----------------------------------------
       * OPTIMISTIC STATE
       * -----------------------------------------
       */

      let optimisticReaction;
      let optimisticCount;

      if (removing) {
        optimisticReaction = null;

        optimisticCount = Math.max(
          0,
          count - 1
        );
      } else {
        optimisticReaction = type;

        /*
         * Changing from one reaction to another
         * does NOT increase the total.
         *
         * Example:
         *
         * 😊 66
         * user changes 😊 → 💡
         * total remains 66
         */
        optimisticCount = reaction
          ? count
          : count + 1;
      }

      setReaction(optimisticReaction);
      setCount(optimisticCount);
      setLoading(true);

      /*
       * Notify UI immediately.
       */
      onChange?.({
        reaction: optimisticReaction,
        count: optimisticCount,
      });

      try {
        let result;

        if (removing) {
          result = await onRemove?.(type);
        } else {
          result = await onReact?.(type);
        }

        /*
         * Ignore stale requests.
         */
        if (
          currentRequest !==
          requestId.current
        ) {
          return result;
        }

        /*
         * If the server returned an authoritative
         * count, use it.
         */
        const serverReaction =
          result?.reaction ??
          optimisticReaction;

        const serverCount =
          Number.isFinite(
            Number(result?.count)
          )
            ? Number(result.count)
            : optimisticCount;

        setReaction(serverReaction);
        setCount(serverCount);

        onChange?.({
          reaction: serverReaction,
          count: serverCount,
        });

        return result;
      } catch (error) {
        console.error(
          "Reaction update failed",
          error
        );

        /*
         * Roll back optimistic state.
         */
        if (
          currentRequest ===
          requestId.current
        ) {
          setReaction(
            previous.reaction
          );

          setCount(
            previous.count
          );

          onChange?.({
            reaction:
              previous.reaction,

            count:
              previous.count,
          });
        }

        throw error;
      } finally {
        if (
          currentRequest ===
          requestId.current
        ) {
          setLoading(false);
        }
      }
    },
    [
      reaction,
      count,
      loading,
      onReact,
      onRemove,
      onChange,
    ]
  );

  return {
    reaction,
    count,
    loading,

    hasReacted:
      Boolean(reaction),

    toggleReaction,
  };
}