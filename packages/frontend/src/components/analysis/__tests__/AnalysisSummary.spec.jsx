import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import AnalysisSummary from "../AnalysisSummary";
import { Pie, Cell, Tooltip } from "recharts"; // Impor untuk akses mock

// --- Mocking Dependencies ---
const { mockColors } = vi.hoisted(() => {
  return {
    mockColors: { JUDI: "#FF0000", NON_JUDI: "#00FF00" },
  };
});

// 2. Mock 'recharts'
//    Kita buat mock sederhana yang hanya merender children atau teks placeholder
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  PieChart: ({ children }) => (
    <div data-testid="mock-pie-chart">{children}</div>
  ),
  Pie: vi.fn(({ data, label, children }) => (
    <div data-testid="mock-pie" data-datacount={data.length}>
      {label && <div data-testid="mock-pie-label">Label Rendered</div>}
      Pie Data Count: {data.length}
      {/* Render children agar <Cell> bisa dipanggil */}
      {children}
    </div>
  )),
  Cell: vi.fn(({ fill }) => (
    <div data-testid="mock-cell" style={{ backgroundColor: fill }} />
  )), // Mock Cell untuk cek warna
  Tooltip: vi.fn(
    (
      { content } // Mock Tooltip untuk cek content prop
    ) => <div data-testid="mock-tooltip">{content}</div>
  ),
}));

// 3. Mock ikon 'lucide-react'
vi.mock("lucide-react", () => ({
  Bolt: (props) => <svg data-testid="bolt-icon" {...props} />,
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />, // Tambahkan jika digunakan di StatBox
  Trash2: (props) => <svg data-testid="trash-icon" {...props} />, // Tambahkan jika digunakan di CommentList (jika relevan)
}));

// 4. Mock Komponen Anak
vi.mock("../StatBox", () => ({
  // <-- Sesuaikan path
  default: vi.fn(({ label, value }) => (
    <div data-testid={`mock-statbox-${label.toLowerCase().replace(" ", "-")}`}>
      <span>{label}</span>: <span>{value}</span>
    </div>
  )),
}));

vi.mock("../AnalysisLegend", () => ({
  // <-- Sesuaikan path
  default: vi.fn(({ payload }) => (
    <div data-testid="mock-legend" data-payloadcount={payload.length}>
      Mock Legend (Items: {payload.length})
      {payload[0] && <span>First: {payload[0].value}</span>}
    </div>
  )),
}));

vi.mock("../AnalysisTooltip", () => ({
  // <-- Sesuaikan path
  default: vi.fn(() => (
    <div data-testid="mock-analysis-tooltip">Mock Tooltip Content</div>
  )),
}));

// 5. Mock Konstanta (opsional tapi disarankan)
//    Pastikan warna konsisten terlepas dari file constants
vi.mock("@/constants", () => ({
  PIE_CHART_COLORS: mockColors, // Sekarang merujuk ke mockColors di atas
}));

// --- Mock Data & Props ---
const mockPieData = [
  { name: "JUDI", value: 30, percent: 0.6 }, // Gunakan key asli (JUDI/NON_JUDI)
  { name: "NON_JUDI", value: 20, percent: 0.4 },
];
const mockStats = { total: 50, JUDI: 30, NON_JUDI: 20 };
const mockStatsNoJudi = { total: 20, JUDI: 0, NON_JUDI: 20 };
const mockStatsEmpty = { total: 0, JUDI: 0, NON_JUDI: 0 };
const mockPieEmpty = [];
const mockPieZeroValues = [
  { name: "JUDI", value: 0, percent: 0 },
  { name: "NON_JUDI", value: 0, percent: 0 },
];

const mockOnManageComments = vi.fn();

// --- Test Suite ---

