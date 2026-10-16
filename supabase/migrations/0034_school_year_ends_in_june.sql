/*
  # A school year runs from 1 October to 30 June

  The school year ends on 30 June, not 30 September.

  1. Changes
    - `school_years.end_date` is set to 30 June for every year.
    - school_year_for_date() returns the latest year that started on or
      before the date, so anything dated during the July to September
      holidays belongs to the year that just ended.

  Rows already attached to a year keep their year: none of today's
  data is dated between July and September, so nothing moves.
*/

UPDATE school_years
SET end_date = make_date(EXTRACT(YEAR FROM start_date)::int + 1, 6, 30)
WHERE end_date <> make_date(EXTRACT(YEAR FROM start_date)::int + 1, 6, 30);

CREATE OR REPLACE FUNCTION school_year_for_date(d date)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM school_years
  WHERE start_date <= d
  ORDER BY start_date DESC
  LIMIT 1;
$$;
