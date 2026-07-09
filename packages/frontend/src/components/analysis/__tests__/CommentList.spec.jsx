import React from 'react';
import { render, screen, within } from '@testing-library/react'; // 1. Impor within
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CommentList from '../CommentList'; // <-- Sesuaikan path

// --- Mocking Dependencies ---

// 2. Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    // Tambahkan elemen lain jika motion digunakan lebih banyak
  },
}));

// 3. Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />,
  Trash2: (props) => <svg data-testid="trash-icon" {...props} />,
}));

// 4. Mock FormattedDate component
//    Ganti dengan komponen sederhana yang menampilkan tanggal mock
vi.mock('@/lib/utils/formatters', () => ({
  // <-- Sesuaikan path
  FormattedDate: ({ isoDate }) => (
    <span data-testid={`formatted-date-${isoDate}`}>Tanggal Mock</span>
  ),
}));

// --- Mock Data ---

// 5. Buat data komentar tiruan
const mockComments = [
  {
    _id: 'id1',
    youtubeCommentId: 'yt1',
    commentAuthorDisplayName: 'User Judi',
    commentTextDisplay: 'Ini komentar judi 123.',
    commentPublishedAt: '2025-10-27T10:00:00Z',
    classification: 'JUDI',
    aiConfidenceScore: 0.95,
  },
  {
    _id: 'id2',
    youtubeCommentId: 'yt2',
    commentAuthorDisplayName: 'User Biasa',
    commentTextDisplay: 'Komentar normal saja.',
    commentPublishedAt: '2025-10-27T11:00:00Z',
    classification: 'NON_JUDI',
    aiConfidenceScore: 0.88,
  },
  {
    _id: 'id3',
    youtubeCommentId: 'yt3',
    commentAuthorDisplayName: 'Anonim', // Test case tanpa nama
    commentTextDisplay: 'Komentar lain.',
    commentPublishedAt: '2025-10-27T12:00:00Z',
    classification: 'NON_JUDI',
    // Tanpa aiConfidenceScore
  },
];

// --- Mock Props ---
const mockOnDeleteSingle = vi.fn(); // Mock fungsi delete

// --- Test Suite ---

