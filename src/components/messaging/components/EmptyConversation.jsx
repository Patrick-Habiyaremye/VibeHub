import { MessageCircle } from "lucide-react";

export default function EmptyConversation({
  title = "No conversation selected",
  description = "Choose someone from your conversations to start chatting.",
}) {
  return (
    <div
      className="
        h-full
        min-h-[320px]
        flex
        flex-col
        items-center
        justify-center
        text-center
        px-6
        bg-slate-950
      "
    >
      <div
        className="
          w-16
          h-16
          rounded-full
          bg-slate-900
          border
          border-slate-800
          flex
          items-center
          justify-center
          mb-4
        "
      >
        <MessageCircle
          size={28}
          className="text-yellow-400"
        />
      </div>

      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}