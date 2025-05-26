import { motion } from "motion/react";
import { PieChart, Pie, Cell, Legend } from "recharts";

const data = [
  { name: "Clean", value: 75 },
  { name: "Spam", value: 25 },
];

const COLORS = ["#5b6dfa", "#f25fa0"];

const AnalysisResult = () => {
  return (
    <motion.section
      id="analisys-result"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#dcf7ff] rounded-xl p-6 md:p-10 shadow-md border mt-6"
    >
      <h2 className="text-center text-lg md:text-xl font-semibold text-teal-800 mb-6">
        Hasil Komentar Yang Telah di Analisis
      </h2>

      <div className="flex sm:flex-col flex-row items-center justify-center sm:gap-10 gap-30">
        {/* Pie Chart */}
        <PieChart width={300} height={220} className="flex justify-stretch">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(value, entry, index) => (
              <span className="text-sm text-gray-700">
                {value} – {data[index].value}%
              </span>
            )}
          />
        </PieChart>

        {/* Statistik Box */}
        <div className="flex justify-center flex-wrap gap-6 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-6 border-gray-300">
          <StatBox label="Total Komentar" value="1.200" />
          <StatBox label="Komentar Judi" value="300" />
          <StatBox label="Total Bersih" value="900" />
        </div>
      </div>
    </motion.section>
  );
};

const StatBox = ({ label, value }) => (
  <div className="bg-white px-6 py-4 rounded-md shadow-sm text-center min-w-[130px]">
    <p className="text-gray-600 text-sm">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);

export default AnalysisResult;
