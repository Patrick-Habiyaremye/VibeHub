export default function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 p-5 sm:p-6 rounded-2xl mb-4">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-purple-600/15 text-purple-400 flex items-center justify-center">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="text-white font-semibold leading-tight">{title}</h2>
          {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}