import { render, screen } from "@testing-library/react";

import { StatusMessage } from "@/app/components/common/StatusMessage";

describe("StatusMessage", () => {
  test("applies info tone styles by default", () => {
    render(<StatusMessage>Heads up</StatusMessage>);

    const message = screen.getByText("Heads up");
    expect(message).toHaveClass("bg-white/80");
    expect(message).toHaveClass("text-haiti-ink/80");
  });

  test("applies error tone styles and merges custom className", () => {
    render(
      <StatusMessage tone="error" className="extra">
        Something went wrong
      </StatusMessage>,
    );

    const message = screen.getByText("Something went wrong");
    expect(message).toHaveClass("bg-red-50");
    expect(message).toHaveClass("text-red-800");
    expect(message).toHaveClass("extra");
  });
});
