import AnalysisForm from "./AnalysisForm";
import AnalysisResult from "./AnalysisResult";
import CaraKerja from "./CaraKerja";

const AnalysisPage = () => {
  return (
    <>
      <div className="min-h-screen bg-[#d8f6ff] px-6 py-16 md:px-24">
        <CaraKerja />
        <AnalysisForm />
        <AnalysisResult />
      </div>
    </>
  );
};

export default AnalysisPage;
