-- Update CHECK constraint to use 'nhed' instead of 'nhia'
ALTER TABLE public.insurance_schemes DROP CONSTRAINT IF EXISTS insurance_schemes_scheme_type_check;

-- Migrate existing data
UPDATE public.insurance_schemes SET scheme_type = 'nhed' WHERE scheme_type = 'nhia';
UPDATE public.insurance_schemes SET name = REPLACE(name, 'NHIA', 'NHED') WHERE name ILIKE '%NHIA%';
UPDATE public.insurance_schemes SET code = REPLACE(code, 'NHIA', 'NHED') WHERE code ILIKE '%NHIA%';

ALTER TABLE public.insurance_schemes
  ADD CONSTRAINT insurance_schemes_scheme_type_check
  CHECK (scheme_type IN ('nhed','hmo','private_hmo','corporate','cbhis','state'));