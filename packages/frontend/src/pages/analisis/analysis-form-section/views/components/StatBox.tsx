interface StatBoxProps {
  label: string;
  value: string | number;
  color: string;
}

/**
 * Kotak untuk menampilkan statistik ringkasan.
 */
const StatBox: React.FC<StatBoxProps> = ({
  label,
  value,
  color = "text-slate-800",
}) => (
  <div className="bg-slate-50/70 border border-slate-200 px-6 py-4 rounded-xl shadow-sm text-center min-w-[160px] flex-1">
    <p className="text-slate-500 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default StatBox;
