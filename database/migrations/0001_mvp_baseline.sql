-- Drone RL Training Platform - PostgreSQL MVP baseline
-- Target: PostgreSQL 15+. Provider-neutral; no Supabase-specific objects.

begin;

create extension if not exists pgcrypto;

create schema if not exists iam;
create schema if not exists research;
create schema if not exists catalog;
create schema if not exists config;
create schema if not exists execution;
create schema if not exists results;
create schema if not exists platform;

create table iam.user_accounts (
    user_id uuid primary key default gen_random_uuid(),
    display_name text not null check (btrim(display_name) <> ''),
    status text not null default 'pending' check (status in ('pending','active','locked','disabled')),
    locked_at timestamptz,
    disabled_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    row_version bigint not null default 1 check (row_version > 0),
    check ((status = 'locked') = (locked_at is not null)),
    check ((status = 'disabled') = (disabled_at is not null))
);

create table research.projects (
    id uuid primary key default gen_random_uuid(),
    name text not null check (btrim(name) <> ''),
    description text,
    objective text,
    status text not null default 'active' check (status in ('active','archived')),
    created_by_user_id uuid not null references iam.user_accounts(user_id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    row_version bigint not null default 1 check (row_version > 0)
);

create index projects_created_by_user_id_idx on research.projects(created_by_user_id);

create table research.experiments (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references research.projects(id) on delete restrict,
    name text not null check (btrim(name) <> ''),
    objective text,
    description text,
    status text not null default 'draft' check (status in ('draft','active','archived')),
    created_by_user_id uuid not null references iam.user_accounts(user_id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    row_version bigint not null default 1 check (row_version > 0),
    unique (id, project_id)
);

create index experiments_project_created_idx on research.experiments(project_id, created_at desc, id);
create index experiments_created_by_user_id_idx on research.experiments(created_by_user_id);

create table catalog.simulators (
    id uuid primary key default gen_random_uuid(),
    code text not null unique check (code ~ '^[a-z][a-z0-9_]*$'),
    name text not null check (btrim(name) <> ''),
    status text not null default 'configured' check (status in ('configured','unsupported','supported')),
    created_at timestamptz not null default now()
);

create table catalog.task_versions (
    id uuid primary key default gen_random_uuid(),
    task_code text not null check (task_code ~ '^[a-z][a-z0-9_]*$'),
    version text not null check (btrim(version) <> ''),
    contract jsonb not null check (jsonb_typeof(contract) = 'object'),
    contract_checksum text not null check (contract_checksum ~ '^[0-9a-f]{64}$'),
    status text not null default 'candidate' check (status in ('candidate','supported','retired')),
    created_at timestamptz not null default now(),
    unique (task_code, version)
);

create table catalog.algorithm_versions (
    id uuid primary key default gen_random_uuid(),
    algorithm_code text not null check (algorithm_code ~ '^[a-z][a-z0-9_]*$'),
    version text not null check (btrim(version) <> ''),
    config_schema jsonb not null check (jsonb_typeof(config_schema) = 'object'),
    framework_version text not null,
    status text not null default 'candidate' check (status in ('candidate','supported','retired')),
    created_at timestamptz not null default now(),
    unique (algorithm_code, version)
);

create table catalog.adapter_versions (
    id uuid primary key default gen_random_uuid(),
    adapter_code text not null check (adapter_code ~ '^[a-z][a-z0-9_]*$'),
    version text not null,
    simulator_id uuid not null references catalog.simulators(id) on delete restrict,
    capabilities jsonb not null check (jsonb_typeof(capabilities) = 'object'),
    mapping_version text not null,
    evidence_ref text,
    created_at timestamptz not null default now(),
    unique (adapter_code, version)
);

create index adapter_versions_simulator_id_idx on catalog.adapter_versions(simulator_id);

create table config.snapshots (
    id uuid primary key default gen_random_uuid(),
    experiment_id uuid not null,
    project_id uuid not null,
    payload jsonb not null check (jsonb_typeof(payload) = 'object'),
    schema_version text not null check (btrim(schema_version) <> ''),
    sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
    seed bigint not null,
    task_version_id uuid not null references catalog.task_versions(id) on delete restrict,
    algorithm_version_id uuid not null references catalog.algorithm_versions(id) on delete restrict,
    adapter_version_id uuid not null references catalog.adapter_versions(id) on delete restrict,
    created_at timestamptz not null default now(),
    foreign key (experiment_id, project_id)
        references research.experiments(id, project_id) on delete restrict,
    unique (id, experiment_id, project_id),
    unique (experiment_id, sha256)
);

create index snapshots_project_id_idx on config.snapshots(project_id);
create index snapshots_task_version_id_idx on config.snapshots(task_version_id);
create index snapshots_algorithm_version_id_idx on config.snapshots(algorithm_version_id);
create index snapshots_adapter_version_id_idx on config.snapshots(adapter_version_id);

create function config.reject_snapshot_mutation() returns trigger
language plpgsql as $$
begin
    raise exception 'config snapshots are immutable' using errcode = '55000';
end;
$$;

create trigger snapshots_immutable
before update or delete on config.snapshots
for each row execute function config.reject_snapshot_mutation();

create table execution.training_runs (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null,
    experiment_id uuid not null,
    snapshot_id uuid not null,
    requested_by_user_id uuid not null references iam.user_accounts(user_id) on delete restrict,
    status text not null default 'queued' check (status in ('queued','running','stop_requested','completed','failed','stopped')),
    idempotency_key text not null check (btrim(idempotency_key) <> ''),
    current_step bigint not null default 0 check (current_step >= 0),
    started_at timestamptz,
    ended_at timestamptz,
    stop_requested_at timestamptz,
    error_code text,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    row_version bigint not null default 1 check (row_version > 0),
    foreign key (snapshot_id, experiment_id, project_id)
        references config.snapshots(id, experiment_id, project_id) on delete restrict,
    unique (id, project_id),
    unique (requested_by_user_id, idempotency_key),
    check ((status in ('completed','failed','stopped')) = (ended_at is not null)),
    check (status <> 'stop_requested' or stop_requested_at is not null)
);

create index training_runs_experiment_created_idx on execution.training_runs(experiment_id, created_at desc, id);
create index training_runs_project_id_idx on execution.training_runs(project_id);
create index training_runs_snapshot_id_idx on execution.training_runs(snapshot_id);

create table platform.artifacts (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references research.projects(id) on delete restrict,
    experiment_id uuid,
    training_run_id uuid,
    artifact_type text not null check (artifact_type in ('checkpoint','model','log','trajectory','export','report')),
    storage_key text unique,
    status text not null default 'staging' check (status in ('staging','verifying','available','invalid','missing','archived')),
    byte_size bigint check (byte_size >= 0),
    checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-f]{64}$'),
    media_type text,
    format_version text,
    manifest jsonb not null default '{}'::jsonb check (jsonb_typeof(manifest) = 'object'),
    schema_version text not null,
    committed_at timestamptz,
    created_at timestamptz not null default now(),
    foreign key (experiment_id, project_id)
        references research.experiments(id, project_id) on delete restrict,
    foreign key (training_run_id, project_id)
        references execution.training_runs(id, project_id) on delete restrict,
    unique (id, project_id),
    check (status <> 'available' or
        (storage_key is not null and byte_size is not null and checksum_sha256 is not null and committed_at is not null))
);

create index artifacts_experiment_id_idx on platform.artifacts(experiment_id);
create index artifacts_training_run_id_idx on platform.artifacts(training_run_id);
create index artifacts_project_status_created_idx on platform.artifacts(project_id, status, created_at desc);

create table results.checkpoints (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null,
    run_id uuid not null,
    artifact_id uuid not null,
    checkpoint_key text not null,
    step bigint not null check (step >= 0),
    status text not null default 'staging' check (status in ('staging','verifying','available','invalid','missing')),
    format_version text not null,
    algorithm_version_id uuid not null references catalog.algorithm_versions(id) on delete restrict,
    load_verified_at timestamptz,
    load_status text not null default 'not_tested' check (load_status in ('not_tested','passed','failed')),
    resume_capability text not null default 'unknown' check (resume_capability in ('unknown','inference_only','exact','approximate')),
    created_at timestamptz not null default now(),
    foreign key (run_id, project_id) references execution.training_runs(id, project_id) on delete restrict,
    foreign key (artifact_id, project_id) references platform.artifacts(id, project_id) on delete restrict,
    unique (id, project_id),
    unique (artifact_id),
    unique (run_id, checkpoint_key),
    check (status <> 'available' or (load_status = 'passed' and load_verified_at is not null))
);

create index checkpoints_run_step_idx on results.checkpoints(run_id, step desc, id);
create index checkpoints_algorithm_version_id_idx on results.checkpoints(algorithm_version_id);

create table execution.evaluation_runs (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null,
    experiment_id uuid not null,
    snapshot_id uuid not null,
    checkpoint_id uuid not null,
    requested_by_user_id uuid not null references iam.user_accounts(user_id) on delete restrict,
    protocol jsonb not null check (jsonb_typeof(protocol) = 'object'),
    protocol_schema_version text not null,
    protocol_sha256 text not null check (protocol_sha256 ~ '^[0-9a-f]{64}$'),
    status text not null default 'queued' check (status in ('queued','running','stop_requested','completed','failed','stopped')),
    completeness text not null default 'none' check (completeness in ('none','partial','complete')),
    source_checksum text not null check (source_checksum ~ '^[0-9a-f]{64}$'),
    post_checksum text check (post_checksum is null or post_checksum ~ '^[0-9a-f]{64}$'),
    started_at timestamptz,
    ended_at timestamptz,
    stop_requested_at timestamptz,
    error_code text,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    row_version bigint not null default 1 check (row_version > 0),
    foreign key (snapshot_id, experiment_id, project_id)
        references config.snapshots(id, experiment_id, project_id) on delete restrict,
    foreign key (checkpoint_id, project_id)
        references results.checkpoints(id, project_id) on delete restrict,
    unique (id, project_id),
    check ((status in ('completed','failed','stopped')) = (ended_at is not null)),
    check (status <> 'completed' or (completeness = 'complete' and post_checksum = source_checksum)),
    check (status <> 'stop_requested' or stop_requested_at is not null)
);

create index evaluation_runs_experiment_created_idx on execution.evaluation_runs(experiment_id, created_at desc, id);
create index evaluation_runs_checkpoint_id_idx on execution.evaluation_runs(checkpoint_id);
create index evaluation_runs_requested_by_user_id_idx on execution.evaluation_runs(requested_by_user_id);

alter table platform.artifacts add column evaluation_run_id uuid;
alter table platform.artifacts add constraint artifacts_evaluation_run_project_fk
    foreign key (evaluation_run_id, project_id)
    references execution.evaluation_runs(id, project_id) on delete restrict;
create index artifacts_evaluation_run_id_idx on platform.artifacts(evaluation_run_id);

create table execution.jobs (
    id bigint generated always as identity primary key,
    training_run_id uuid unique references execution.training_runs(id) on delete restrict,
    evaluation_run_id uuid unique references execution.evaluation_runs(id) on delete restrict,
    status text not null default 'queued' check (status in ('queued','claimed','running','completed','failed','stopped')),
    priority smallint not null default 0,
    queued_at timestamptz not null default now(),
    claimed_at timestamptz,
    worker_id text,
    fencing_token bigint not null default 0 check (fencing_token >= 0),
    row_version bigint not null default 1 check (row_version > 0),
    check (num_nonnulls(training_run_id, evaluation_run_id) = 1),
    check (status = 'queued' or (claimed_at is not null and worker_id is not null))
);

create index jobs_claim_idx on execution.jobs(priority desc, queued_at, id) where status = 'queued';

create table execution.attempts (
    id bigint generated always as identity primary key,
    job_id bigint not null references execution.jobs(id) on delete restrict,
    attempt_no integer not null check (attempt_no > 0),
    worker_id text not null check (btrim(worker_id) <> ''),
    fencing_token bigint not null check (fencing_token > 0),
    process_id bigint,
    process_started_at timestamptz,
    heartbeat_at timestamptz,
    status text not null check (status in ('claimed','starting','running','stopping','completed','failed','stopped','stale')),
    exit_code integer,
    runtime_metadata jsonb check (runtime_metadata is null or jsonb_typeof(runtime_metadata) = 'object'),
    started_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default now(),
    unique (job_id, attempt_no)
);

create unique index attempts_one_active_per_job_idx on execution.attempts(job_id)
where status in ('claimed','starting','running','stopping');
create index attempts_active_heartbeat_idx on execution.attempts(heartbeat_at, id)
where status in ('claimed','starting','running','stopping');

create table execution.runtime_leases (
    id bigint generated always as identity primary key,
    attempt_id bigint not null references execution.attempts(id) on delete restrict,
    runtime_key text not null check (btrim(runtime_key) <> ''),
    status text not null default 'active' check (status in ('active','released','expired')),
    acquired_at timestamptz not null default now(),
    expires_at timestamptz not null,
    released_at timestamptz,
    check (expires_at > acquired_at),
    check (status = 'active' or released_at is not null)
);

create index runtime_leases_attempt_id_idx on execution.runtime_leases(attempt_id);
create unique index runtime_leases_one_active_key_idx on execution.runtime_leases(runtime_key) where status = 'active';

create function execution.claim_next_job(p_worker_id text)
returns table(job_id bigint, attempt_id bigint, fencing_token bigint, training_run_id uuid, evaluation_run_id uuid)
language plpgsql
security invoker
set search_path = pg_catalog, execution
as $$
declare
    v_job execution.jobs%rowtype;
    v_attempt_id bigint;
begin
    if p_worker_id is null or btrim(p_worker_id) = '' then
        raise exception 'worker_id must not be blank' using errcode = '22023';
    end if;

    select * into v_job
    from execution.jobs
    where status = 'queued'
    order by priority desc, queued_at, id
    limit 1
    for update skip locked;

    if not found then
        return;
    end if;

    update execution.jobs
    set status = 'claimed', claimed_at = clock_timestamp(), worker_id = p_worker_id,
        fencing_token = execution.jobs.fencing_token + 1,
        row_version = execution.jobs.row_version + 1
    where id = v_job.id
    returning * into v_job;

    insert into execution.attempts(job_id, attempt_no, worker_id, fencing_token, heartbeat_at, status)
    values (
        v_job.id,
        coalesce((select max(a.attempt_no) + 1 from execution.attempts a where a.job_id = v_job.id), 1),
        p_worker_id,
        v_job.fencing_token,
        clock_timestamp(),
        'claimed'
    ) returning id into v_attempt_id;

    return query select v_job.id, v_attempt_id, v_job.fencing_token, v_job.training_run_id, v_job.evaluation_run_id;
end;
$$;

create table results.metric_definitions (
    id uuid primary key default gen_random_uuid(),
    metric_code text not null check (metric_code ~ '^[a-z][a-z0-9_.]*$'),
    version text not null,
    phase text not null check (phase in ('training','evaluation')),
    definition text not null,
    unit text,
    aggregation text not null,
    source text not null check (source in ('task','algorithm','platform')),
    status text not null default 'active' check (status in ('active','retired')),
    created_at timestamptz not null default now(),
    unique (metric_code, version, phase)
);

create table results.training_metrics (
    id bigint generated always as identity primary key,
    run_id uuid not null references execution.training_runs(id) on delete restrict,
    attempt_id bigint not null references execution.attempts(id) on delete restrict,
    metric_definition_id uuid not null references results.metric_definitions(id) on delete restrict,
    sequence_no bigint not null check (sequence_no >= 0),
    step bigint check (step >= 0),
    episode bigint check (episode >= 0),
    value double precision,
    availability text not null check (availability in ('available','unavailable')),
    occurred_at timestamptz not null,
    unique (attempt_id, sequence_no, metric_definition_id),
    check ((availability = 'available') = (value is not null)),
    check (value is null or value not in ('Infinity'::float8, '-Infinity'::float8) and value = value)
);

create index training_metrics_chart_idx on results.training_metrics(run_id, metric_definition_id, step, id);
create index training_metrics_attempt_id_idx on results.training_metrics(attempt_id);

create table results.evaluation_episodes (
    id bigint generated always as identity primary key,
    evaluation_run_id uuid not null references execution.evaluation_runs(id) on delete restrict,
    episode_no integer not null check (episode_no >= 0),
    seed bigint not null,
    return_value double precision,
    episode_length bigint not null check (episode_length >= 0),
    outcome text not null check (outcome in ('success','failure','time_limit','partial')),
    terminated boolean not null,
    truncated boolean not null,
    trajectory_artifact_id uuid references platform.artifacts(id) on delete restrict,
    created_at timestamptz not null default now(),
    unique (evaluation_run_id, episode_no),
    check (return_value is null or return_value not in ('Infinity'::float8, '-Infinity'::float8) and return_value = return_value)
);

create index evaluation_episodes_trajectory_artifact_id_idx on results.evaluation_episodes(trajectory_artifact_id);

create table results.evaluation_metrics (
    id bigint generated always as identity primary key,
    evaluation_run_id uuid not null references execution.evaluation_runs(id) on delete restrict,
    metric_definition_id uuid not null references results.metric_definitions(id) on delete restrict,
    value double precision,
    availability text not null check (availability in ('available','unavailable')),
    sample_count integer check (sample_count >= 0),
    aggregation text not null,
    computed_at timestamptz not null default now(),
    unique (evaluation_run_id, metric_definition_id, aggregation),
    check ((availability = 'available') = (value is not null)),
    check (value is null or value not in ('Infinity'::float8, '-Infinity'::float8) and value = value)
);

create table platform.operational_events (
    id bigint generated always as identity primary key,
    event_id uuid not null unique default gen_random_uuid(),
    component text not null,
    layer text not null check (layer in ('api','dispatcher','worker','task','adapter','simulator','storage')),
    severity text not null check (severity in ('debug','info','warning','error','critical')),
    error_code text,
    message_code text not null,
    safe_details jsonb check (safe_details is null or jsonb_typeof(safe_details) = 'object'),
    correlation_id uuid,
    training_run_id uuid references execution.training_runs(id) on delete restrict,
    evaluation_run_id uuid references execution.evaluation_runs(id) on delete restrict,
    attempt_id bigint references execution.attempts(id) on delete restrict,
    log_artifact_id uuid references platform.artifacts(id) on delete restrict,
    occurred_at timestamptz not null,
    received_at timestamptz not null default now(),
    check (num_nonnulls(training_run_id, evaluation_run_id) <= 1)
);

create index operational_events_training_idx on platform.operational_events(training_run_id, occurred_at desc) where training_run_id is not null;
create index operational_events_evaluation_idx on platform.operational_events(evaluation_run_id, occurred_at desc) where evaluation_run_id is not null;
create index operational_events_attempt_id_idx on platform.operational_events(attempt_id);
create index operational_events_log_artifact_id_idx on platform.operational_events(log_artifact_id);

comment on function execution.claim_next_job(text) is
'Atomic PostgreSQL queue claim. Call in a short transaction and spawn the child process only after commit.';
comment on table config.snapshots is 'Immutable, canonical effective configuration attached to runs (AC-015).';
comment on table platform.artifacts is 'Metadata only; artifact bytes remain in Artifact Storage (ADR-006).';

commit;
