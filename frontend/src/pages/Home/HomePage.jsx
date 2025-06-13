import React, { useEffect, useMemo } from "react";
import { Title } from "react-head";
import { useLocation } from "react-router-dom";

import HeroSection from "./HeroSection";
import TestimonialsSection from "./TestimonialsSection";
import ContactSection from "./ContactSection";
import ConnectSection from "./ConnectSection";
import TextPredictSection from "./TextPredictSection";

const HomePage = () => {
  const location = useLocation();

  const sections = useMemo(
    () => [
      {
        id: "hero-section",
        component: HeroSection,
        title: "Hero",
        ref: React.createRef(),
      },
      {
        id: "connect-section",
        component: ConnectSection,
        title: "Analisis",
        ref: React.createRef(),
      },
      {
        id: "text-predict-section",
        component: TextPredictSection,
        title: "Text Predict",
        ref: React.createRef(),
      },
      {
        id: "testimonials-section",
        component: TestimonialsSection,
        title: "Testimonials",
        ref: React.createRef(),
      },
      {
        id: "contact-section",
        component: ContactSection,
        title: "Kontak",
        ref: React.createRef(),
      },
    ],
    []
  );

  useEffect(() => {
    if (location.pathname === "/") {
      const heroSectionDetail = sections.find((s) => s.id === "hero-section");
      if (heroSectionDetail && heroSectionDetail.ref.current) {
        setTimeout(() => {
          heroSectionDetail.ref.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.pathname, sections]);

  return (
    <>
      <Title>Beranda | Judi Guard</Title>

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
    </>
  );
};

export default HomePage;
