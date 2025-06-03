import { Title } from "react-head";
import { useLocation } from "react-router-dom";
import React, { useEffect, useMemo } from "react";

import WorkGuideSection from "./WorkGuideSection";
import AnalysisResultSection from "./AnalysisResultSection";
import AnalysisFormSection from "./AnalysisFormSection";

const AnalysisPage = () => {
  const location = useLocation();

  const sections = useMemo(
    () => [
      {
        id: "work-guide",
        component: WorkGuideSection,
        title: "Work Guide",
        ref: React.createRef(),
      },
      {
        id: "analysis-form",
        component: AnalysisFormSection,
        title: "Analysis Form",
        ref: React.createRef(),
      },
      {
        id: "analysis-results",
        component: AnalysisResultSection,
        title: "Analysis Result",
        ref: React.createRef(),
      },
    ],
    []
  );

  useEffect(() => {
    if (location.pathname === "/") {
      const WorkGuideDetail = sections.find((s) => s.id === "work-guide");
      if (WorkGuideDetail && WorkGuideDetail.ref.current) {
        setTimeout(() => {
          WorkGuideDetail.ref.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.pathname, sections]);

  return (
    <>
      <Title>Analisis | Judi Guard</Title>

      <div className="min-h-screen bg-[#d8f6ff] px-6 py-16 md:px-24">
        <div>
          {sections.map((section) => {
            const SectionComponent = section.component;
            return (
              <div key={section.id} id={section.id} ref={section.ref}>
                <SectionComponent />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AnalysisPage;
