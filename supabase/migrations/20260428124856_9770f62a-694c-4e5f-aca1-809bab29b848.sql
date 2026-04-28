-- Add 'citizen' role to app_role enum for public-facing reporters
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'citizen';