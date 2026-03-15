import { Button } from "@/renderer/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/renderer/components/ui/popover";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { clsx } from "clsx";

type DateFiltersProps = {
  onChange: (dateRange: DateRange) => void;
  className?: string;
};

type DateFilterType = "previous_month" | "this_month" | "this_year" | "custom";

export default function DateFilters({
  onChange,
  className = "",
}: DateFiltersProps) {
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const updateDateFilter = (type: DateFilterType): void => {
    if (type === "previous_month") {
      onChange({
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      });
      return;
    }

    if (type === "this_month") {
      onChange({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
      });
      return;
    }

    if (type === "this_year") {
      onChange({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
      });
      return;
    }

    if (type === "custom" && date) {
      onChange(date);
      return;
    }

    onChange({ from: undefined, to: undefined });
  };

  const selectCustomDate = (dateRange: DateRange | undefined): void => {
    setDate(dateRange);
    updateDateFilter("custom");
  };

  return (
    <div className={clsx("flex gap-3", className)}>
      <Button
        onClick={() => updateDateFilter("previous_month")}
        variant="outline"
        size="sm"
      >
        Previous month
      </Button>
      <Button
        onClick={() => updateDateFilter("this_month")}
        variant="outline"
        size="sm"
      >
        This month
      </Button>
      <Button
        onClick={() => updateDateFilter("this_year")}
        variant="outline"
        size="sm"
      >
        This year
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={selectCustomDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
