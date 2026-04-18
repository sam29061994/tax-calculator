import { useState, type SyntheticEvent } from 'react';

const YEARS = [2022, 2021, 2020, 2019];

type Errors = {
  salary?: string;
  year?: string;
};

type Props = {
  onSubmit: (salary: number, year: number) => void;
};

export function TaxForm({ onSubmit }: Props) {
  const [salary, setSalary] = useState('');
  const [year, setYear] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    const next: Errors = {};

    const salaryNum = Number(salary);
    if (salary.trim() === '' || Number.isNaN(salaryNum)) {
      next.salary = 'Enter your salary.';
    } else if (salaryNum < 0) {
      next.salary = 'Salary cannot be negative.';
    }
    if (year === '') {
      next.year = 'Pick a year.';
    }

    setErrors(next);
    if (next.salary || next.year) return;
    onSubmit(salaryNum, Number(year));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-slate-700">
          Annual salary
        </label>
        <input
          id="salary"
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          value={salary}
          onChange={(e) => {
            setSalary(e.target.value);
            if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
          }}
          aria-invalid={errors.salary ? true : undefined}
          aria-describedby={errors.salary ? 'salary-error' : undefined}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        {errors.salary && (
          <p id="salary-error" className="mt-1 text-sm text-red-600">
            {errors.salary}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-slate-700">
          Tax year
        </label>
        <select
          id="year"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
          }}
          aria-invalid={errors.year ? true : undefined}
          aria-describedby={errors.year ? 'year-error' : undefined}
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">Select a year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors.year && (
          <p id="year-error" className="mt-1 text-sm text-red-600">
            {errors.year}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        Calculate
      </button>
    </form>
  );
}
