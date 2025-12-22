import { fireEvent, render, screen } from "@testing-library/react";

const mockUseActionState = vi.fn();

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: (...args: any[]) => mockUseActionState(...args),
  };
});

vi.mock("@/app/actions/auth", () => ({
  loginAction: vi.fn(),
}));

const copy = {
  loginError: "Invalid",
  username: "Username",
  password: "Password",
  loginCta: "Login",
};

describe("LoginForm", () => {
  beforeEach(() => {
    mockUseActionState.mockReturnValue([{}, vi.fn()]);
  });

  test("renders fields and hidden lang input", async () => {
    const { LoginForm } = await import("@/app/login/LoginForm");
    render(<LoginForm lang="en" copy={copy} />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByDisplayValue("en")).toHaveAttribute("name", "lang");
  });

  test("shows error message when action state has error", async () => {
    mockUseActionState.mockReturnValue([{ error: "invalid_credentials" }, vi.fn()]);
    const { LoginForm } = await import("@/app/login/LoginForm");
    render(<LoginForm lang="fr" copy={copy} />);

    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });
});
