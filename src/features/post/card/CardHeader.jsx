import CardAuthor from "./CardAuthor";
import CardTimestamp from "./CardTimestamp";
import CardMenu from "./CardMenu";

export default function CardHeader({
  post,
  canEdit = false,
  onEdit,
  onDelete,
}) {
  if (!post) return null;

  return (
    <header
      className="
        flex
        items-start
        justify-between
        gap-4
        p-4
      "
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">

        <CardAuthor
          profile={post.profiles}
          showVerified={post.profiles?.verified}
          showSupporter={post.profiles?.supporter}
        />

      </div>

      <div className="flex items-center gap-3 shrink-0">

        <CardTimestamp
          date={post.created_at}
        />

        <CardMenu
          canEdit={canEdit}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      </div>
    </header>
  );
}