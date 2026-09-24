"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";

import "react-day-picker/style.css";

interface RentalDatePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;

  onStartDateChange: (
    date: Date | undefined
  ) => void;

  onEndDateChange: (
    date: Date | undefined
  ) => void;
}

export default function RentalDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: RentalDatePickerProps) {
  /*
   * Get today's date.
   *
   * We normalize the time to midnight so that
   * today's date itself remains selectable.
   */
  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  /*
   * Handle date selection.
   */
  const handleDayClick = (date: Date) => {
    /*
     * No start date yet
     */
    if (!startDate) {
      onStartDateChange(date);
      onEndDateChange(undefined);

      return;
    }

    /*
     * Both dates already selected.
     *
     * Start a new selection.
     */
    if (startDate && endDate) {
      onStartDateChange(date);
      onEndDateChange(undefined);

      return;
    }

    /*
     * User clicked a date before
     * the selected start date.
     */
    if (date < startDate) {
      onStartDateChange(date);
      onEndDateChange(undefined);

      return;
    }

    /*
     * Select end date.
     */
    onEndDateChange(date);
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">
          Select Rental Dates
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          First select pickup date, then return date.
        </p>
      </div>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={endDate || startDate}
          onDayClick={handleDayClick}
          disabled={{
            before: today,
          }}
          numberOfMonths={1}
        />
      </div>

      {/* Selected dates */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Start */}
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Pickup Date
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {startDate
              ? startDate.toLocaleDateString()
              : "Select date"}
          </p>
        </div>

        {/* End */}
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Return Date
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {endDate
              ? endDate.toLocaleDateString()
              : "Select date"}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Past dates cannot be selected.
      </p>
    </div>
  );
}