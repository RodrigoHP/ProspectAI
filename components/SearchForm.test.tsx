import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "./SearchForm";

describe("SearchForm", () => {
  it("renders without crash", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);
    expect(screen.getByText("Encontre seus próximos clientes")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={true} />);
    expect(screen.getByText("Buscando Leads...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buscando/i })).toBeDisabled();
  });

  it("calls onSearch with valid data on submit", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} isLoading={false} />);

    await user.type(
      screen.getByPlaceholderText(/Clínicas odontológicas/i),
      "Clínicas odontológicas com presença digital fraca"
    );
    await user.type(
      screen.getByPlaceholderText(/automação de atendimento/i),
      "Sistemas de IA para automação de atendimento via WhatsApp"
    );

    await user.click(screen.getByRole("button", { name: /buscar leads/i }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        icp: expect.stringContaining("Clínicas"),
        service: expect.stringContaining("IA"),
      })
    );
  });

  it("does not call onSearch when icp is too short", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} isLoading={false} />);

    await user.type(screen.getByPlaceholderText(/Clínicas odontológicas/i), "curto");
    await user.click(screen.getByRole("button", { name: /buscar leads/i }));

    expect(onSearch).not.toHaveBeenCalled();
    const errors = screen.getAllByText(/pelo menos 10 caracteres/i);
    expect(errors.length).toBeGreaterThan(0);
  });
});
