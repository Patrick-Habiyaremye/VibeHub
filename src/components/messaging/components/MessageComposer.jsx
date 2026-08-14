import { useCallback, useState } from "react";

import MessageInput from "./MessageInput";
import AttachmentPreview from "./AttachmentPreview";
import ReplyPreview from "./ReplyPreview";

export default function MessageComposer({
  value = "",
  onChange,
  onSend,

  replyTo = null,
  onCancelReply,

  attachment = null,
  onRemoveAttachment,

  onTyping,

  disabled = false,
  sending = false,
}) {
  const [error, setError] = useState("");

  const handleSend = useCallback(async () => {
    const trimmed = value.trim();

    if (!trimmed && !attachment) {
      return;
    }

    setError("");

    try {
      await onSend?.({
        content: trimmed,
        attachment,
        replyTo,
      });
    } catch (err) {
      console.error("Message send failed:", err);

      setError(
        err?.message ||
          "Unable to send message. Please try again."
      );
    }
  }, [
    value,
    attachment,
    replyTo,
    onSend,
  ]);

  return (
    <div className="shrink-0">
      {replyTo && (
        <ReplyPreview
          replyTo={replyTo}
          onCancel={onCancelReply}
        />
      )}

      {attachment && (
        <AttachmentPreview
          attachment={attachment}
          onRemove={onRemoveAttachment}
        />
      )}

      {error && (
        <div
          role="alert"
          className="
            px-3
            pb-2
            text-xs
            text-red-400
          "
        >
          {error}
        </div>
      )}

      <MessageInput
        value={value}
        setValue={onChange}
        onSend={handleSend}
        onTyping={onTyping}
        disabled={disabled || sending}
        sending={sending}
      />
    </div>
  );
}