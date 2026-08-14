import {
  File,
  Image as ImageIcon,
  Video,
  X,
} from "lucide-react";

function getAttachmentType(attachment) {
  const type =
    attachment?.type ||
    attachment?.media_type ||
    attachment?.file?.type ||
    "";

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";

  return "file";
}

export default function AttachmentPreview({
  attachment,
  onRemove,
}) {
  if (!attachment) return null;

  const type = getAttachmentType(attachment);

  const url =
    attachment.previewUrl ||
    attachment.url ||
    attachment.fileUrl;

  const name =
    attachment.name ||
    attachment.file?.name ||
    "Attachment";

  return (
    <div className="px-3 pt-3">
      <div
        className="
          relative
          inline-flex
          items-center
          gap-3
          max-w-full
          p-2
          rounded-xl
          bg-slate-800
          border
          border-slate-700
        "
      >
        {type === "image" && url ? (
          <img
            src={url}
            alt=""
            className="
              w-16
              h-16
              object-cover
              rounded-lg
            "
          />
        ) : type === "video" && url ? (
          <video
            src={url}
            className="
              w-16
              h-16
              object-cover
              rounded-lg
            "
            muted
            playsInline
          />
        ) : (
          <div
            className="
              w-16
              h-16
              rounded-lg
              bg-slate-700
              flex
              items-center
              justify-center
              text-slate-300
            "
          >
            {type === "file" ? (
              <File size={22} />
            ) : type === "video" ? (
              <Video size={22} />
            ) : (
              <ImageIcon size={22} />
            )}
          </div>
        )}

        <div className="min-w-0 pr-7">
          <p className="text-sm text-white truncate max-w-[220px]">
            {name}
          </p>

          <p className="text-xs text-slate-500 capitalize">
            {type}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemove?.(attachment)}
          aria-label="Remove attachment"
          className="
            absolute
            right-1
            top-1
            p-1.5
            rounded-full
            bg-slate-900/80
            text-slate-300
            hover:text-white
            transition
          "
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}