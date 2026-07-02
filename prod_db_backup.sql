--
-- PostgreSQL database dump
--

\restrict 9GB3mtHDE8Qy1Zx49HUarS2rI1MH1hXOP4LnwVHYC4DmKsuqme96kG9vaHHSqW8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
/*
Should the record be visible (true) or filtered out (false) after *filters* are applied
*/
    select
        -- Default to allowed when no filters present
        $2 is null -- no filters. this should not happen because subscriptions has a default
        or array_length($2, 1) is null -- array length of an empty array is null
        or bool_and(
            coalesce(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(
                        col.type_oid::regtype, -- null when wal2json version <= 2.4
                        col.type_name::regtype
                    ),
                    -- cast jsonb to text
                    val_1:=col.value #>> '{}',
                    val_2:=f.value
                ),
                false -- if null, filter does not match
            )
        )
    from
        unnest(filters) f
        join unnest(columns) col
            on f.column_name = col.name;
$_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        else
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO postgres;

--
-- Name: accounting_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounting_entries (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "TransactionDate" timestamp with time zone NOT NULL,
    "DocumentType" text NOT NULL,
    "DocumentRefId" text,
    "AccountCategory" text NOT NULL,
    "Amount" numeric(15,2) NOT NULL,
    "Description" text
);


ALTER TABLE public.accounting_entries OWNER TO postgres;

--
-- Name: accounting_ledger_s2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounting_ledger_s2 (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "ReceiptId" uuid,
    "Date" timestamp with time zone NOT NULL,
    "Type" text NOT NULL,
    "QuantityIn" numeric(18,4) NOT NULL,
    "ValueIn" numeric(15,2) NOT NULL,
    "QuantityOut" numeric(18,4) NOT NULL,
    "ValueOut" numeric(15,2) NOT NULL,
    "QuantityBalance" numeric(18,4) NOT NULL,
    "ValueBalance" numeric(15,2) NOT NULL
);


ALTER TABLE public.accounting_ledger_s2 OWNER TO postgres;

--
-- Name: ai_request_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_request_logs (
    "Id" uuid NOT NULL,
    "TenantId" uuid,
    "UserId" uuid,
    "RequestType" text NOT NULL,
    "ModelName" text NOT NULL,
    "PromptTokens" integer NOT NULL,
    "CompletionTokens" integer NOT NULL,
    "TotalTokens" integer NOT NULL,
    "Cost" numeric(15,6) NOT NULL,
    "DurationMs" integer NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL
);


