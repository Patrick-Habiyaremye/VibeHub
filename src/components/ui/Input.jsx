export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full
        rounded-xl
        bg-slate-900
        border
        border-slate-700
        px-4
        py-3
        text-white
        placeholder:text-slate-500
        focus:outline-none
        focus:ring-2
        focus:ring-violet-600
        ${className}
      `}
    />
  );
}