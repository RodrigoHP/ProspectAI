import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsList } from "./ResultsList";
import { Lead } from "@/types";

const mockLead: Lead = {
  id: "1",
  name: "Clínica Exemplo",
  address: "Rua das Flores, 123",
  city: "São Paulo",
  state: "SP",
  rating: 4.2,
  userRatingCount: 87,
  types: ["dentist"],
  primaryType: "dentist",
  digitalPainScore: 75,
  aiSummary: "Boa oportunidade de negócio.",
};

describe("ResultsList", () => {
  it("renders leads count", () => {
    render(
      <ResultsList
        results={[mockLead]}
        onSelectLead={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByText(/1 Leads Encontrados/i)).toBeInTheDocument();
  });

  it("renders lead name in card view", () => {
    render(
      <ResultsList
        results={[mockLead]}
        onSelectLead={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByText("Clínica Exemplo")).toBeInTheDocument();
  });

  it("shows '0 Leads Encontrados' when results is empty", () => {
    render(
      <ResultsList results={[]} onSelectLead={vi.fn()} onBack={vi.fn()} />
    );
    expect(screen.getByText(/0 Leads Encontrados/i)).toBeInTheDocument();
  });
});