ALTER TABLE public.ai_request_logs OWNER TO postgres;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_records (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CheckInTime" timestamp with time zone NOT NULL,
    "CheckOutTime" timestamp with time zone,
    "CheckInIpAddress" text,
    "CheckOutIpAddress" text,
    "CheckInWifiMac" text,
    "CheckOutWifiMac" text,
    "CheckInLatitude" double precision,
    "CheckInLongitude" double precision,
    "CheckOutLatitude" double precision,
    "CheckOutLongitude" double precision,
    "CheckInPhotoUrl" text,
    "CheckOutPhotoUrl" text,
    "Status" text DEFAULT 'Present'::text NOT NULL,
    "Notes" text,
    "CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.attendance_records OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Action" text NOT NULL,
    "EntityName" text,
    "EntityId" text,
    "Timestamp" timestamp with time zone NOT NULL,
    "Details" text
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cash_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_transactions (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Type" text NOT NULL,
    "PaymentMethod" text NOT NULL,
    "Amount" numeric(15,2) NOT NULL,
    "TransactionDate" timestamp with time zone NOT NULL,
    "Reason" text,
    "ReferenceDocument" text,
    "RelatedUserId" uuid,
    "PayerReceiverName" text,
    "TransactionCode" text,
    "Address" text,
    "AttachedDocuments" text,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.cash_transactions OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    "Id" integer NOT NULL,
    "TenantId" uuid NOT NULL,
    "Name" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "ParentId" integer,
    "Color" text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."categories_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Fullname" text NOT NULL,
    "Phone" text,
    "TotalDebt" numeric(15,2) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "DebtLimit" numeric(15,2) DEFAULT 10000000 NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: debt_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.debt_transactions (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "CustomerId" uuid NOT NULL,
    "OrderId" uuid,
    "Type" text NOT NULL,
    "Amount" numeric(15,2) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.debt_transactions OWNER TO postgres;

--
-- Name: inventory_receipt_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_receipt_details (
    "Id" uuid NOT NULL,
    "ReceiptId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "DocumentQuantity" numeric(18,4) NOT NULL,
    "Quantity" numeric(18,4) NOT NULL,
    "UnitPrice" numeric(15,2) NOT NULL,
    "TotalPrice" numeric(15,2) NOT NULL,
    "VatRate" text,
    "VatAmount" numeric(18,2) DEFAULT 0.0
);


ALTER TABLE public.inventory_receipt_details OWNER TO postgres;

--
-- Name: inventory_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_receipts (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "ReceiptCode" text,
    "Type" text NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "TotalAmount" numeric(15,2) NOT NULL,
    "Note" text,
    "DelivererReceiverName" text,
    "ReferenceDocumentNo" text,
    "ReferenceDocumentDate" timestamp with time zone,
    "ReferenceDocumentIssuer" text,
    "WarehouseLocation" text,
    "CreatedBy" uuid,
    "Status" integer DEFAULT 0 NOT NULL,
    "CancelledAt" timestamp with time zone,
    "CancelledBy" uuid,
    "CancelReason" text,
    "TotalVatAmount" numeric(18,2) DEFAULT 0.0
);


ALTER TABLE public.inventory_receipts OWNER TO postgres;

--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "Type" text NOT NULL,
    "Quantity" numeric(15,4) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatedBy" uuid,
    "Note" text,
    "CreatorId" uuid,
    "PriceType" integer DEFAULT 0 NOT NULL,
    "UnitPrice" numeric(18,4) DEFAULT 0 NOT NULL
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    "Id" integer NOT NULL,
    "OrderId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "ProductUnitId" integer,
    "Quantity" numeric(15,4) NOT NULL,
    "UnitPrice" numeric(15,2) NOT NULL,
    "TotalPrice" numeric(15,2) NOT NULL,
    "VatRate" text,
    "VatAmount" numeric(18,2) DEFAULT 0.0
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."order_items_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "CustomerId" uuid,
    "CreatedBy" uuid,
    "TotalAmount" numeric(15,2) NOT NULL,
    "PaymentMethod" text NOT NULL,
    "Status" text NOT NULL,
    "OrderSource" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatorId" uuid,
    "Code" text,
    "RawTranscript" text,
    "CustomerName" text,
    "TotalVatAmount" numeric(18,2) DEFAULT 0.0,
    "OrderCode" character varying(20)
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_histories (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "ActionName" text NOT NULL,
    "ChangeDetails" text NOT NULL,
    "ActionBy" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.product_histories OWNER TO postgres;

--
-- Name: product_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_units (
    "Id" integer NOT NULL,
    "ProductId" uuid NOT NULL,
    "UnitName" text NOT NULL,
    "ConversionRate" numeric(15,4) NOT NULL,
    "Price" numeric(15,2) NOT NULL,
    "IsDefault" boolean NOT NULL
);


ALTER TABLE public.product_units OWNER TO postgres;

--
-- Name: product_units_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.product_units ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."product_units_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "CategoryId" integer,
    "Code" text,
    "Name" text NOT NULL,
    "Description" text,
    "BaseUnit" text NOT NULL,
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "StockQuantity" numeric(18,4) DEFAULT 0 NOT NULL,
    "VatRate" text DEFAULT '10'::text NOT NULL,
    "PriceIncludesVat" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: shift_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shift_assignments (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "WorkShiftId" uuid NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "Status" text DEFAULT 'Draft'::text NOT NULL
);


ALTER TABLE public.shift_assignments OWNER TO postgres;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stores (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Address" text,
    "Phone" text,
    "TaxCode" text,
    "Email" text,
    "LogoUrl" text,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "EnableVat" boolean DEFAULT false NOT NULL,
    "DefaultVatRate" text DEFAULT '10'::text,
    "AvailableVatRates" text DEFAULT '0,5,8,8.5,10,KCT'::text,
    "Latitude" double precision,
    "Longitude" double precision
);


ALTER TABLE public.stores OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "Price" numeric(15,2) NOT NULL,
    "DurationMonths" integer NOT NULL,
    "Description" text,
    "CreatedAt" timestamp with time zone NOT NULL,
    "MaxOrdersPerMonth" integer,
    "Features" text
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_plans ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."subscription_plans_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_configs (
    "Key" text NOT NULL,
    "Value" text NOT NULL,
    "Description" text,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.system_configs OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "TaxCode" text,
    "OwnerName" text NOT NULL,
    "Address" text,
    "Phone" text,
    "SubscriptionPlanId" integer,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CogsMethod" integer DEFAULT 0 NOT NULL,
    "IsApproved" boolean DEFAULT true NOT NULL,
    "PendingSubscriptionPlanId" integer
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Username" text NOT NULL,
    "PasswordHash" text NOT NULL,
    "Fullname" text NOT NULL,
    "Role" text NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "Phone" text,
    "IdentityCard" text,
    "DateOfBirth" timestamp with time zone,
    "JoinDate" timestamp with time zone,
    "SocialInsuranceNo" text,
    "HealthInsuranceNo" text,
    "PersonalTaxCode" text,
    "BasicSalary" numeric(18,2),
    "BankAccountNumber" text,
    "BankName" text,
    "NumberOfDependents" integer,
    "AvatarUrl" text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: work_shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_shifts (
    "Id" uuid NOT NULL,
    "TenantId" uuid NOT NULL,
    "Name" text NOT NULL,
    "StartTime" interval NOT NULL,
    "EndTime" interval NOT NULL,
    "GracePeriodMinutes" integer DEFAULT 0 NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "MinimumStaffCount" integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.work_shifts OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20260701060834_Baseline_v1	8.0.6
20260701074928_AddPlatformAdminTables	8.0.6
20260701092439_AddTenantApproval	8.0.6
20260701100318_AddTenantPendingSubscription	8.0.6
\.


--
-- Data for Name: accounting_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounting_entries ("Id", "TenantId", "TransactionDate", "DocumentType", "DocumentRefId", "AccountCategory", "Amount", "Description") FROM stdin;
a014b084-cc2e-449d-a6c7-e1bae0684eea	11111111-1111-1111-1111-111111111111	2026-06-23 07:39:51.978826+00	Sales	b39fe284-b340-4ed0-a0a3-e8feb501075f	Revenue_Goods	1500.00	Doanh thu bán hàng - Đơn hàng #b39fe284
e30e0151-32a3-4334-b34a-6d6923355184	11111111-1111-1111-1111-111111111111	2026-06-23 07:41:53.683305+00	Sales	ed0a55f0-eb3c-40c5-a086-715a8f52495c	Revenue_Goods	1500.00	Doanh thu bán hàng - Đơn hàng #ed0a55f0
44be6fa5-1271-4f9d-ac1c-e4c1c3d3a184	11111111-1111-1111-1111-111111111111	2026-06-23 07:43:02.374304+00	Sales	c13116ff-2c78-4a1b-bd97-8240cac104ff	Revenue_Goods	1500.00	Doanh thu bán hàng - Đơn hàng #c13116ff
08325058-5626-4408-80eb-78feb4c01d85	11111111-1111-1111-1111-111111111111	2026-06-23 10:31:48.032055+00	Sales	c13116ff-2c78-4a1b-bd97-8240cac104ff	Revenue_Goods	-1500.00	Giảm trừ doanh thu trả hàng - Đơn hàng #c13116ff
d2d3db01-54c0-4701-a466-33f5a281b442	11111111-1111-1111-1111-111111111111	2026-06-23 10:37:41.125767+00	Sales	ed0a55f0-eb3c-40c5-a086-715a8f52495c	Revenue_Goods	-1500.00	Giảm trừ doanh thu trả hàng - Đơn hàng #ed0a55f0
19ab955e-826b-485a-a684-cb5805fbb856	11111111-1111-1111-1111-111111111111	2026-07-01 05:45:26.383578+00	Sales	e15f15f0-d889-45ba-8774-cff96ccb7730	Revenue_Goods	5000000.00	Doanh thu bán hàng - Duyệt đơn nháp #e15f15f0
\.


--
-- Data for Name: accounting_ledger_s2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounting_ledger_s2 ("Id", "TenantId", "ProductId", "ReceiptId", "Date", "Type", "QuantityIn", "ValueIn", "QuantityOut", "ValueOut", "QuantityBalance", "ValueBalance") FROM stdin;
047a5b6f-5271-42ce-9ef1-e71f1f9e1f5d	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	2026-06-22 04:08:18.851245+00	Import	100.0000	27000000.00	0.0000	0.00	100.0000	27000000.00
534471c6-b5eb-4734-9393-62d659145586	11111111-1111-1111-1111-111111111111	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	2026-06-22 04:08:18.851245+00	Import	20.0000	6000000.00	0.0000	0.00	20.0000	6000000.00
53ebd183-270a-4efd-9b72-2102f27f89c1	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	2026-06-22 04:08:18.851245+00	Import	10000.0000	11000000.00	0.0000	0.00	10000.0000	11000000.00
71160567-deb5-433f-b782-4408f337a012	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	2026-06-22 04:08:18.851245+00	Import	100.0000	8000000.00	0.0000	0.00	100.0000	8000000.00
aa5871d8-5967-4dad-a004-b1998085a2c5	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	8deba230-3987-4c77-b913-a4739ef062d1	2026-06-22 04:09:58.754894+00	Import	50.0000	18000000.00	0.0000	0.00	150.0000	45000000.00
079d15a1-08b0-4564-9a7c-cc7d00087ac9	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	7aa4173f-6dee-4994-ac36-c684deb7609b	2026-06-22 04:11:02.970976+00	Export	0.0000	0.00	2.0000	600000.00	148.0000	44400000.00
42cfcb24-8bc5-4154-9ac0-f0e77019cb65	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	\N	2026-06-23 07:39:51.972714+00	Export	0.0000	0.00	1.0000	1100.00	9999.0000	10998900.00
c4cd45b4-a632-408b-8aa7-77b491a8a99e	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	\N	2026-06-23 07:41:53.682868+00	Export	0.0000	0.00	1.0000	1100.00	9998.0000	10997800.00
e5aa2351-5525-431b-9f90-6b9d01245cf4	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	\N	2026-06-23 07:43:02.37415+00	Export	0.0000	0.00	1.0000	1100.00	9997.0000	10996700.00
18d3ff6d-1850-4e24-8384-be4525f6bb09	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	\N	2026-06-23 10:31:48.025401+00	Import	1.0000	1100.00	0.0000	0.00	9998.0000	10997800.00
69d70275-0e72-4662-b448-8b0261591e2f	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	\N	2026-06-23 10:37:41.125321+00	Import	1.0000	1100.00	0.0000	0.00	9999.0000	10998900.00
24138c21-787a-4f4c-b831-5e92401c4fac	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	7441d3d4-19c7-47c1-81ab-19709b57805e	2026-06-23 12:54:14.381398+00	Import	500.0000	140000000.00	0.0000	0.00	500.0000	140000000.00
b002e7d8-e9ee-44ca-a91b-aa7afd6da82a	11111111-1111-1111-1111-111111111111	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	7441d3d4-19c7-47c1-81ab-19709b57805e	2026-06-23 12:54:14.381398+00	Import	500.0000	150000000.00	0.0000	0.00	500.0000	150000000.00
b3606291-45e4-4d16-ab75-7797f5889887	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	7441d3d4-19c7-47c1-81ab-19709b57805e	2026-06-23 12:54:14.381398+00	Import	500.0000	100000000.00	0.0000	0.00	500.0000	100000000.00
b51464ce-506e-4933-8efd-28b38100ba5d	11111111-1111-1111-1111-111111111111	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	6705d483-345b-4faf-b5f1-4cb5d9af39bd	2026-06-24 12:35:08.806316+00	Export	0.0000	0.00	1.0000	300000.00	499.0000	149700000.00
e5c9b8c4-99f8-47fa-b1cb-2c80b9614124	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	6705d483-345b-4faf-b5f1-4cb5d9af39bd	2026-06-24 12:35:08.806316+00	Export	0.0000	0.00	4.0000	1120000.00	496.0000	138880000.00
c5b21205-b254-4096-8943-acea5a4f5978	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	e15f15f0-d889-45ba-8774-cff96ccb7730	2026-07-01 05:45:26.27056+00	Export	0.0000	0.00	10.0000	3000000.00	138.0000	41400000.00
\.


--
-- Data for Name: ai_request_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_request_logs ("Id", "TenantId", "UserId", "RequestType", "ModelName", "PromptTokens", "CompletionTokens", "TotalTokens", "Cost", "DurationMs", "Timestamp") FROM stdin;
\.


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_records ("Id", "TenantId", "UserId", "CheckInTime", "CheckOutTime", "CheckInIpAddress", "CheckOutIpAddress", "CheckInWifiMac", "CheckOutWifiMac", "CheckInLatitude", "CheckInLongitude", "CheckOutLatitude", "CheckOutLongitude", "CheckInPhotoUrl", "CheckOutPhotoUrl", "Status", "Notes", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs ("Id", "TenantId", "UserId", "Action", "EntityName", "EntityId", "Timestamp", "Details") FROM stdin;
090d8c37-7ae7-41e0-98f1-d3b5fed78ca5	11111111-1111-1111-1111-111111111111	d487c74f-5238-467f-b323-661a6514ec79	CREATE_STAFF	User	d487c74f-5238-467f-b323-661a6514ec79	2026-06-22 09:49:03.958378+00	Tạo mới tài khoản nhân viên: Nhật Anh (nhatanh@gmail.com)
13bf02ea-8706-46db-8b0d-735f95a12776	11111111-1111-1111-1111-111111111111	aaaabbbb-cccc-dddd-eeee-777788889999	RETURN_ORDER	Order	c13116ff-2c78-4a1b-bd97-8240cac104ff	2026-06-23 10:31:48.044696+00	Trả hàng nhanh tại quầy cho đơn hàng #c13116ff. Tổng tiền hoàn trả: 1,500đ.
80044a21-d10e-4139-a061-fd44bd5f639a	11111111-1111-1111-1111-111111111111	aaaabbbb-cccc-dddd-eeee-777788889999	RETURN_ORDER	Order	ed0a55f0-eb3c-40c5-a086-715a8f52495c	2026-06-23 10:37:41.126052+00	Trả hàng nhanh tại quầy cho đơn hàng #ed0a55f0. Tổng tiền hoàn trả: 1,500đ.
32f84d1f-64d9-4367-bf53-0081d10d83a9	11111111-1111-1111-1111-111111111111	d487c74f-5238-467f-b323-661a6514ec79	UPDATE_STAFF	User	d487c74f-5238-467f-b323-661a6514ec79	2026-06-25 06:53:12.166542+00	Cập nhật thông tin nhân viên: Nhật Anh Dư
c4cddc71-f7d3-4993-a903-41c47cabe2e9	11111111-1111-1111-1111-111111111111	aaaabbbb-cccc-dddd-eeee-777788889999	UPDATE_STAFF	User	aaaabbbb-cccc-dddd-eeee-777788889999	2026-06-25 06:59:37.113894+00	Cập nhật thông tin nhân viên: Phạm Minh Tâm
adb6118a-5665-484d-a53d-9a9da6f1f9a7	11111111-1111-1111-1111-111111111111	aaaabbbb-cccc-dddd-eeee-777788889999	UPDATE_STAFF	User	aaaabbbb-cccc-dddd-eeee-777788889999	2026-06-25 06:59:46.736331+00	Cập nhật thông tin nhân viên: Phạm Minh Dũng
4ec9494d-6d6d-405d-80e3-f6c2f07dd2fe	11111111-1111-1111-1111-111111111111	aaaabbbb-cccc-dddd-eeee-777788889999	UPDATE_STAFF	User	aaaabbbb-cccc-dddd-eeee-777788889999	2026-06-25 07:22:59.634746+00	Cập nhật thông tin nhân viên: Dũng khờ
1af8f833-a0bf-4572-847a-8126f5761af1	11111111-1111-1111-1111-111111111111	d487c74f-5238-467f-b323-661a6514ec79	UPDATE_STAFF	User	d487c74f-5238-467f-b323-661a6514ec79	2026-06-30 05:26:13.266673+00	Cập nhật thông tin nhân viên: Nhật Anh Dư
5803bb89-e5d7-49d2-8998-a47ba1cdd6f5	11111111-1111-1111-1111-111111111111	d487c74f-5238-467f-b323-661a6514ec79	UPDATE_STAFF	User	d487c74f-5238-467f-b323-661a6514ec79	2026-06-30 06:02:36.020014+00	Cập nhật thông tin nhân viên: Nhật Anh Dư
a5accf6f-80e6-436c-9953-cdaa607c78dd	11111111-1111-1111-1111-111111111111	d487c74f-5238-467f-b323-661a6514ec79	UPDATE_STAFF	User	d487c74f-5238-467f-b323-661a6514ec79	2026-06-30 06:04:05.529989+00	Cập nhật thông tin nhân viên: Nhật Anh Dư
\.


--
-- Data for Name: cash_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_transactions ("Id", "TenantId", "Type", "PaymentMethod", "Amount", "TransactionDate", "Reason", "ReferenceDocument", "RelatedUserId", "PayerReceiverName", "TransactionCode", "Address", "AttachedDocuments", "CreatedAt") FROM stdin;
9e55a574-50a1-4502-af19-696b7a835bf4	11111111-1111-1111-1111-111111111111	Payment	Cash	18000000.00	2026-06-22 04:09:58.754894+00	Chi tiền nhập kho (Backfill) - Chứng từ HD03312	HD03312	\N	Nguyễn Văn Mười	PC-260622-BF1	\N	\N	2026-06-22 04:09:58.754894+00
a1b7678e-556a-424a-836d-068a9f2ecea0	11111111-1111-1111-1111-111111111111	Payment	Cash	52000000.00	2026-06-22 04:08:18.851245+00	Chi tiền nhập kho (Backfill) - Chứng từ HD392919	HD392919	\N	Nguyễn Văn Mười	PC-260622-BF0	\N	\N	2026-06-22 04:08:18.851245+00
a6deb5ab-ba39-4585-99ad-b55b35956a6b	11111111-1111-1111-1111-111111111111	Payment	Cash	390000000.00	2026-06-23 12:54:14.381398+00	Chi tiền nhập kho (Backfill) - Chứng từ DK-001	DK-001	\N	Nguyên Văn Tần	PC-260623-BF2	\N	\N	2026-06-23 12:54:14.381398+00
ec0cb416-1d79-49d7-9ac5-afaa9c985b9f	11111111-1111-1111-1111-111111111111	Receipt	Cash	1420000.00	2026-06-24 12:35:08.806316+00	Thu tiền xuất kho (Backfill) - Chứng từ HD72163	HD72163	\N	người tình mùa đông	PT-260624-BF3	\N	\N	2026-06-24 12:35:08.806316+00
fce5d1eb-6e6c-475f-ae25-b5bafed45c68	11111111-1111-1111-1111-111111111111	Receipt	Cash	1500.00	2026-06-23 07:39:51.343169+00	Thu tiền bán hàng (Backfill) - Đơn hàng #	\N	aaaabbbb-cccc-dddd-eeee-777788889999	Khách vãng lai	PT-260623-BF4	\N	\N	2026-06-23 07:39:51.343169+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories ("Id", "TenantId", "Name", "CreatedAt", "ParentId", "Color") FROM stdin;
1	11111111-1111-1111-1111-111111111111	Vật liệu xây dựng	2026-06-19 03:51:06.592925+00	\N	\N
2	11111111-1111-1111-1111-111111111111	VLXD thô	2026-06-23 13:16:53.16164+00	\N	#fdba74
3	11111111-1111-1111-1111-111111111111	Sắt thép XD	2026-06-23 13:17:13.999286+00	\N	#bef264
4	11111111-1111-1111-1111-111111111111	VLXD hoàn thiện	2026-06-23 13:29:20.016591+00	\N	#7dd3fc
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers ("Id", "TenantId", "Fullname", "Phone", "TotalDebt", "CreatedAt", "DebtLimit") FROM stdin;
33333333-3333-3333-3333-333333333333	11111111-1111-1111-1111-111111111111	Cô Tư	0987654321	1500000.00	2026-06-23 06:16:39.280101+00	10000000.00
44444444-4444-4444-4444-444444444444	11111111-1111-1111-1111-111111111111	Anh Năm	0905556667	0.00	2026-06-23 06:16:39.280103+00	10000000.00
22222222-2222-2222-2222-222222222222	11111111-1111-1111-1111-111111111111	Chú Ba Duy	0912345678	5200000.00	2026-06-23 06:16:39.280081+00	10000000.00
6fc99210-445e-481a-8025-5ef387cf2914	11111111-1111-1111-1111-111111111111	Dư Anh	0372518472	0.00	2026-06-26 03:48:53.484904+00	10000000.00
\.


--
-- Data for Name: debt_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.debt_transactions ("Id", "TenantId", "CustomerId", "OrderId", "Type", "Amount", "CreatedAt") FROM stdin;
\.


--
-- Data for Name: inventory_receipt_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_receipt_details ("Id", "ReceiptId", "ProductId", "DocumentQuantity", "Quantity", "UnitPrice", "TotalPrice", "VatRate", "VatAmount") FROM stdin;
9ab6f6b0-013f-44f1-bae5-3c6372e543e7	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	78f0cad1-8792-40e0-a79c-f55c9e990c66	100.0000	100.0000	80000.00	8000000.00	\N	0.00
a5164c1d-abc1-4712-b745-f14aa4532494	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	10000.0000	10000.0000	1100.00	11000000.00	\N	0.00
bb08fd87-5356-4bfb-9c2d-0325e89e6a87	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	20.0000	20.0000	300000.00	6000000.00	\N	0.00
fb8f772e-2381-4c49-bb7f-59f665f241ea	7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	a67eb1b6-3a63-46d4-96db-5a283026eab2	100.0000	100.0000	270000.00	27000000.00	\N	0.00
e4c1481f-3d3a-4e68-86e6-e9a460d9e139	8deba230-3987-4c77-b913-a4739ef062d1	a67eb1b6-3a63-46d4-96db-5a283026eab2	50.0000	50.0000	360000.00	18000000.00	\N	0.00
bf0ef8a9-b611-4c7c-89e9-36c01f660e25	7aa4173f-6dee-4994-ac36-c684deb7609b	a67eb1b6-3a63-46d4-96db-5a283026eab2	2.0000	2.0000	0.00	0.00	\N	0.00
1daeb34a-f879-45ed-a906-7b1e874506fb	7441d3d4-19c7-47c1-81ab-19709b57805e	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	500.0000	500.0000	300000.00	150000000.00	\N	0.00
39e89e92-7aaf-447d-8d00-826c2edd7ee5	7441d3d4-19c7-47c1-81ab-19709b57805e	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	500.0000	500.0000	200000.00	100000000.00	\N	0.00
a6218983-f69a-419d-9b78-20328b577ac9	7441d3d4-19c7-47c1-81ab-19709b57805e	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	500.0000	500.0000	280000.00	140000000.00	\N	0.00
1d174bdf-3e23-4b5b-a303-c0bcd0a5b5d5	6705d483-345b-4faf-b5f1-4cb5d9af39bd	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	1.0000	4.0000	280000.00	1120000.00	\N	0.00
22cbd1e1-6e73-4586-bfc7-169c29570589	6705d483-345b-4faf-b5f1-4cb5d9af39bd	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	1.0000	1.0000	300000.00	300000.00	\N	0.00
\.


--
-- Data for Name: inventory_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_receipts ("Id", "TenantId", "ReceiptCode", "Type", "Date", "TotalAmount", "Note", "DelivererReceiverName", "ReferenceDocumentNo", "ReferenceDocumentDate", "ReferenceDocumentIssuer", "WarehouseLocation", "CreatedBy", "Status", "CancelledAt", "CancelledBy", "CancelReason", "TotalVatAmount") FROM stdin;
7ed5bbc3-4227-4fb5-b0b1-21094753c0f1	11111111-1111-1111-1111-111111111111	PN0001	Import	2026-06-22 04:08:18.851245+00	52000000.00	nhập đơn số lượng lớn đợt 1.	Nguyễn Văn Mười	HD392919	2026-06-21 00:00:00+00	Cty TNHH ABC	Kho chính	\N	0	\N	\N	\N	0.00
8deba230-3987-4c77-b913-a4739ef062d1	11111111-1111-1111-1111-111111111111	PN0002	Import	2026-06-22 04:09:58.754894+00	18000000.00	nhập kèm thép	Nguyễn Văn Mười	HD03312	2026-06-22 00:00:00+00	Cty TNHH ABC	kho phụ	\N	0	\N	\N	\N	0.00
7aa4173f-6dee-4994-ac36-c684deb7609b	11111111-1111-1111-1111-111111111111	PX0001	Export	2026-06-22 04:11:02.970976+00	0.00	bán cho khách	Dư Nhật ANh	HD00132	2026-06-22 00:00:00+00	tư nhân	nhà khách	\N	0	\N	\N	\N	0.00
7441d3d4-19c7-47c1-81ab-19709b57805e	11111111-1111-1111-1111-111111111111	PN0003	Import	2026-06-23 12:54:14.381398+00	390000000.00	Nhập tồn kho đầu kỳ.	Nguyên Văn Tần	DK-001	2026-06-20 00:00:00+00	Cồ phần VLXD	Kho chính	\N	0	\N	\N	\N	0.00
6705d483-345b-4faf-b5f1-4cb5d9af39bd	11111111-1111-1111-1111-111111111111	PX0002	Export	2026-06-24 12:35:08.806316+00	1420000.00	test tự động lấy giá.	người tình mùa đông	HD72163	2026-06-23 00:00:00+00	gia đình	nhà người ta	\N	0	\N	\N	\N	0.00
\.


--
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions ("Id", "TenantId", "ProductId", "Type", "Quantity", "CreatedAt", "CreatedBy", "Note", "CreatorId", "PriceType", "UnitPrice") FROM stdin;
19a41e9b-6af6-4459-9a45-048ae7ff5c94	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Export	1.0000	2026-06-23 07:39:51.619582+00	aaaabbbb-cccc-dddd-eeee-777788889999	Xuất kho bán hàng - Đơn hàng b39fe284-b340-4ed0-a0a3-e8feb501075f	\N	0	0.0000
f85dbfb0-83e8-42e4-8a03-83ffea342157	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Export	1.0000	2026-06-23 07:41:53.420368+00	aaaabbbb-cccc-dddd-eeee-777788889999	Xuất kho bán hàng - Đơn hàng ed0a55f0-eb3c-40c5-a086-715a8f52495c	\N	0	0.0000
c90aa044-7a81-41ae-990e-1d9a57e44800	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Export	1.0000	2026-06-23 07:43:02.087124+00	aaaabbbb-cccc-dddd-eeee-777788889999	Xuất kho bán hàng - Đơn hàng c13116ff-2c78-4a1b-bd97-8240cac104ff	\N	0	0.0000
c5a494df-7d47-4b29-a051-29f7fe032870	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Adjustment	1.0000	2026-06-23 10:31:47.689885+00	aaaabbbb-cccc-dddd-eeee-777788889999	Nhập kho trả hàng - Đơn hàng c13116ff-2c78-4a1b-bd97-8240cac104ff	\N	0	0.0000
acbae62e-714f-4bf2-a648-d8e7acf1803c	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Adjustment	1.0000	2026-06-23 10:37:40.886447+00	aaaabbbb-cccc-dddd-eeee-777788889999	Nhập kho trả hàng - Đơn hàng ed0a55f0-eb3c-40c5-a086-715a8f52495c	\N	0	0.0000
bb337397-4bbc-486b-b1c5-32f344e41f5a	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	Export	10.0000	2026-07-01 05:45:25.800827+00	aaaabbbb-cccc-dddd-eeee-777788889999	Xuất kho bán hàng - Duyệt đơn nháp e15f15f0-d889-45ba-8774-cff96ccb7730	\N	0	0.0000
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items ("Id", "OrderId", "ProductId", "ProductUnitId", "Quantity", "UnitPrice", "TotalPrice", "VatRate", "VatAmount") FROM stdin;
3	b39fe284-b340-4ed0-a0a3-e8feb501075f	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	4	1.0000	1500.00	1500.00	\N	0.00
5	c13116ff-2c78-4a1b-bd97-8240cac104ff	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	4	0.0000	1500.00	0.00	\N	0.00
4	ed0a55f0-eb3c-40c5-a086-715a8f52495c	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	4	0.0000	1500.00	0.00	\N	0.00
6	dddd1111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	5.0000	85000.00	425000.00	\N	0.00
7	dddd2222-2222-2222-2222-222222222222	a67eb1b6-3a63-46d4-96db-5a283026eab2	7	2.0000	2450000.00	4900000.00	\N	0.00
9	0f4c9a94-af54-4eeb-bc32-a01ce845ea99	a67eb1b6-3a63-46d4-96db-5a283026eab2	7	5.0000	500000.00	2500000.00	\N	0.00
10	a5c548a1-5395-45ad-ad2d-c94f2c43bb83	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	5.0000	85000.00	425000.00	\N	0.00
11	08e99c4a-47b1-424c-91e1-cd31cc2c7b2e	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	5.0000	85000.00	425000.00	\N	0.00
12	5565a05f-7c1e-4ccf-8956-8dece5dfdb22	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	5.0000	85000.00	425000.00	\N	0.00
14	211f5052-fbf3-4ebd-abad-28e1d3173eca	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	3.0000	85000.00	255000.00	\N	0.00
15	c4151ebd-b575-461c-b6c0-2433fe286bfa	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	1.0000	85000.00	85000.00	\N	0.00
16	4bb01a3e-0738-452b-af04-356d364b93cd	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	5.0000	85000.00	425000.00	\N	0.00
18	ad3abe58-f049-40a4-96d8-cdf4fba1bef8	a67eb1b6-3a63-46d4-96db-5a283026eab2	7	5.0000	500000.00	2500000.00	\N	0.00
19	128d12d7-be99-4b07-9105-5c62164b1cc9	78f0cad1-8792-40e0-a79c-f55c9e990c66	1	2.0000	85000.00	170000.00	\N	0.00
20	e15f15f0-d889-45ba-8774-cff96ccb7730	a67eb1b6-3a63-46d4-96db-5a283026eab2	7	10.0000	500000.00	5000000.00	\N	0.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders ("Id", "TenantId", "CustomerId", "CreatedBy", "TotalAmount", "PaymentMethod", "Status", "OrderSource", "CreatedAt", "CreatorId", "Code", "RawTranscript", "CustomerName", "TotalVatAmount", "OrderCode") FROM stdin;
b39fe284-b340-4ed0-a0a3-e8feb501075f	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	1500.00	Cash	Completed	Manual	2026-06-23 07:39:51.343169+00	\N	\N	\N	\N	0.00	\N
c13116ff-2c78-4a1b-bd97-8240cac104ff	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	0.00	Cash	Cancelled	Manual	2026-06-23 07:43:01.780973+00	\N	\N	\N	\N	0.00	\N
ed0a55f0-eb3c-40c5-a086-715a8f52495c	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	0.00	Cash	Cancelled	Manual	2026-06-23 07:41:53.140419+00	\N	\N	\N	\N	0.00	\N
dddd1111-1111-1111-1111-111111111111	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	aaaabbbb-cccc-dddd-eeee-777788889999	425000.00	Debt	Draft	AI_Voice	2026-06-24 05:13:56.786646+00	\N	\N	\N	\N	0.00	\N
dddd2222-2222-2222-2222-222222222222	11111111-1111-1111-1111-111111111111	44444444-4444-4444-4444-444444444444	aaaabbbb-cccc-dddd-eeee-777788889999	4900000.00	Cash	Draft	AI_Text	2026-06-24 04:58:56.786668+00	\N	\N	\N	\N	0.00	\N
0f4c9a94-af54-4eeb-bc32-a01ce845ea99	11111111-1111-1111-1111-111111111111	22222222-2222-2222-2222-222222222222	aaaabbbb-cccc-dddd-eeee-777788889999	2500000.00	Cash	Draft	AI_Text	2026-06-27 06:40:23.479465+00	\N	\N	\N	\N	0.00	\N
a5c548a1-5395-45ad-ad2d-c94f2c43bb83	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	425000.00	Debt	Draft	AI_Text	2026-06-27 06:57:55.380592+00	\N	\N	Lấy cho anh Bảo 5 bao xi măng, ghi nợ nha	Bảo	0.00	\N
08e99c4a-47b1-424c-91e1-cd31cc2c7b2e	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	425000.00	Debt	Draft	AI_Text	2026-06-27 06:58:55.697151+00	\N	\N	Lấy cho anh Bảo 5 bao xi măng, ghi nợ nha	Anh Bảo	0.00	\N
4bb01a3e-0738-452b-af04-356d364b93cd	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	425000.00	Debt	Draft	AI_Voice	2026-06-27 07:44:36.231328+00	\N	\N	Lấy cho anh bảo năm bao xi măng, ghi nợ.	Anh Bảo	0.00	\N
8de028ca-6264-449f-bd92-27223db054dc	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	0.00	Cash	Cancelled	AI_Voice	2026-06-27 07:42:12.793457+00	\N	\N	Tôi xin lỗi, tôi không thể trực tiếp truy cập hoặc xử lý các file ghi âm. Vui lòng cung cấp nội dung ghi âm dưới dạng văn bản để tôi có thể chuyển ngữ giúp bạn.	Khách Lẻ	0.00	\N
c4151ebd-b575-461c-b6c0-2433fe286bfa	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	85000.00	Cash	Cancelled	AI_Voice	2026-06-27 07:11:56.981105+00	\N	\N	Lấy cho anh bảo, nắm bao xí mang, đi nữa.	Anh Bảo	0.00	\N
211f5052-fbf3-4ebd-abad-28e1d3173eca	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	255000.00	Cash	Cancelled	AI_Voice	2026-06-27 07:10:30.219262+00	\N	\N	Lấy cho anh bảo nằm bà xí mang, hí nữa.	Khách Lẻ	0.00	\N
5565a05f-7c1e-4ccf-8956-8dece5dfdb22	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	425000.00	Debt	Cancelled	AI_Text	2026-06-27 06:59:21.023008+00	\N	\N	Lấy cho anh Bảo 5 bao xi măng, ghi nợ nha	Bảo	0.00	\N
ad3abe58-f049-40a4-96d8-cdf4fba1bef8	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	2500000.00	Debt	Draft	AI_Voice	2026-06-27 07:53:58.523258+00	\N	\N	Lấy cho anh bảo năm cây sách thép phi, ghi nợ.	Anh Bảo	0.00	\N
128d12d7-be99-4b07-9105-5c62164b1cc9	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	170000.00	Debt	Draft	AI_Text	2026-06-27 09:29:20.599398+00	\N		Lấy cho anh Bảo 2 bao xi măng, ghi nợ	Anh Bảo	0.00	\N
e15f15f0-d889-45ba-8774-cff96ccb7730	11111111-1111-1111-1111-111111111111	\N	aaaabbbb-cccc-dddd-eeee-777788889999	5000000.00	Cash	Completed	AI_Voice	2026-06-27 07:45:25.469311+00	\N	HD010726-001	Lấy cho anh bảo 10 cây sắt thép phi.	Anh Bảo	0.00	\N
\.


--
-- Data for Name: product_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_histories ("Id", "TenantId", "ProductId", "ActionName", "ChangeDetails", "ActionBy", "CreatedAt") FROM stdin;
07465c5c-ff4a-4223-9c2f-6c0303e89f73	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Tạo mới	Tạo sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg) (Mã: XM-HT1) với 1 đơn vị tính.	User	2026-06-19 05:19:05.51517+00
16792b59-a6ac-489d-b25f-c32796f1a9a1	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật thông tin sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg)	User	2026-06-19 05:21:46.079571+00
2329b148-e3a4-4ac9-b379-d9aeb35dc9f1	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật thông tin sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg)	User	2026-06-19 05:21:52.972942+00
559c8b2b-ef7e-4b2b-8db0-fdc31b802ec3	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg). Chi tiết: Thêm mới đơn vị 'tấn' (Giá: 16,500,000đ)	User	2026-06-19 05:36:36.017506+00
6c8d9f89-c0d1-4a83-92fd-6a1b7986a8ea	11111111-1111-1111-1111-111111111111	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	Tạo mới	Tạo sản phẩm: Cát xây tô (Cát đen hạt nhỏ) (Mã: CAT-XT) với 1 đơn vị tính.	User	2026-06-19 05:41:06.468883+00
a8f35cae-320c-46b0-9a89-f53551ac2683	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Tạo mới	Tạo sản phẩm: Gạch ống Tuynel Đồng Nai 4 lỗ (Mã: GA-T4L) với 2 đơn vị tính.	User	2026-06-19 05:59:12.924891+00
0ac231dd-9907-48c0-aff2-36b31f7effd1	11111111-1111-1111-1111-111111111111	8e7d3c95-2cb7-4d18-8e18-bc485764ff0c	Tạo mới	Tạo sản phẩm: dư (Mã: dưa) với 1 đơn vị tính.	User	2026-06-19 06:00:53.037792+00
6e4c26c9-4943-442a-b7f2-e884bb0a1a15	11111111-1111-1111-1111-111111111111	8e7d3c95-2cb7-4d18-8e18-bc485764ff0c	Ngừng kinh doanh / Đã xóa	Đánh dấu xóa / ngừng kinh doanh sản phẩm.	User	2026-06-19 06:00:56.13619+00
53d3ac4c-a621-4830-91d7-7633809b8554	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg). Chi tiết: Danh mục bị thay đổi	User	2026-06-19 06:12:19.918204+00
6c83b1f2-fd69-429e-905b-fc6f2037a59b	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg). Chi tiết: Danh mục bị thay đổi	User	2026-06-19 06:12:26.310672+00
8f32cc0f-e299-4fcc-9a2c-d2521351d3ce	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Cập nhật	Cập nhật sản phẩm: Gạch ống Tuynel Đồng Nai 4 lỗ. Chi tiết: Giá bán (viên): 2đ -> 1,500đ	User	2026-06-19 07:42:09.529782+00
410606fa-f371-40f2-a25e-0802bd01c0ec	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	Tạo mới	Tạo sản phẩm: Sắt thép phi 16 (Mã: SAT-P16-01) với 1 đơn vị tính.	User	2026-06-19 10:15:44.121321+00
ae7245d8-914d-447d-96b4-8226593e4535	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	Cập nhật	Cập nhật sản phẩm: Sắt thép phi 16. Chi tiết: Giá bán (cây): 2,450,000đ -> 500,000đ, Thêm mới đơn vị 'bó' (Giá: 420,000đ)	User	2026-06-22 01:46:35.170127+00
79b2ce69-7552-4820-8d6c-ce5e383ac3cb	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	Cập nhật	Cập nhật sản phẩm: Sắt thép phi 16. Chi tiết: Giá bán (bó): 420,000đ -> 4,200,000đ	User	2026-06-22 01:46:43.09913+00
6b40b9d7-ab44-46c5-b94f-2d613360f999	11111111-1111-1111-1111-111111111111	04df21b6-df26-4d68-8a78-2a9a8bd219f9	Tạo mới	Tạo sản phẩm: Thép Pomina D16 (Mã: T-POM-D16) với 2 đơn vị tính.	User	2026-06-23 10:05:57.765414+00
8764fa6b-58ad-439a-ab73-ddbe6d0aa8f1	11111111-1111-1111-1111-111111111111	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	Tạo mới	Tạo sản phẩm: Đá xây dựng 1x2 (Mã: D-1X2) với 2 đơn vị tính.	User	2026-06-23 10:08:03.431631+00
0fc91759-6fd1-4963-b79c-d0835c64b112	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	Tạo mới	Tạo sản phẩm: Cát xây tô (Cát đen) (Mã: C-XL-01) với 2 đơn vị tính.	User	2026-06-23 10:09:22.121469+00
08458714-c450-4ffd-9edd-d490d13584b8	11111111-1111-1111-1111-111111111111	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	Cập nhật	Cập nhật sản phẩm: Cát xây tô (Cát đen hạt nhỏ). Chi tiết: Thêm mới đơn vị 'xe' (Giá: 1,600,000đ)	User	2026-06-23 12:31:32.232947+00
77851560-67ec-4abb-bd05-530b3ad4d7dd	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	Cập nhật	Cập nhật sản phẩm: Cát xây tô (Cát đen). Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:17:36.371554+00
8a49bdfb-7615-4260-917a-96b8f47fc413	11111111-1111-1111-1111-111111111111	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	Cập nhật	Cập nhật sản phẩm: Cát xây tô (Cát đen hạt nhỏ). Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:18:06.452706+00
fd8f7559-2dde-4fc0-b21a-b9c920226a83	11111111-1111-1111-1111-111111111111	78f0cad1-8792-40e0-a79c-f55c9e990c66	Cập nhật	Cập nhật sản phẩm: Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg). Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:18:21.014961+00
9229d013-1315-42b2-87a8-de32965bb4bd	11111111-1111-1111-1111-111111111111	a67eb1b6-3a63-46d4-96db-5a283026eab2	Cập nhật	Cập nhật sản phẩm: Sắt thép phi 16. Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:18:36.355565+00
844f062e-84d1-450b-985c-e67f9f0804f5	11111111-1111-1111-1111-111111111111	04df21b6-df26-4d68-8a78-2a9a8bd219f9	Cập nhật	Cập nhật sản phẩm: Thép Pomina D16. Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:18:51.321482+00
e347c60f-23db-4da1-bb06-bbc1085a3e51	11111111-1111-1111-1111-111111111111	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	Cập nhật	Cập nhật sản phẩm: Gạch ống Tuynel Đồng Nai 4 lỗ. Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:19:23.208502+00
4d26736e-7322-4bff-8e30-a84bdd240a95	11111111-1111-1111-1111-111111111111	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	Cập nhật	Cập nhật sản phẩm: Đá xây dựng 1x2. Chi tiết: Danh mục bị thay đổi	User	2026-06-23 13:29:36.848854+00
bd54334f-63ba-41bc-96b4-06c0f88b7169	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	Cập nhật	Cập nhật sản phẩm: Cát xây tô (Cát đen). Chi tiết: VAT: '10' -> '8'	User	2026-06-29 13:36:55.175492+00
1f51ab81-0dc6-48cc-9e68-418b26f61454	11111111-1111-1111-1111-111111111111	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	Cập nhật	Cập nhật sản phẩm: Cát xây tô (Cát đen). Chi tiết: VAT: '8' -> '10'	User	2026-06-29 13:37:07.684924+00
\.


