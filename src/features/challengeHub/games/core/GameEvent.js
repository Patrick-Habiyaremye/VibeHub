export function createGameEvent({
  type,
  payload = {},
  stateBefore = null,
  stateAfter = null,
}) {

  return {
    id: crypto.randomUUID(),

    type,

    payload,

    timestamp: Date.now(),

    stateBefore,

    stateAfter,
  };

}