import { render, screen } from "@testing-library/react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders the sector strip by default", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector(".sector-strip")).not.toBeNull();
  });

  it("omits the sector strip when showStrip is false", () => {
    const { container } = render(<Card showStrip={false}>Content</Card>);
    expect(container.querySelector(".sector-strip")).toBeNull();
  });

  it("shows the loading sector strip variant when requested", () => {
    const { container } = render(<Card stripState="loading">Content</Card>);
    expect(container.querySelector(".sector-strip-loading")).not.toBeNull();
  });

  it("renders CardHeader and CardTitle together", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Wins by Season</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText("Wins by Season")).toBeInTheDocument();
  });
});
