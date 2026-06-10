export function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        bg-slate-800
        border
        border-slate-700
        rounded-2xl
        shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
}) {
  return (
    <div className="p-6 pb-0">
      {children}
    </div>
  );
}

export function CardTitle({
  children,
}) {
  return (
    <h2 className="text-2xl font-bold text-white">
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
}) {
  return (
    <p className="text-slate-400 mt-1">
      {children}
    </p>
  );
}

export function CardContent({
  children,
}) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}