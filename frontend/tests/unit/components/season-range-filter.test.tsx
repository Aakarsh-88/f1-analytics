import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SeasonRangeFilter } from "@/components/analytics/season-range-filter";

describe("SeasonRangeFilter", () => {
  const range = { min: 2021, max: 2025 };

  it("renders every year in the range for both selects", () => {
    render(<SeasonRangeFilter range={range} fromYear={2021} toYear={2025} onChange={jest.fn()} />);

    const fromSelect = screen.getByLabelText("From") as HTMLSelectElement;
    const options = Array.from(fromSelect.options).map((o) => o.value);
    expect(options).toEqual(["2021", "2022", "2023", "2024", "2025"]);
  });

  it("calls onChange with the new fromYear, clamped to not exceed toYear", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SeasonRangeFilter range={range} fromYear={2021} toYear={2023} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("From"), "2025");

    // 2025 > toYear (2023), so it should clamp to 2023 rather than
    // producing an invalid inverted range.
    expect(onChange).toHaveBeenCalledWith(2023, 2023);
  });

  it("calls onChange with the new toYear, clamped to not go below fromYear", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SeasonRangeFilter range={range} fromYear={2023} toYear={2025} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("To"), "2021");

    expect(onChange).toHaveBeenCalledWith(2023, 2023);
  });

  it("allows a valid non-clamped change", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SeasonRangeFilter range={range} fromYear={2021} toYear={2025} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("To"), "2023");

    expect(onChange).toHaveBeenCalledWith(2021, 2023);
  });
});
