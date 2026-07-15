import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import HeroSection from '@/modules/home/components/HeroSection';
import ContactSection from '@/modules/home/components/ContactSection';
import ConnectSection from '@/modules/home/components/ConnectSection';
import TextPredictSection from '@/modules/home/components/TextPredictSection';
import TestimonialsSection from '@/modules/home/components/TestimonialsSection';

const HomePage = () => {
  const location = useLocation();

  const sections = useMemo(
    () => [
      {
        id: 'hero-section',
        component: HeroSection,
        title: 'Hero',
        ref: React.createRef(),
      },
      {
        id: 'text-predict-section',
        component: TextPredictSection,
        title: 'Text Predict',
        ref: React.createRef(),
      },
      {
        id: 'connect-section',
        component: ConnectSection,
        title: 'Analisis',
        ref: React.createRef(),
      },
      {
        id: 'testimonials-section',
        component: TestimonialsSection,
        title: 'Testimonials',
        ref: React.createRef(),
      },
      {
        id: 'contact-section',
        component: ContactSection,
        title: 'Kontak',
        ref: React.createRef(),
      },
    ],
    [],
  );

  useEffect(() => {
    let timerId;

    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        timerId = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
    }

    if (location.pathname === '/' && !location.hash) {
      const heroSectionDetail = sections.find((s) => s.id === 'hero-section');
      if (heroSectionDetail && heroSectionDetail.ref.current) {
        timerId = setTimeout(() => {
          heroSectionDetail.ref.current.scrollIntoView({ behavior: 'smooth' });
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
      <div id="beranda" className="w-full flex flex-col gap-12 sm:gap-24 overflow-x-hidden">
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
