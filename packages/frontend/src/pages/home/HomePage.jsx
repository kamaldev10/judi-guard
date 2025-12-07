import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import HeroSection from "@/components/homepage/HeroSection";
import ContactSection from "@/components/homepage/ContactSection";
import ConnectSection from "@/components/homepage/ConnectSection";
import TextPredictSection from "@/components/homepage/TextPredictSection";
import FunFactsSection from "@/components/fun-fact/FunFactsSection";
import TestimonialsSection from "@/components/homepage/TestimonialsSection";

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
        id: "text-predict-section",
        component: TextPredictSection,
        title: "Text Predict",
        ref: React.createRef(),
      },
      {
        id: "fun-facts",
        component: FunFactsSection,
        title: "Fun Facts",
        ref: React.createRef(),
      },
      {
        id: "connect-section",
        component: ConnectSection,
        title: "Analisis",
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

    if (location.pathname === "/" && !location.hash) {
      const heroSectionDetail = sections.find((s) => s.id === "hero-section");
      if (heroSectionDetail && heroSectionDetail.ref.current) {
        timerId = setTimeout(() => {
          heroSectionDetail.ref.current.scrollIntoView({ behavior: "smooth" });
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
      <div id="beranda">
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
