import { describe, it, expect } from "vitest";
import {
  validateUserName,
  validateEmail,
  validateRegistrationPassword,
  validateLoginPassword,
  validateYoutubeUrl,
} from "../formValidators"; // <-- Sesuaikan path impor Anda

// --- Tes untuk validateUserName ---
describe("validateUserName", () => {
  it("harus mengembalikan string kosong untuk username valid", () => {
    expect(validateUserName("penggunaValid")).toBe("");
    expect(validateUserName("user_name")).toBe(""); // Menggunakan underscore
    expect(validateUserName("nama-user")).toBe(""); // Menggunakan strip
    expect(validateUserName("pengguna123")).toBe(""); // Menggunakan angka
    expect(validateUserName("abc")).toBe(""); // Panjang minimal
  });

  it("harus mengembalikan error jika username kosong atau hanya spasi", () => {
    expect(validateUserName("")).toBe("Username tidak boleh kosong.");
    expect(validateUserName("   ")).toBe("Username tidak boleh kosong.");
  });

  it("harus mengembalikan error jika username terlalu pendek", () => {
    expect(validateUserName("ab")).toBe("Username minimal 3 karakter.");
    expect(validateUserName(" a ")).toBe("Username minimal 3 karakter."); // Trim dihitung
  });

  it("harus mengembalikan error jika username terlalu panjang", () => {
    const longUsername = "a".repeat(31);
    expect(validateUserName(longUsername)).toBe(
      "Username maksimal 30 karakter."
    );
  });

  // Jika Anda mengaktifkan validasi karakter:
  // it('harus mengembalikan error jika username mengandung karakter tidak valid', () => {
  //   expect(validateUserName("user name")).toBe("Username hanya boleh berisi huruf, angka, underscore (_), atau strip (-).");
  //   expect(validateUserName("user@!")).toBe("Username hanya boleh berisi huruf, angka, underscore (_), atau strip (-).");
  // });
});

// --- Tes untuk validateEmail ---
describe("validateEmail", () => {
  it("harus mengembalikan string kosong untuk email valid", () => {
    expect(validateEmail("tes@contoh.com")).toBe("");
    expect(validateEmail("tes.lagi@domain.co.id")).toBe("");
    expect(validateEmail("user123@sub.domain.org")).toBe("");
  });

  it("harus mengembalikan error jika email kosong atau hanya spasi", () => {
    expect(validateEmail("")).toBe("Email tidak boleh kosong.");
    expect(validateEmail("   ")).toBe("Email tidak boleh kosong.");
  });

  it("harus mengembalikan error untuk format email tidak valid", () => {
    expect(validateEmail("tes@contoh")).toBe("Format email tidak valid.");
    expect(validateEmail("tes contoh@domain.com")).toBe(
      "Format email tidak valid."
    );
    expect(validateEmail("tes@.com")).toBe("Format email tidak valid.");
    expect(validateEmail("@contoh.com")).toBe("Format email tidak valid.");
    expect(validateEmail("tes")).toBe("Format email tidak valid.");
  });
});

// --- Tes untuk validateRegistrationPassword ---
describe("validateRegistrationPassword", () => {
  const minLength = 6; // Sesuaikan jika berubah

  it("harus mengembalikan string kosong untuk password registrasi valid", () => {
    expect(validateRegistrationPassword("Valid123")).toBe("");
    expect(validateRegistrationPassword("PasswordPanjang1")).toBe("");
    expect(validateRegistrationPassword("aBcDeF1")).toBe(""); // Panjang pas
  });

  it("harus mengembalikan error jika password kosong", () => {
    expect(validateRegistrationPassword("")).toBe(
      "Password tidak boleh kosong."
    );
    // Catatan: Fungsi ini tidak melakukan trim, jadi spasi dihitung
  });

  it("harus mengembalikan error jika password terlalu pendek", () => {
    expect(validateRegistrationPassword("aBc1")).toBe(
      `Password minimal ${minLength} karakter.`
    );
  });

  it("harus mengembalikan error jika tidak ada huruf kapital", () => {
    expect(validateRegistrationPassword("valid123")).toBe(
      "Password harus mengandung setidaknya satu huruf kapital."
    );
  });

  it("harus mengembalikan error jika tidak ada huruf kecil", () => {
    expect(validateRegistrationPassword("VALID123")).toBe(
      "Password harus mengandung setidaknya satu huruf kecil."
    );
  });

  it("harus mengembalikan error jika tidak ada angka", () => {
    expect(validateRegistrationPassword("PasswordValid")).toBe(
      "Password harus mengandung setidaknya satu angka."
    );
  });

  // Jika Anda mengaktifkan validasi karakter spesial:
  // it('harus mengembalikan error jika tidak ada karakter spesial', () => {
  //   expect(validateRegistrationPassword("Valid123")).toBe("Password harus mengandung setidaknya satu karakter spesial.");
  // });
});

// --- Tes untuk validateLoginPassword ---
describe("validateLoginPassword", () => {
  it("harus mengembalikan string kosong untuk password login yang diisi", () => {
    expect(validateLoginPassword("apapunIsinya")).toBe("");
    expect(validateLoginPassword(" password ")).toBe(""); // Trim berhasil
    expect(validateLoginPassword("1")).toBe(""); // Minimal 1 karakter non-spasi
  });

  it("harus mengembalikan error jika password login kosong atau hanya spasi", () => {
    expect(validateLoginPassword("")).toBe("Password tidak boleh kosong.");
    expect(validateLoginPassword("   ")).toBe("Password tidak boleh kosong.");
  });
});

// --- Tes untuk validateYoutubeUrl ---
describe("validateYoutubeUrl", () => {
  it("harus mengembalikan null untuk URL YouTube valid", () => {
    expect(
      validateYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBeNull();
    expect(
      validateYoutubeUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBeNull();
    expect(
      validateYoutubeUrl("www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBeNull();
    expect(validateYoutubeUrl("youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(validateYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBeNull();
    expect(validateYoutubeUrl("youtu.be/dQw4w9WgXcQ")).toBeNull();
    expect(validateYoutubeUrl(" https://youtu.be/dQw4w9WgXcQ ")).toBeNull(); // Handle spasi ekstra
  });

  it("harus mengembalikan error jika URL kosong, null, undefined, atau bukan string", () => {
    expect(validateYoutubeUrl("")).toBe(
      "URL video YouTube tidak boleh kosong."
    );
    expect(validateYoutubeUrl("   ")).toBe(
      "URL video YouTube tidak boleh kosong."
    );
    expect(validateYoutubeUrl(null)).toBe(
      "URL video YouTube tidak boleh kosong."
    );
    expect(validateYoutubeUrl(undefined)).toBe(
      "URL video YouTube tidak boleh kosong."
    );
    expect(validateYoutubeUrl(123)).toBe(
      "URL video YouTube tidak boleh kosong."
    );
  });

  it("harus mengembalikan error untuk format URL tidak valid", () => {
    const invalidFormatMsg =
      "Format URL video YouTube tidak valid. Pastikan menggunakan link dari youtube.com atau youtu.be.";
    expect(validateYoutubeUrl("https://www.google.com")).toBe(invalidFormatMsg);
    expect(validateYoutubeUrl("youtube")).toBe(invalidFormatMsg);
    expect(validateYoutubeUrl("youtu.be")).toBe(invalidFormatMsg);
    expect(validateYoutubeUrl("youtube.com/")).toBe(invalidFormatMsg); // Harus ada sesuatu setelah '/'
    expect(validateYoutubeUrl("http://youtubee.com/watch?v=abc")).toBe(
      invalidFormatMsg
    ); // Typo domain
  });
});
