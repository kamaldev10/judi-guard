import { Title } from "react-head";
import { useLocation } from "react-router-dom";
import React, { useEffect, useMemo } from "react";

import WorkGuideSection from "@/components/work-guide/WorkGuideSection";
import AnalysisFormSection from "@/components/analysis/AnalysisFormSection";

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
        id: "video-analysis-form",
        component: AnalysisFormSection,
        title: "Video Analysis Form",
        ref: React.createRef(),
      },
    ],
    []
  );

  useEffect(() => {
    let timerId;

    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        timerId = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }
    }

    if (location.pathname === "/analysis" && !location.hash) {
      const WorkGuideDetail = sections.find((s) => s.id === "work-guide");
      if (WorkGuideDetail && WorkGuideDetail.ref.current) {
        timerId = setTimeout(() => {
          WorkGuideDetail.ref.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [location, location.pathname, sections]);

  return (
    <>
      <Title>Analisis | Judi Guard</Title>

      <div className="min-h-screen bg-[#d8f6ff] px-6 py-16 md:px-24 ">
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
