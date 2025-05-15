import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoWithSlogan from "../../assets/images/LogoWithSlogan.png";

const OtpPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(120);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef([]);
  const location = useLocation();
  const email = location.state?.email || "B******@gmail.com";
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) return navigate("/register");
    inputsRef.current[0]?.focus();
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, email, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      setSuccess(true);
    }
    navigate("/login");
  };

  const handleResend = () => {
    setOtp(Array(6).fill(""));
    setTimer(60);
    setSuccess(false);
    inputsRef.current[0].focus();
  };
  return (
    <>
      <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center px-4">
        <div className=" static flex flex-col items-center mb-10 ">
          <img
            src={LogoWithSlogan}
            alt="Judi Guard Logo"
            width={150}
            height={150}
            className="absolute top-0 "
          />
        </div>

        <div className="text-center mb-7">
          <h2 className="text-xl font-bold text-teal-700 my-7">Masukkan OTP</h2>
          <p className="text-sm text-gray-700">
            Ketik 6 digit kode yang dikirimkan ke <strong> {email}</strong>
          </p>
        </div>
        <div className="flex gap-2 mb-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className="w-10 h-10 text-center text-xl border-2 border-purple-400 rounded-lg focus:outline-none"
              value={digit}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>
        {timer > 0 ? (
          <p className="text-sm text-gray-700 mb-4">
            Kirim Ulang OTP dalam {timer} detik
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 underline mb-4"
          >
            Kirim Ulang OTP
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="w-1/4 bg-[--primary-color] text-white px-8 py-2 rounded-xl hover:bg-teal-600 my-5"
        >
          Kirim
        </button>
        {success && (
          <div className="bg-green-400 text-white px-6 py-2 rounded-md shadow-md">
            Registrasi berhasil
          </div>
        )}
      </div>
    </>
  );
};

export default OtpPage;
