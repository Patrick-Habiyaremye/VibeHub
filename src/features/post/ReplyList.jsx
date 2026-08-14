export default function ReplyList({ replies }) {
  return (
    <div className="ml-6">
      {replies.map((r) => (
        <div key={r.id}>{r.content}</div>
      ))}
    </div>
  );
}