import heroImage from "../../assets/images/HeroImage.png";
import Tagline from "../tagline/Tagline";

const HeroSection = () => {
  return (
    <section className="bg-[#d8f3ff] min-h-screen px-24 py-32 flex flex-col ">
      <div className="flex justify-between mb-20">
        <div className="max-w-xs lg:mb-0 sm:mb-10 md:mb-5">
          <h1 className="text-5xl font-bold text-[#136854] leading-tight mb-7">
            Pendeteksi Komentar Judi Online
          </h1>
          <p className="text-lg text-green-700 mb-2 italic">
            Dengan Cepat Dan Akurat
          </p>
          <button className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700">
            Deteksi Sekarang
          </button>
        </div>
        <img
          src={heroImage}
          alt="Hero Illustration"
          className=" w-full max-w-md min-w-sm"
        />
      </div>
      <Tagline />
    </section>
  );
};

export default HeroSection;
