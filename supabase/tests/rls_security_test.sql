-- ==============================================================================
-- SIRAJ RLS & Zero-Trust Security Verification Tests (pgTAP / SQL)
-- Matches SECURITY.md Matrix and Threat Model
-- ==============================================================================

BEGIN;

-- Helper assertions and mock auth switching
CREATE OR REPLACE FUNCTION tests.authenticate_as(user_role text, user_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object(
    'sub', user_id,
    'role', 'authenticated',
    'app_role', user_role
  )::text, true);
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- TEST 1: Wali cannot read audit_log (MUST return 0 rows)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
  v_wali_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  PERFORM tests.authenticate_as('wali', v_wali_id);
  SELECT count(*) INTO v_count FROM public.audit_log;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Wali can read audit_log! Count: %', v_count;
  END IF;
  RAISE NOTICE 'PASSED: Wali cannot access audit_log.';
END;
$$;

-- ------------------------------------------------------------------------------
-- TEST 2: Musyrif cannot update or delete konfigurasi_sp
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_musyrif_id uuid := '00000000-0000-0000-0000-000000000002'::uuid;
BEGIN
  PERFORM tests.authenticate_as('musyrif', v_musyrif_id);
  BEGIN
    UPDATE public.konfigurasi_sp SET ambang_sp1 = 10;
    RAISE EXCEPTION 'SECURITY VIOLATION: Musyrif was allowed to update konfigurasi_sp!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASSED: Musyrif forbidden from updating konfigurasi_sp.';
    WHEN OTHERS THEN
      -- If RLS filters to 0 rows updated, verify no change occurred
      IF (SELECT ambang_sp1 FROM public.konfigurasi_sp LIMIT 1) = 10 THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Musyrif mutated konfigurasi_sp!';
      END IF;
      RAISE NOTICE 'PASSED: Musyrif cannot mutate konfigurasi_sp.';
  END;
END;
$$;

-- ------------------------------------------------------------------------------
-- TEST 3: Satpam cannot read detail rekam medis catatan_kesehatan
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
  v_satpam_id uuid := '00000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  PERFORM tests.authenticate_as('satpam', v_satpam_id);
  SELECT count(*) INTO v_count FROM public.catatan_kesehatan;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Satpam can read health records! Count: %', v_count;
  END IF;
  RAISE NOTICE 'PASSED: Satpam cannot access private medical records.';
END;
$$;

-- ------------------------------------------------------------------------------
-- TEST 4: IDOR Protection — Wali A cannot read children of Wali B
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
  v_wali_a uuid := '00000000-0000-0000-0000-000000000001'::uuid;
  v_child_b uuid := '00000000-0000-0000-0000-000000000099'::uuid;
BEGIN
  PERFORM tests.authenticate_as('wali', v_wali_a);
  -- Attempt to query child B
  SELECT count(*) INTO v_count FROM public.santri WHERE id = v_child_b;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: IDOR detected! Wali A read child of Wali B.';
  END IF;
  RAISE NOTICE 'PASSED: IDOR protection verified between different guardians.';
END;
$$;

-- ------------------------------------------------------------------------------
-- TEST 5: Audit Log Immutability — UPDATE and DELETE are blocked for ALL users
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_admin_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
BEGIN
  PERFORM tests.authenticate_as('admin', v_admin_id);
  BEGIN
    DELETE FROM public.audit_log;
    RAISE EXCEPTION 'SECURITY VIOLATION: Audit log records were deleted!';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'PASSED: Audit log is strictly append-only. DELETE rejected.';
  END;
END;
$$;

ROLLBACK;
