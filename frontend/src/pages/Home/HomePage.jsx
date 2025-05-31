import React from "react";
import { Title } from "react-head";
import HeroSection from "./HeroSection";
import AnalisisSection from "./AnalisisSection";
import TestimonialsSection from "./TestimonialsSection";
import ContactSection from "./ContactSection";

const HomePage = () => {
  return (
    <>
      <Title>Beranda | Judi Guard</Title>
      <div>
        <HeroSection />
        <AnalisisSection />
        <TestimonialsSection />
        <ContactSection />
      </div>
    </>
  );
};

export default HomePage;
