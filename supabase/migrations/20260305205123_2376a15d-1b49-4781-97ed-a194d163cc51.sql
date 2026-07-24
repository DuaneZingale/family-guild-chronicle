-- Fix search_path on create_family_with_setup
ALTER FUNCTION public.create_family_with_setup(text, uuid, text, text, text, text) SET search_path = public;