describe('Comment List Component Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks(); // Bersihkan mock
  });

  // Tes 1: Initial Loading State
  it('should render loading state when isLoadingInitial is true and comments are empty', () => {
    render(
      <CommentList
        comments={[]}
        onDeleteSingle={mockOnDeleteSingle}
        isActionInProgress={false}
        isLoadingInitial={true} // <-- State loading
      />,
    );

    // Cek judul tetap ada
    expect(
      screen.getByRole('heading', { level: 3, name: /daftar komentar \(0\)/i }),
    ).toBeInTheDocument();
    // Cek spinner dan teks loading
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText(/memuat daftar komentar.../i)).toBeInTheDocument();
    // Pastikan pesan "tidak ada komentar" tidak muncul
    expect(screen.queryByText(/tidak ada komentar/i)).not.toBeInTheDocument();
  });

  // Tes 2: Empty State
  it('should render empty state message when no comments and not loading', () => {
    render(
      <CommentList
        comments={[]}
        onDeleteSingle={mockOnDeleteSingle}
        isActionInProgress={false}
        isLoadingInitial={false} // <-- Tidak loading
      />,
    );
    // Cek judul tetap ada
    expect(
      screen.getByRole('heading', { level: 3, name: /daftar komentar \(0\)/i }),
    ).toBeInTheDocument();
    // Cek pesan "tidak ada komentar"
    expect(screen.getByText(/tidak ada komentar untuk ditampilkan/i)).toBeInTheDocument();
    // Pastikan loading tidak muncul
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
    expect(screen.queryByText(/memuat daftar komentar.../i)).not.toBeInTheDocument();
  });

  // Tes 3: Populated State
  describe('when comments are provided', () => {
    beforeEach(() => {
      // Render dengan data mock untuk tes di dalam describe ini
      render(
        <CommentList
          comments={mockComments}
          onDeleteSingle={mockOnDeleteSingle}
          isActionInProgress={false}
          isLoadingInitial={false}
        />,
      );
    });

    it('should render the correct heading with comment count', () => {
      expect(
        screen.getByRole('heading', {
          level: 3,
          name: `Daftar Komentar (${mockComments.length})`,
        }),
      ).toBeInTheDocument();
    });

    //   it("should render the correct number of comment items", () => {
    //     // Cari semua item komentar (misal berdasarkan teks author atau testid jika ditambahkan)
    //     // Cara sederhana: cari semua tombol hapus
    //     const deleteButtons = screen.getAllByRole("button", {
    //       name: /hapus komentar/i,
    //     });
    //     expect(deleteButtons).toHaveLength(mockComments.length);
    //   });

    //   it("should render details for each comment correctly", () => {
    //     mockComments.forEach((comment) => {
    //       // Cari elemen berdasarkan teks unik (misal, teks komentar)
    //       const commentTextElement = screen.getByText(comment.commentTextDisplay);
    //       expect(commentTextElement).toBeInTheDocument();

    //       // Gunakan 'closest' untuk mendapatkan container div item komentar
    //       // Asumsi motion.div di-render sebagai div biasa oleh mock
    //       const commentItemContainer = commentTextElement.closest(
    //         'div[class*="border-l-4"]'
    //       );

    //       expect(commentItemContainer).toBeInTheDocument();

    //       // Gunakan 'within' untuk mencari di dalam container
    //       const withinContainer = within(commentItemContainer);

    //       // Cek Author (handle anonim)
    //       expect(
    //         withinContainer.getByText(
    //           comment.commentAuthorDisplayName || "Anonim"
    //         )
    //       ).toBeInTheDocument();
    //       // Cek Tanggal (mock)
    //       expect(
    //         withinContainer.getByTestId(
    //           `formatted-date-${comment.commentPublishedAt}`
    //         )
    //       ).toBeInTheDocument();
    //       // Cek Klasifikasi
    //       expect(
    //         withinContainer.getByText(comment.classification)
    //       ).toBeInTheDocument();
    //       // Cek Confidence Score (jika ada)
    //       if (comment.aiConfidenceScore) {
    //         expect(
    //           withinContainer.getByText(
    //             `Kecerdasan: ${Math.round(comment.aiConfidenceScore * 100)}%`
    //           )
    //         ).toBeInTheDocument();
    //       } else {
    //         expect(
    //           withinContainer.queryByText(/kecerdasan:/i)
    //         ).not.toBeInTheDocument();
    //       }
    //       // Cek ikon hapus ada
    //       expect(withinContainer.getByTestId("trash-icon")).toBeInTheDocument();
    //       // Cek tombol hapus enabled
    //       expect(
    //         withinContainer.getByRole("button", { name: /hapus komentar/i })
    //       ).toBeEnabled();
    //     });
    //   });

    //   it("should call onDeleteSingle with correct arguments when delete button is clicked", async () => {
    //     // Ambil komentar pertama dari mock data
    //     const firstComment = mockComments[0];
    //     // Cari tombol hapus spesifik untuk komentar pertama
    //     // Cara terbaik: cari berdasarkan teks unik komentar, lalu cari tombol di dalamnya
    //     const commentTextElement = screen.getByText(
    //       firstComment.commentTextDisplay
    //     );
    //     const commentItemContainer = commentTextElement.closest(
    //       'div[class*="border-l-4"]'
    //     );
    //     const deleteButton = within(commentItemContainer).getByRole("button", {
    //       name: /hapus komentar/i,
    //     });
    //     // Klik tombol
    //     await user.click(deleteButton);

    //     // Verifikasi mock onDeleteSingle dipanggil
    //     expect(mockOnDeleteSingle).toHaveBeenCalledTimes(1);
    //     expect(mockOnDeleteSingle).toHaveBeenCalledWith(
    //       firstComment._id,
    //       firstComment.commentTextDisplay
    //     );
    //   });
  }); // End describe 'when comments are provided'

  // Tes 4: Action In Progress State
  // it("should disable delete buttons and show spinners when isActionInProgress is true", () => {
  //   render(
  //     <CommentList
  //       comments={mockComments}
  //       onDeleteSingle={mockOnDeleteSingle}
  //       isActionInProgress={true} // <-- State aksi berjalan
  //       isLoadingInitial={false}
  //     />
  //   );

  //   // Dapatkan semua tombol hapus
  //   const deleteButtons = screen.getAllByRole("button", {
  //     name: /hapus komentar/i,
  //   });

  //   // Verifikasi semua tombol disabled
  //   deleteButtons.forEach((button) => {
  //     expect(button).toBeDisabled();
  //     // Verifikasi spinner ada di dalam tombol, ikon tong sampah tidak ada
  //     expect(within(button).getByTestId("loader-icon")).toBeInTheDocument();
  //     expect(
  //       within(button).queryByTestId("trash-icon")
  //     ).not.toBeInTheDocument();
  //   });
  // });
});
