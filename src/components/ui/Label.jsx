export default function Label({
  children,
  htmlFor,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm text-slate-300 mb-2"
    >
      {children}
    </label>
  );
}