--
-- Data for Name: product_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_units ("Id", "ProductId", "UnitName", "ConversionRate", "Price", "IsDefault") FROM stdin;
1	78f0cad1-8792-40e0-a79c-f55c9e990c66	bao	1.0000	85000.00	t
2	78f0cad1-8792-40e0-a79c-f55c9e990c66	tấn	20.0000	16500000.00	f
3	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	khối	1.0000	320000.00	t
5	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	thiên	1000.0000	1450000.00	f
6	8e7d3c95-2cb7-4d18-8e18-bc485764ff0c	dưa	1.0000	22.00	t
4	6bb75e2c-b549-4434-b843-7d9cb89bb2a3	viên	1.0000	1500.00	t
7	a67eb1b6-3a63-46d4-96db-5a283026eab2	cây	1.0000	500000.00	t
8	a67eb1b6-3a63-46d4-96db-5a283026eab2	bó	10.0000	4200000.00	f
9	04df21b6-df26-4d68-8a78-2a9a8bd219f9	cây	1.0000	320000.00	t
10	04df21b6-df26-4d68-8a78-2a9a8bd219f9	tấn	58.8200	18500000.00	f
11	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	khối	1.0000	350000.00	t
12	f810d011-4ebf-42c6-a0bb-505f9ca7f00e	xe	5.0000	1700000.00	f
13	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	khối	1.0000	250000.00	t
14	3a0ff6bc-69ea-418d-92e6-c435517ce2a9	xe	5.0000	1200000.00	f
15	f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	xe	5.0000	1600000.00	f
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products ("Id", "TenantId", "CategoryId", "Code", "Name", "Description", "BaseUnit", "IsActive", "IsDeleted", "CreatedAt", "StockQuantity", "VatRate", "PriceIncludesVat") FROM stdin;
3a0ff6bc-69ea-418d-92e6-c435517ce2a9	11111111-1111-1111-1111-111111111111	2	C-XL-01	Cát xây tô (Cát đen)	Cát hạt mịn, sạch, ít tạp chất, dùng để xây tô tường. [MinStock: 10] [Location: kho phụ] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782716354407_Screenshot%202026-06-29%20135848.png]	khối	t	f	2026-06-23 10:09:22.120413+00	496.0000	10	t
a67eb1b6-3a63-46d4-96db-5a283026eab2	11111111-1111-1111-1111-111111111111	3	SAT-P16-01	Sắt thép phi 16	[MinStock: 10] [Location: Bãi chứa số 1] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782716749994_Screenshot%202026-06-29%20140542.png]	cây	t	f	2026-06-19 10:15:44.091226+00	138.0000	10	t
8e7d3c95-2cb7-4d18-8e18-bc485764ff0c	11111111-1111-1111-1111-111111111111	1	dưa	dư	dă	dă	f	t	2026-06-19 06:00:53.03722+00	500.0000	10	t
f810d011-4ebf-42c6-a0bb-505f9ca7f00e	11111111-1111-1111-1111-111111111111	4	D-1X2	Đá xây dựng 1x2	Đá xanh 1x2, kích cỡ đồng đều, dùng trộn bê tông móng, dầm, sàn. [MinStock: 10] [Location: Kho tổng - Kệ C] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782716603728_Screenshot%202026-06-29%20140318.png]	khối	t	f	2026-06-23 10:08:03.431214+00	499.0000	10	t
04df21b6-df26-4d68-8a78-2a9a8bd219f9	11111111-1111-1111-1111-111111111111	3	T-POM-D16	Thép Pomina D16	Thép gân vằn Pomina đường kính 16mm, chiều dài tiêu chuẩn 11.7m. [MinStock: 10] [Location: Bãi chứa số 1] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782716676097_Screenshot%202026-06-29%20140425.png]	cây	t	f	2026-06-23 10:05:57.7215+00	0.0000	10	t
6bb75e2c-b549-4434-b843-7d9cb89bb2a3	11111111-1111-1111-1111-111111111111	2	GA-T4L	Gạch ống Tuynel Đồng Nai 4 lỗ	[MinStock: 10] [Location: Kho tổng - Kệ C] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782717897678_Screenshot%202026-06-29%20141919.png]	viên	t	f	2026-06-19 05:59:12.924214+00	9999.0000	10	t
f1ac0cbc-ef2a-428f-810e-0cc86d5b435f	11111111-1111-1111-1111-111111111111	2	CAT-XT	Cát xây tô (Cát đen hạt nhỏ)	Cát mịn, sạch không lẫn tạp chất, chuyên dùng để trát tường. [MinStock: 10] [Location: Kho tổng - Kệ C] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782717965732_Screenshot%202026-06-29%20142556.png]	khối	t	f	2026-06-19 05:41:06.467386+00	20.0000	10	t
78f0cad1-8792-40e0-a79c-f55c9e990c66	11111111-1111-1111-1111-111111111111	2	XM-HT1	Xi măng Hà Tiên 1 Đa Dụng (Bao 50kg)	Xi măng poóc lăng hỗn hợp, chuyên dùng cho xây tô và đổ bê tông. [MinStock: 10] [Location: Kho tổng - Kệ C] [ImageUrl: https://nltybanibdbuxowimrpv.supabase.co/storage/v1/object/public/products/images/1782718010343_Screenshot%202026-06-29%20142637.png]	Bao	t	f	2026-06-19 05:19:05.430851+00	100.0000	10	t
\.


--
-- Data for Name: shift_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shift_assignments ("Id", "TenantId", "UserId", "WorkShiftId", "Date", "CreatedAt", "Status") FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stores ("Id", "TenantId", "Name", "Address", "Phone", "TaxCode", "Email", "LogoUrl", "IsActive", "CreatedAt", "EnableVat", "DefaultVatRate", "AvailableVatRates", "Latitude", "Longitude") FROM stdin;
c78d1410-d10e-4df8-bc89-6a6d88219c99	3066ecfb-590c-4682-b6fa-61517e9eed57	Cửa Hàng Điện Tử Minh Phát - Chi nhánh chính	123 Nguyễn Văn Linh, Phường Tân Thuận, Quận 7, TP. Hồ Chí Minh	0901234567	\N	\N	\N	t	2026-07-01 09:29:50.476249+00	f	10	0,5,8,8.5,10,KCT	\N	\N
b76ba83c-9bd9-4ccd-ae5c-abf3d4301fa6	a32c4306-0194-455d-af08-57392e866d3c	Cửa Hàng Điện Tử Minh Phát - Chi nhánh chính	123 Nguyễn Văn Linh, Phường Tân Thuận, Quận 7, TP. Hồ Chí Minh	0901234567	\N	\N	\N	t	2026-07-01 10:11:10.542196+00	f	10	0,5,8,8.5,10,KCT	\N	\N
22222222-2222-2222-2222-222222222222	11111111-1111-1111-1111-111111111111	Công ty Vật Liệu Xây Dựng 1	123 Đường Số 1, Quận 1, TP.HCM	0999986868	0312345678	vatlieuxaydung1@gmail.com		t	2026-06-11 00:00:00+00	t	10	0, 5, 8, 8.5, 10, KCT, 3	10.87098	106.62086
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans ("Id", "Name", "Price", "DurationMonths", "Description", "CreatedAt", "MaxOrdersPerMonth", "Features") FROM stdin;
2	Gói Miễn Phí	0.00	0	Quản lý bán hàng cơ bản, tối đa 50 đơn/tháng. Không bao gồm báo cáo thuế TT88 và Trợ lý AI.	2026-07-01 10:40:30.106511+00	50	["pos","inventory"]
3	Gói Cơ Bản	150000.00	1	Quản lý bán hàng nâng cao, tối đa 300 đơn/tháng. Bao gồm báo cáo doanh thu và theo dõi công nợ. Chưa bao gồm Trợ lý AI và báo cáo thuế TT88.	2026-07-01 10:40:30.219215+00	300	["pos","inventory","reports","debt_tracking"]
1	Gói Chuyên Nghiệp	500000.00	12	Đầy đủ các chức năng quản lý, báo cáo thuế TT88 và Trợ lý AI	2026-06-11 00:00:00+00	\N	["pos","inventory","reports","ai","tt88","multi_store"]
\.


--
-- Data for Name: system_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_configs ("Key", "Value", "Description", "UpdatedAt") FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants ("Id", "Name", "TaxCode", "OwnerName", "Address", "Phone", "SubscriptionPlanId", "IsActive", "CreatedAt", "CogsMethod", "IsApproved", "PendingSubscriptionPlanId") FROM stdin;
00000000-0000-0000-0000-000000000001	BizFlow System Tenant	\N	System Admin	\N	\N	\N	t	2026-06-11 00:00:00+00	0	t	\N
11111111-1111-1111-1111-111111111111	Cửa Hàng Tạp Hóa Bình Minh	\N	Nguyễn Văn A	\N	\N	1	t	2026-06-11 00:00:00+00	0	t	\N
a32c4306-0194-455d-af08-57392e866d3c	Cửa Hàng Điện Tử Minh Phát	0312345678	Nguyễn Văn Minh	123 Nguyễn Văn Linh, Phường Tân Thuận, Quận 7, TP. Hồ Chí Minh	0901234567	1	t	2026-07-01 10:11:10.512187+00	0	t	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users ("Id", "TenantId", "Username", "PasswordHash", "Fullname", "Role", "IsActive", "CreatedAt", "Phone", "IdentityCard", "DateOfBirth", "JoinDate", "SocialInsuranceNo", "HealthInsuranceNo", "PersonalTaxCode", "BasicSalary", "BankAccountNumber", "BankName", "NumberOfDependents", "AvatarUrl") FROM stdin;
d487c74f-5238-467f-b323-661a6514ec79	11111111-1111-1111-1111-111111111111	nhatanh@gmail.com	$2a$11$5YlvDJnP1IXRvDjXe0b1O.BaI.yEqwAEjTFFAfh2icjlKwRnsiZ0m	Nhật Anh Dư	Employee	t	2026-06-22 09:49:03.860174+00	0372518472	095205000974	1995-09-15 00:00:00+00	2026-06-20 00:00:00+00	7921098765	GD4797912345678	8301234567	8000000.00	19031234567890	Techcombank	2	\N
be1cfd41-c910-42e2-a1e2-e78ac7e35ec3	a32c4306-0194-455d-af08-57392e866d3c	nguyenvanminh@example.com	$2a$11$WbtFwEWX9oCpeLd/N1B.HugYv.lsw/aj2uYKpC7zQKAOUHv7.lVXm	Nguyễn Văn Minh	Owner	t	2026-07-01 10:11:10.78651+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
aaaabbbb-cccc-dddd-eeee-777788889999	11111111-1111-1111-1111-111111111111	employee@bizflow.com	employee123	Dũng khờ	Employee	t	2026-06-11 00:00:00+00	0178237218	09001000213	2005-04-30 00:00:00+00	2026-06-25 00:00:00+00	\N	\N	\N	\N	\N	\N	\N	\N
aaaabbbb-cccc-dddd-eeee-111122223333	00000000-0000-0000-0000-000000000001	admin@bizflow.com	admin123	Quản Trị Viên Hệ Thống	Admin	t	2026-06-11 00:00:00+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
aaaabbbb-cccc-dddd-eeee-444455556666	11111111-1111-1111-1111-111111111111	owner@bizflow.com	$2a$11$wtHLMe5X5dhlNWfukian7.uD6rRU365uvmQ6HKkz3lSHftk8pO2XK	Nguyễn Văn A	Owner	t	2026-06-11 00:00:00+00	0372518472	095205000974	2005-04-04 00:00:00+00	2026-06-11 00:00:00+00	\N	\N	\N	\N	\N	\N	\N	data:image/jpeg;base64,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
\.


--
-- Data for Name: work_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_shifts ("Id", "TenantId", "Name", "StartTime", "EndTime", "GracePeriodMinutes", "CreatedAt", "MinimumStaffCount") FROM stdin;
bf5ac0e3-9383-4e6e-9f0f-fc9687770678	11111111-1111-1111-1111-111111111111	Ca 1	07:00:00	11:00:00	10	2026-07-01 08:57:08.223737+00	1
b8529aeb-254d-44d4-b2c5-59ba29c60f0c	11111111-1111-1111-1111-111111111111	Ca 2	13:00:00	18:00:00	5	2026-07-01 09:45:23.609064+00	1
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-06-18 08:50:37
20211116045059	2026-06-18 08:50:38
20211116050929	2026-06-18 08:50:39
20211116051442	2026-06-18 08:50:39
20211116212300	2026-06-18 08:50:40
20211116213355	2026-06-18 08:50:41
20211116213934	2026-06-18 08:50:42
20211116214523	2026-06-18 08:50:43
20211122062447	2026-06-18 08:50:43
20211124070109	2026-06-18 08:50:44
20211202204204	2026-06-18 08:50:45
20211202204605	2026-06-18 08:50:45
20211210212804	2026-06-18 08:50:47
20211228014915	2026-06-18 08:50:48
20220107221237	2026-06-18 08:50:49
20220228202821	2026-06-18 08:50:49
20220312004840	2026-06-18 08:50:50
20220603231003	2026-06-18 08:50:51
20220603232444	2026-06-18 08:50:52
20220615214548	2026-06-18 08:50:53
20220712093339	2026-06-18 08:50:53
20220908172859	2026-06-18 08:50:54
20220916233421	2026-06-18 08:50:55
20230119133233	2026-06-18 08:50:55
20230128025114	2026-06-18 08:50:56
20230128025212	2026-06-18 08:50:57
20230227211149	2026-06-18 08:50:58
20230228184745	2026-06-18 08:50:58
20230308225145	2026-06-18 08:50:59
20230328144023	2026-06-18 08:51:00
20231018144023	2026-06-18 08:51:00
20231204144023	2026-06-18 08:51:02
20231204144024	2026-06-18 08:51:02
20231204144025	2026-06-18 08:51:03
20240108234812	2026-06-18 08:51:04
20240109165339	2026-06-18 08:51:04
20240227174441	2026-06-18 08:51:05
20240311171622	2026-06-18 08:51:06
20240321100241	2026-06-18 08:51:08
20240401105812	2026-06-18 08:51:10
20240418121054	2026-06-18 08:51:11
20240523004032	2026-06-18 08:51:13
20240618124746	2026-06-18 08:51:14
20240801235015	2026-06-18 08:51:14
20240805133720	2026-06-18 08:51:15
20240827160934	2026-06-18 08:51:16
20240919163303	2026-06-18 08:51:17
20240919163305	2026-06-18 08:51:17
20241019105805	2026-06-18 08:51:18
20241030150047	2026-06-18 08:51:21
20241108114728	2026-06-18 08:51:22
20241121104152	2026-06-18 08:51:22
20241130184212	2026-06-18 08:51:23
20241220035512	2026-06-18 08:51:24
20241220123912	2026-06-18 08:51:24
20241224161212	2026-06-18 08:51:25
20250107150512	2026-06-18 08:51:26
20250110162412	2026-06-18 08:51:26
20250123174212	2026-06-18 08:51:27
20250128220012	2026-06-18 08:51:28
20250506224012	2026-06-18 08:51:28
20250523164012	2026-06-18 08:51:29
20250714121412	2026-06-18 08:51:30
20250905041441	2026-06-18 08:51:30
20251103001201	2026-06-18 08:51:31
20251120212548	2026-06-18 08:51:32
20251120215549	2026-06-18 08:51:32
20260218120000	2026-06-18 08:51:33
20260326120000	2026-06-18 08:51:34
20260514120000	2026-06-18 08:51:35
20260527120000	2026-06-18 08:51:36
20260528120000	2026-06-18 08:51:37
20260603120000	2026-06-18 08:51:38
20260605120000	2026-06-18 08:51:39
20260606110000	2026-06-18 08:51:40
20260616120000	2026-06-25 07:47:17
20260624120000	2026-06-25 07:47:19
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
products	products	\N	2026-06-29 06:15:45.426819+00	2026-06-29 06:15:45.426819+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-18 06:55:42.097781
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-18 06:55:42.147374
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-18 06:55:42.156099
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-18 06:55:42.184872
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-18 06:55:42.338605
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-18 06:55:42.547654
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-18 06:55:42.748403
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-18 06:55:42.850577
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-18 06:55:42.945016
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-18 06:55:42.956949
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-18 06:55:42.970006
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-18 06:55:42.978205
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-18 06:55:42.986331
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-18 06:55:42.993075
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-18 06:55:42.999817
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-18 06:55:43.040979
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-18 06:55:43.048548
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-18 06:55:43.055329
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-18 06:55:43.062014
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-18 06:55:43.069902
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-18 06:55:43.076582
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-18 06:55:43.086715
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-18 06:55:43.108018
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-18 06:55:43.124641
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-18 06:55:43.13197
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-18 06:55:43.139515
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-18 06:55:43.146403
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-18 06:55:43.153016
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-18 06:55:43.159555
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-18 06:55:43.165823
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-18 06:55:43.171896
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-18 06:55:43.177867
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-18 06:55:43.184102
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-18 06:55:43.190076
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-18 06:55:43.196167
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-18 06:55:43.202029
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-18 06:55:43.207773
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-18 06:55:43.213729
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-18 06:55:43.221134
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-18 06:55:43.237194
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-18 06:55:43.243032
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-18 06:55:43.24903
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-18 06:55:43.254982
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-18 06:55:43.260842
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-18 06:55:43.266748
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-18 06:55:43.273453
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-18 06:55:43.286517
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-18 06:55:43.293964
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-18 06:55:43.301142
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-18 06:55:43.3225
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-18 06:55:43.329213
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-18 06:55:43.875994
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-18 06:55:43.882488
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-18 06:55:43.903635
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-18 06:55:43.907435
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-18 06:55:43.909818
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-18 06:55:43.917513
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-18 06:55:43.92581
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-18 06:55:43.933572
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-18 06:55:43.941469
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-18 06:55:43.948074
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
ad89af05-7648-4903-98de-385f23b7e09b	products	images/1782716354407_Screenshot 2026-06-29 135848.png	\N	2026-06-29 06:59:13.977735+00	2026-06-29 06:59:13.977735+00	2026-06-29 06:59:13.977735+00	{"eTag": "\\"df087f505988687e0e6e5d0db1876b7b\\"", "size": 205469, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T06:59:14.000Z", "contentLength": 205469, "httpStatusCode": 200}	37e5d2b6-7706-455a-8d69-3cfeb85e07ca	\N	{}
1adaaadf-aa1d-4171-b825-4bb84eb0be8b	products	images/1782716603728_Screenshot 2026-06-29 140318.png	\N	2026-06-29 07:03:23.383133+00	2026-06-29 07:03:23.383133+00	2026-06-29 07:03:23.383133+00	{"eTag": "\\"9d88b3e4a5d9ae116f2649689e8caf9b\\"", "size": 194931, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:03:24.000Z", "contentLength": 194931, "httpStatusCode": 200}	26abdeb1-1b0e-467c-8961-21c3c7e67994	\N	{}
5f482fb2-33f3-42ed-8641-504ddd465435	products	images/1782716676097_Screenshot 2026-06-29 140425.png	\N	2026-06-29 07:04:35.679658+00	2026-06-29 07:04:35.679658+00	2026-06-29 07:04:35.679658+00	{"eTag": "\\"a8e8ebc1d3a9409964f2a8381b539230\\"", "size": 188766, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:04:36.000Z", "contentLength": 188766, "httpStatusCode": 200}	e5297abd-7770-471f-8fa8-50f74575b50a	\N	{}
98db28e0-3be1-4d6d-892a-f9fd3f9fa2e1	products	images/1782716749994_Screenshot 2026-06-29 140542.png	\N	2026-06-29 07:05:49.647801+00	2026-06-29 07:05:49.647801+00	2026-06-29 07:05:49.647801+00	{"eTag": "\\"07ac2ddf9fa10cd1961bfe293f9ccd0d\\"", "size": 202211, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:05:50.000Z", "contentLength": 202211, "httpStatusCode": 200}	15be9466-a0de-4c9e-a3a8-e9540cfe018e	\N	{}
eea811f8-cfb2-46b6-a262-ed22c986660a	products	images/1782717570536_Screenshot 2026-06-29 141919.png	\N	2026-06-29 07:19:30.109054+00	2026-06-29 07:19:30.109054+00	2026-06-29 07:19:30.109054+00	{"eTag": "\\"128fdcdf830982d199e756fb15f2f32a\\"", "size": 85163, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:19:31.000Z", "contentLength": 85163, "httpStatusCode": 200}	82483035-23af-4612-be1e-78de96e96b9a	\N	{}
3b2ae2ca-c807-4185-85dd-79ca79ca5a1c	products	images/1782717897678_Screenshot 2026-06-29 141919.png	\N	2026-06-29 07:24:57.152252+00	2026-06-29 07:24:57.152252+00	2026-06-29 07:24:57.152252+00	{"eTag": "\\"18b13b4c4b76da1762878eed0f5ef7ba\\"", "size": 85070, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:24:58.000Z", "contentLength": 85070, "httpStatusCode": 200}	06e9b193-0151-4422-91cb-5d7ef28f04d3	\N	{}
30d458a5-d66e-4abb-bb77-f00caeb41e79	products	images/1782717965732_Screenshot 2026-06-29 142556.png	\N	2026-06-29 07:26:05.226062+00	2026-06-29 07:26:05.226062+00	2026-06-29 07:26:05.226062+00	{"eTag": "\\"713e3ced050807ddb139ea77ebf4b593\\"", "size": 183342, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:26:06.000Z", "contentLength": 183342, "httpStatusCode": 200}	b48fe19c-b5fb-4251-a15b-ace95cc5a82d	\N	{}
f3ff0083-050e-49c5-af4d-55db6bf234ca	products	images/1782718010343_Screenshot 2026-06-29 142637.png	\N	2026-06-29 07:26:49.628505+00	2026-06-29 07:26:49.628505+00	2026-06-29 07:26:49.628505+00	{"eTag": "\\"9a681cb484955fcaab4a0f1aac77d9db\\"", "size": 123121, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T07:26:50.000Z", "contentLength": 123121, "httpStatusCode": 200}	0543c026-6d91-4c60-ac91-1c26f2edb9fb	\N	{}
3b811dde-7613-45ef-835d-4960fca2ade3	products	images/1782744692935_Screenshot 2026-06-29 140827.png	\N	2026-06-29 14:51:32.601901+00	2026-06-29 14:51:32.601901+00	2026-06-29 14:51:32.601901+00	{"eTag": "\\"c52f5b57d7381bf4c07856ec0947c18b\\"", "size": 186722, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-29T14:51:33.000Z", "contentLength": 186722, "httpStatusCode": 200}	6f300821-5298-4230-99a4-a521e63e6fd7	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: categories_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."categories_Id_seq"', 5, true);


--
-- Name: order_items_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."order_items_Id_seq"', 20, true);


--
-- Name: product_units_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."product_units_Id_seq"', 15, true);


--
-- Name: subscription_plans_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."subscription_plans_Id_seq"', 2, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: accounting_entries PK_accounting_entries; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_entries
    ADD CONSTRAINT "PK_accounting_entries" PRIMARY KEY ("Id");


--
-- Name: accounting_ledger_s2 PK_accounting_ledger_s2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_ledger_s2
    ADD CONSTRAINT "PK_accounting_ledger_s2" PRIMARY KEY ("Id");


--
-- Name: ai_request_logs PK_ai_request_logs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_request_logs
    ADD CONSTRAINT "PK_ai_request_logs" PRIMARY KEY ("Id");


--
-- Name: attendance_records PK_attendance_records; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT "PK_attendance_records" PRIMARY KEY ("Id");


--
-- Name: audit_logs PK_audit_logs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_audit_logs" PRIMARY KEY ("Id");


--
-- Name: cash_transactions PK_cash_transactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "PK_cash_transactions" PRIMARY KEY ("Id");


--
-- Name: categories PK_categories; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_categories" PRIMARY KEY ("Id");


--
-- Name: customers PK_customers; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_customers" PRIMARY KEY ("Id");


--
-- Name: debt_transactions PK_debt_transactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_transactions
    ADD CONSTRAINT "PK_debt_transactions" PRIMARY KEY ("Id");


--
-- Name: inventory_receipt_details PK_inventory_receipt_details; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_receipt_details
    ADD CONSTRAINT "PK_inventory_receipt_details" PRIMARY KEY ("Id");


--
-- Name: inventory_receipts PK_inventory_receipts; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_receipts
    ADD CONSTRAINT "PK_inventory_receipts" PRIMARY KEY ("Id");


--
-- Name: inventory_transactions PK_inventory_transactions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "PK_inventory_transactions" PRIMARY KEY ("Id");


--
-- Name: order_items PK_order_items; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "PK_order_items" PRIMARY KEY ("Id");


--
-- Name: orders PK_orders; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "PK_orders" PRIMARY KEY ("Id");


--
-- Name: product_histories PK_product_histories; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_histories
    ADD CONSTRAINT "PK_product_histories" PRIMARY KEY ("Id");


--
-- Name: product_units PK_product_units; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_units
    ADD CONSTRAINT "PK_product_units" PRIMARY KEY ("Id");


--
-- Name: products PK_products; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_products" PRIMARY KEY ("Id");


--
-- Name: shift_assignments PK_shift_assignments; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT "PK_shift_assignments" PRIMARY KEY ("Id");


--
-- Name: stores PK_stores; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT "PK_stores" PRIMARY KEY ("Id");


--
-- Name: subscription_plans PK_subscription_plans; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("Id");


--
-- Name: system_configs PK_system_configs; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_configs
    ADD CONSTRAINT "PK_system_configs" PRIMARY KEY ("Key");


--
-- Name: tenants PK_tenants; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "PK_tenants" PRIMARY KEY ("Id");


--
-- Name: users PK_users; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users" PRIMARY KEY ("Id");


--
-- Name: work_shifts PK_work_shifts; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_shifts
    ADD CONSTRAINT "PK_work_shifts" PRIMARY KEY ("Id");


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: IX_accounting_entries_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_accounting_entries_TenantId" ON public.accounting_entries USING btree ("TenantId");


--
-- Name: IX_accounting_ledger_s2_TenantId_ProductId_Date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_accounting_ledger_s2_TenantId_ProductId_Date" ON public.accounting_ledger_s2 USING btree ("TenantId", "ProductId", "Date" DESC);


--
-- Name: IX_ai_request_logs_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ai_request_logs_TenantId" ON public.ai_request_logs USING btree ("TenantId");


--
-- Name: IX_ai_request_logs_UserId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_ai_request_logs_UserId" ON public.ai_request_logs USING btree ("UserId");


--
-- Name: IX_cash_transactions_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_cash_transactions_TenantId" ON public.cash_transactions USING btree ("TenantId");


--
-- Name: IX_categories_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_categories_TenantId" ON public.categories USING btree ("TenantId");


--
-- Name: IX_customers_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_customers_TenantId" ON public.customers USING btree ("TenantId");


--
-- Name: IX_debt_transactions_CustomerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_debt_transactions_CustomerId" ON public.debt_transactions USING btree ("CustomerId");


--
-- Name: IX_debt_transactions_OrderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_debt_transactions_OrderId" ON public.debt_transactions USING btree ("OrderId");


--
-- Name: IX_debt_transactions_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_debt_transactions_TenantId" ON public.debt_transactions USING btree ("TenantId");


--
-- Name: IX_inventory_receipts_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_inventory_receipts_TenantId" ON public.inventory_receipts USING btree ("TenantId");


--
-- Name: IX_inventory_transactions_CreatorId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_inventory_transactions_CreatorId" ON public.inventory_transactions USING btree ("CreatorId");


--
-- Name: IX_inventory_transactions_ProductId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_inventory_transactions_ProductId" ON public.inventory_transactions USING btree ("ProductId");


--
-- Name: IX_inventory_transactions_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_inventory_transactions_TenantId" ON public.inventory_transactions USING btree ("TenantId");


--
-- Name: IX_order_items_OrderId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_order_items_OrderId" ON public.order_items USING btree ("OrderId");


--
-- Name: IX_order_items_ProductId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_order_items_ProductId" ON public.order_items USING btree ("ProductId");


--
-- Name: IX_order_items_ProductUnitId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_order_items_ProductUnitId" ON public.order_items USING btree ("ProductUnitId");


--
-- Name: IX_orders_CreatorId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_orders_CreatorId" ON public.orders USING btree ("CreatorId");


--
-- Name: IX_orders_CustomerId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_orders_CustomerId" ON public.orders USING btree ("CustomerId");


--
-- Name: IX_orders_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_orders_TenantId" ON public.orders USING btree ("TenantId");


--
-- Name: IX_product_histories_ProductId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_product_histories_ProductId" ON public.product_histories USING btree ("ProductId");


--
-- Name: IX_product_units_ProductId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_product_units_ProductId" ON public.product_units USING btree ("ProductId");


--
-- Name: IX_products_CategoryId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_products_CategoryId" ON public.products USING btree ("CategoryId");


--
-- Name: IX_products_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_products_TenantId" ON public.products USING btree ("TenantId");


--
-- Name: IX_stores_TenantId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_stores_TenantId" ON public.stores USING btree ("TenantId");


--
-- Name: IX_tenants_PendingSubscriptionPlanId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_tenants_PendingSubscriptionPlanId" ON public.tenants USING btree ("PendingSubscriptionPlanId");


--
-- Name: IX_tenants_SubscriptionPlanId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IX_tenants_SubscriptionPlanId" ON public.tenants USING btree ("SubscriptionPlanId");


--
-- Name: IX_users_Username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IX_users_Username" ON public.users USING btree ("Username");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: accounting_entries FK_accounting_entries_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_entries
    ADD CONSTRAINT "FK_accounting_entries_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: ai_request_logs FK_ai_request_logs_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_request_logs
    ADD CONSTRAINT "FK_ai_request_logs_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE SET NULL;


--
-- Name: ai_request_logs FK_ai_request_logs_users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_request_logs
    ADD CONSTRAINT "FK_ai_request_logs_users_UserId" FOREIGN KEY ("UserId") REFERENCES public.users("Id") ON DELETE SET NULL;


--
-- Name: attendance_records FK_attendance_records_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT "FK_attendance_records_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: attendance_records FK_attendance_records_users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT "FK_attendance_records_users_UserId" FOREIGN KEY ("UserId") REFERENCES public.users("Id") ON DELETE CASCADE;


--
-- Name: categories FK_categories_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_categories_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: customers FK_customers_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "FK_customers_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: debt_transactions FK_debt_transactions_customers_CustomerId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_transactions
    ADD CONSTRAINT "FK_debt_transactions_customers_CustomerId" FOREIGN KEY ("CustomerId") REFERENCES public.customers("Id") ON DELETE CASCADE;


--
-- Name: debt_transactions FK_debt_transactions_orders_OrderId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_transactions
    ADD CONSTRAINT "FK_debt_transactions_orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES public.orders("Id");


--
-- Name: debt_transactions FK_debt_transactions_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.debt_transactions
    ADD CONSTRAINT "FK_debt_transactions_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: inventory_transactions FK_inventory_transactions_products_ProductId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_inventory_transactions_products_ProductId" FOREIGN KEY ("ProductId") REFERENCES public.products("Id") ON DELETE CASCADE;


--
-- Name: inventory_transactions FK_inventory_transactions_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_inventory_transactions_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: inventory_transactions FK_inventory_transactions_users_CreatorId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "FK_inventory_transactions_users_CreatorId" FOREIGN KEY ("CreatorId") REFERENCES public.users("Id");


--
-- Name: order_items FK_order_items_orders_OrderId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_order_items_orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES public.orders("Id") ON DELETE CASCADE;


--
-- Name: order_items FK_order_items_product_units_ProductUnitId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_order_items_product_units_ProductUnitId" FOREIGN KEY ("ProductUnitId") REFERENCES public.product_units("Id");


--
-- Name: order_items FK_order_items_products_ProductId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "FK_order_items_products_ProductId" FOREIGN KEY ("ProductId") REFERENCES public.products("Id") ON DELETE CASCADE;


--
-- Name: orders FK_orders_customers_CustomerId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_orders_customers_CustomerId" FOREIGN KEY ("CustomerId") REFERENCES public.customers("Id");


--
-- Name: orders FK_orders_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_orders_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: orders FK_orders_users_CreatorId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "FK_orders_users_CreatorId" FOREIGN KEY ("CreatorId") REFERENCES public.users("Id");


--
-- Name: product_histories FK_product_histories_products_ProductId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_histories
    ADD CONSTRAINT "FK_product_histories_products_ProductId" FOREIGN KEY ("ProductId") REFERENCES public.products("Id") ON DELETE CASCADE;


--
-- Name: product_units FK_product_units_products_ProductId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_units
    ADD CONSTRAINT "FK_product_units_products_ProductId" FOREIGN KEY ("ProductId") REFERENCES public.products("Id") ON DELETE CASCADE;


--
-- Name: products FK_products_categories_CategoryId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_products_categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES public.categories("Id");


--
-- Name: products FK_products_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_products_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: shift_assignments FK_shift_assignments_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT "FK_shift_assignments_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: shift_assignments FK_shift_assignments_users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT "FK_shift_assignments_users_UserId" FOREIGN KEY ("UserId") REFERENCES public.users("Id") ON DELETE CASCADE;


--
-- Name: shift_assignments FK_shift_assignments_work_shifts_WorkShiftId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift_assignments
    ADD CONSTRAINT "FK_shift_assignments_work_shifts_WorkShiftId" FOREIGN KEY ("WorkShiftId") REFERENCES public.work_shifts("Id") ON DELETE CASCADE;


--
-- Name: tenants FK_tenants_subscription_plans_PendingSubscriptionPlanId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "FK_tenants_subscription_plans_PendingSubscriptionPlanId" FOREIGN KEY ("PendingSubscriptionPlanId") REFERENCES public.subscription_plans("Id") ON DELETE SET NULL;


--
-- Name: tenants FK_tenants_subscription_plans_SubscriptionPlanId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT "FK_tenants_subscription_plans_SubscriptionPlanId" FOREIGN KEY ("SubscriptionPlanId") REFERENCES public.subscription_plans("Id") ON DELETE SET NULL;


--
-- Name: users FK_users_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_users_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: work_shifts FK_work_shifts_tenants_TenantId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_shifts
    ADD CONSTRAINT "FK_work_shifts_tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES public.tenants("Id") ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: __EFMigrationsHistory; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public."__EFMigrationsHistory" ENABLE ROW LEVEL SECURITY;

--
-- Name: accounting_entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: accounting_ledger_s2; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accounting_ledger_s2 ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_request_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: attendance_records; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: debt_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.debt_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_receipt_details; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_receipt_details ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_receipts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: product_histories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_histories ENABLE ROW LEVEL SECURITY;

--
-- Name: product_units; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: shift_assignments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: stores; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: system_configs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: work_shifts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow Public Upload 1ifhysk_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow Public Upload 1ifhysk_0" ON storage.objects FOR SELECT TO authenticated, anon USING ((bucket_id = 'products'::text));


--
-- Name: objects Allow Public Upload 1ifhysk_1; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow Public Upload 1ifhysk_1" ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK ((bucket_id = 'products'::text));


--
-- Name: objects Allow Public Upload 1ifhysk_2; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow Public Upload 1ifhysk_2" ON storage.objects FOR UPDATE TO authenticated, anon USING ((bucket_id = 'products'::text));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE "__EFMigrationsHistory"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."__EFMigrationsHistory" TO anon;
GRANT ALL ON TABLE public."__EFMigrationsHistory" TO authenticated;
GRANT ALL ON TABLE public."__EFMigrationsHistory" TO service_role;


--
-- Name: TABLE accounting_entries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accounting_entries TO anon;
GRANT ALL ON TABLE public.accounting_entries TO authenticated;
GRANT ALL ON TABLE public.accounting_entries TO service_role;


--
-- Name: TABLE accounting_ledger_s2; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accounting_ledger_s2 TO anon;
GRANT ALL ON TABLE public.accounting_ledger_s2 TO authenticated;
GRANT ALL ON TABLE public.accounting_ledger_s2 TO service_role;


--
-- Name: TABLE ai_request_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ai_request_logs TO anon;
GRANT ALL ON TABLE public.ai_request_logs TO authenticated;
GRANT ALL ON TABLE public.ai_request_logs TO service_role;


--
-- Name: TABLE attendance_records; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.attendance_records TO anon;
GRANT ALL ON TABLE public.attendance_records TO authenticated;
GRANT ALL ON TABLE public.attendance_records TO service_role;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- Name: TABLE cash_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cash_transactions TO anon;
GRANT ALL ON TABLE public.cash_transactions TO authenticated;
GRANT ALL ON TABLE public.cash_transactions TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: SEQUENCE "categories_Id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."categories_Id_seq" TO anon;
GRANT ALL ON SEQUENCE public."categories_Id_seq" TO authenticated;
GRANT ALL ON SEQUENCE public."categories_Id_seq" TO service_role;


--
-- Name: TABLE customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customers TO anon;
GRANT ALL ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.customers TO service_role;


--
-- Name: TABLE debt_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.debt_transactions TO anon;
GRANT ALL ON TABLE public.debt_transactions TO authenticated;
GRANT ALL ON TABLE public.debt_transactions TO service_role;


--
-- Name: TABLE inventory_receipt_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_receipt_details TO anon;
GRANT ALL ON TABLE public.inventory_receipt_details TO authenticated;
GRANT ALL ON TABLE public.inventory_receipt_details TO service_role;


--
-- Name: TABLE inventory_receipts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_receipts TO anon;
GRANT ALL ON TABLE public.inventory_receipts TO authenticated;
GRANT ALL ON TABLE public.inventory_receipts TO service_role;


--
-- Name: TABLE inventory_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_transactions TO anon;
GRANT ALL ON TABLE public.inventory_transactions TO authenticated;
GRANT ALL ON TABLE public.inventory_transactions TO service_role;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- Name: SEQUENCE "order_items_Id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."order_items_Id_seq" TO anon;
GRANT ALL ON SEQUENCE public."order_items_Id_seq" TO authenticated;
GRANT ALL ON SEQUENCE public."order_items_Id_seq" TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE product_histories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_histories TO anon;
GRANT ALL ON TABLE public.product_histories TO authenticated;
GRANT ALL ON TABLE public.product_histories TO service_role;


--
-- Name: TABLE product_units; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_units TO anon;
GRANT ALL ON TABLE public.product_units TO authenticated;
GRANT ALL ON TABLE public.product_units TO service_role;


--
-- Name: SEQUENCE "product_units_Id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."product_units_Id_seq" TO anon;
GRANT ALL ON SEQUENCE public."product_units_Id_seq" TO authenticated;
GRANT ALL ON SEQUENCE public."product_units_Id_seq" TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE shift_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shift_assignments TO anon;
GRANT ALL ON TABLE public.shift_assignments TO authenticated;
GRANT ALL ON TABLE public.shift_assignments TO service_role;


--
-- Name: TABLE stores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stores TO anon;
GRANT ALL ON TABLE public.stores TO authenticated;
GRANT ALL ON TABLE public.stores TO service_role;


--
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_plans TO anon;
GRANT ALL ON TABLE public.subscription_plans TO authenticated;
GRANT ALL ON TABLE public.subscription_plans TO service_role;


--
-- Name: SEQUENCE "subscription_plans_Id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."subscription_plans_Id_seq" TO anon;
GRANT ALL ON SEQUENCE public."subscription_plans_Id_seq" TO authenticated;
GRANT ALL ON SEQUENCE public."subscription_plans_Id_seq" TO service_role;


--
-- Name: TABLE system_configs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_configs TO anon;
GRANT ALL ON TABLE public.system_configs TO authenticated;
GRANT ALL ON TABLE public.system_configs TO service_role;


--
-- Name: TABLE tenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tenants TO anon;
GRANT ALL ON TABLE public.tenants TO authenticated;
GRANT ALL ON TABLE public.tenants TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE work_shifts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.work_shifts TO anon;
GRANT ALL ON TABLE public.work_shifts TO authenticated;
GRANT ALL ON TABLE public.work_shifts TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict 9GB3mtHDE8Qy1Zx49HUarS2rI1MH1hXOP4LnwVHYC4DmKsuqme96kG9vaHHSqW8