describe("Analysis Summary Component Testing", () => {
  const user = userEvent.setup();

  let MockStatBox, MockAnalysisLegend, MockAnalysisTooltip;
  beforeAll(async () => {
    const statBoxModule = await import("../StatBox"); // <-- Sesuaikan path
    MockStatBox = statBoxModule.default;
    const legendModule = await import("../AnalysisLegend"); // <-- Sesuaikan path
    MockAnalysisLegend = legendModule.default;
    const tooltipModule = await import("../AnalysisTooltip"); // <-- Sesuaikan path
    MockAnalysisTooltip = tooltipModule.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    if (MockStatBox) MockStatBox.mockClear();
    if (MockAnalysisLegend) MockAnalysisLegend.mockClear();
    if (MockAnalysisTooltip) MockAnalysisTooltip.mockClear();
    // Reset mock Recharts (Pie, Cell, Tooltip sudah diimpor di atas)
    if (Pie) Pie.mockClear();
    if (Cell) Cell.mockClear();
    if (Tooltip) Tooltip.mockClear();
  });

  // Tes 1: Render dengan Data Normal
  describe("when rendered with data", () => {
    beforeEach(() => {
      render(
        <AnalysisSummary
          pieChartData={mockPieData}
          stats={mockStats}
          onManageComments={mockOnManageComments}
          isActionInProgress={false}
        />
      );
    });

    // it("should render StatBox components with correct data and props", () => {
    //   expect(MockStatBox).toHaveBeenCalledTimes(3);

    //   // Cek props StatBox Total
    //   expect(MockStatBox).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       label: "Total Komentar",
    //       value: mockStats.total.toLocaleString(),
    //     })
    //   );

    //   // Cek props StatBox Judi
    //   expect(MockStatBox).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       label: "Komentar Judi",
    //       value: mockStats.JUDI.toLocaleString(),
    //       color: "text-pink-600",
    //     })
    //   );
    //   // Cek props StatBox Bersih
    //   expect(MockStatBox).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       label: "Komentar Bersih",
    //       value: mockStats.NON_JUDI.toLocaleString(),
    //       color: "text-blue-600",
    //     })
    //   );
    // });

    it("should render Recharts components (mocks) and pass data", () => {
      expect(
        screen.getByTestId("mock-responsive-container")
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-pie-chart")).toBeInTheDocument();

      // Cek props Pie
      expect(Pie).toHaveBeenCalledTimes(1);
      const pieProps = Pie.mock.calls[0][0];
      expect(pieProps.data).toEqual(mockPieData);
      expect(pieProps.dataKey).toBe("value");
      expect(pieProps.label).toBeInstanceOf(Function); // Cek label adalah fungsi

      // Cek jumlah Cell sesuai data
      expect(Cell).toHaveBeenCalledTimes(mockPieData.length); // Harusnya 2
      // Cek warna Cell (berdasarkan mockColors)
      expect(Cell.mock.calls[0][0].fill).toBe(mockColors.JUDI);
      expect(Cell.mock.calls[1][0].fill).toBe(mockColors.NON_JUDI);

      // Cek Tooltip dirender dengan konten kustom
      expect(Tooltip).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("mock-tooltip")).toBeInTheDocument();
      // Cek bahwa konten tooltip adalah instance dari AnalysisTooltip
      expect(Tooltip.mock.calls[0][0].content.type).toBe(MockAnalysisTooltip);
    });

    it("should render AnalysisLegend (mock) with correct payload", () => {
      expect(MockAnalysisLegend).toHaveBeenCalledTimes(1);
      const legendProps = MockAnalysisLegend.mock.calls[0][0];
      // Payload harus difilter (tidak ada isEmpty) dan ditransformasi
      expect(legendProps.payload).toHaveLength(2);
      expect(legendProps.payload[0].color).toBe(mockColors.JUDI);
      expect(legendProps.payload[1].color).toBe(mockColors.NON_JUDI);
    });

    it("should render and enable the 'Kelola Komentar' button", () => {
      const manageButton = screen.getByRole("button", {
        name: /kelola komentar/i,
      });
      expect(manageButton).toBeInTheDocument();
      expect(manageButton).toBeEnabled();
      expect(within(manageButton).getByTestId("bolt-icon")).toBeInTheDocument();
    });

    it("should call onManageComments when 'Kelola Komentar' button is clicked", async () => {
      const manageButton = screen.getByRole("button", {
        name: /kelola komentar/i,
      });
      await user.click(manageButton);
      expect(mockOnManageComments).toHaveBeenCalledTimes(1);
    });
  }); // End describe 'when rendered with data'

  // Tes 2: State Data Kosong / Nol
  describe("when rendered with empty or zero data", () => {
    it("should render placeholder chart data when pieChartData is empty", () => {
      render(
        <AnalysisSummary
          pieChartData={mockPieEmpty} // Data kosong
          stats={mockStatsEmpty}
          onManageComments={mockOnManageComments}
          isActionInProgress={false}
        />
      );

      // Cek Pie dirender dengan data placeholder
      expect(Pie).toHaveBeenCalledTimes(1);
      const pieProps = Pie.mock.calls[0][0];
      expect(pieProps.data).toHaveLength(1);
      expect(pieProps.data[0]).toEqual({
        name: "Tidak ada data",
        value: 1,
        isEmpty: true,
      });

      // Cek Cell dirender dengan warna placeholder
      expect(Cell).toHaveBeenCalledTimes(1); // Hanya 1 cell placeholder
      expect(Cell.mock.calls[0][0].fill).toBe("#d1d5db");

      // Cek Legenda dirender dengan payload kosong
      expect(MockAnalysisLegend).toHaveBeenCalledTimes(1);
      const legendProps = MockAnalysisLegend.mock.calls[0][0];
      expect(legendProps.payload).toHaveLength(0);

      // Tombol kelola tidak muncul
      expect(
        screen.queryByRole("button", { name: /kelola komentar/i })
      ).not.toBeInTheDocument();
    });

    it("should render placeholder chart data when all pieChartData values are zero", () => {
      render(
        <AnalysisSummary
          pieChartData={mockPieZeroValues} // Semua value 0
          stats={mockStatsEmpty}
          onManageComments={mockOnManageComments}
          isActionInProgress={false}
        />
      );
      // Assertions sama seperti test case data kosong
      expect(Pie).toHaveBeenCalledTimes(1);
      const pieProps = Pie.mock.calls[0][0];
      expect(pieProps.data).toHaveLength(1); // Tetap render placeholder
      expect(pieProps.data[0].isEmpty).toBe(true);
      expect(Cell).toHaveBeenCalledTimes(1);
      expect(Cell.mock.calls[0][0].fill).toBe("#d1d5db");
      expect(MockAnalysisLegend).toHaveBeenCalledTimes(1);
      expect(MockAnalysisLegend.mock.calls[0][0].payload).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: /kelola komentar/i })
      ).not.toBeInTheDocument();
    });

    it("should not render 'Kelola Komentar' button if stats.JUDI is 0", () => {
      render(
        <AnalysisSummary
          pieChartData={[{ name: "NON_JUDI", value: 20 }]} // Hanya data non-judi
          stats={mockStatsNoJudi} // stats.JUDI = 0
          onManageComments={mockOnManageComments}
          isActionInProgress={false}
        />
      );
      expect(
        screen.queryByRole("button", { name: /kelola komentar/i })
      ).not.toBeInTheDocument();
    });
  }); // End describe 'when rendered with empty or zero data'

  // Tes 3: State Aksi Berjalan
  it("should disable 'Kelola Komentar' button when isActionInProgress is true", () => {
    render(
      <AnalysisSummary
        pieChartData={mockPieData} // Data ada
        stats={mockStats} // stats.JUDI > 0
        onManageComments={mockOnManageComments}
        isActionInProgress={true} // <-- Aksi berjalan
      />
    );
    const manageButton = screen.getByRole("button", {
      name: /kelola komentar/i,
    });
    expect(manageButton).toBeInTheDocument();
    expect(manageButton).toBeDisabled(); // Tombol harus disabled
  });
});
