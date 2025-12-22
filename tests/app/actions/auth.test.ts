const mockFindFirst = vi.fn();
const mockSetSessionCookie = vi.fn();
const mockClearSessionCookie = vi.fn();
const mockRedirect = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { users: { findFirst: mockFindFirst } },
}));

vi.mock("@/lib/auth", () => ({
  setSessionCookie: mockSetSessionCookie,
  clearSessionCookie: mockClearSessionCookie,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loginAction returns missing_credentials when username or password absent", async () => {
    const { loginAction } = await import("@/app/actions/auth");
    const formData = new FormData();
    formData.set("username", "");
    formData.set("password", "");
    formData.set("lang", "en");

    const result = await loginAction({}, formData);

    expect(result).toEqual({ error: "missing_credentials" });
    expect(mockSetSessionCookie).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("loginAction returns invalid_credentials when user not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const { loginAction } = await import("@/app/actions/auth");
    const formData = new FormData();
    formData.set("username", "john");
    formData.set("password", "pw");
    formData.set("lang", "fr");

    const result = await loginAction({}, formData);

    expect(result).toEqual({ error: "invalid_credentials" });
    expect(mockSetSessionCookie).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("loginAction sets session cookie and redirects on success", async () => {
    mockFindFirst.mockResolvedValue({ id: 7 });
    const { loginAction } = await import("@/app/actions/auth");
    const formData = new FormData();
    formData.set("username", "john");
    formData.set("password", "pw");
    formData.set("lang", "en");

    await loginAction({}, formData);

    expect(mockSetSessionCookie).toHaveBeenCalledWith(7);
    expect(mockRedirect).toHaveBeenCalledWith("/?lang=en");
  });

  test("logoutAction clears session and redirects with lang preserved", async () => {
    const { logoutAction } = await import("@/app/actions/auth");
    const formData = new FormData();
    formData.set("lang", "fr");

    await logoutAction(formData);

    expect(mockClearSessionCookie).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/?lang=fr");
  });
});
