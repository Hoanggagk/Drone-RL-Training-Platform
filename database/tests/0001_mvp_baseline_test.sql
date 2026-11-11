\set ON_ERROR_STOP on

begin;

create schema if not exists test_support;
create or replace function test_support.assert_true(condition boolean, message text)
returns void language plpgsql as $$
begin
    if condition is distinct from true then
        raise exception 'assertion failed: %', message;
    end if;
end;
$$;

do $$
declare
    v_user uuid := gen_random_uuid();
    v_project uuid := gen_random_uuid();
    v_experiment uuid := gen_random_uuid();
    v_simulator uuid := gen_random_uuid();
    v_task uuid := gen_random_uuid();
    v_algorithm uuid := gen_random_uuid();
    v_adapter uuid := gen_random_uuid();
    v_snapshot uuid := gen_random_uuid();
    v_run uuid := gen_random_uuid();
    v_job bigint;
    v_claim record;
    v_metric_definition uuid := gen_random_uuid();
    v_failed boolean := false;
    v_sha text := repeat('a', 64);
begin
    insert into iam.user_accounts(user_id, display_name, status) values (v_user, 'Test User', 'active');
    insert into research.projects(id, name, created_by_user_id) values (v_project, 'Test Project', v_user);
    insert into research.experiments(id, project_id, name, created_by_user_id)
        values (v_experiment, v_project, 'Test Experiment', v_user);
    insert into catalog.simulators(id, code, name) values (v_simulator, 'test_simulator', 'Test Simulator');
    insert into catalog.task_versions(id, task_code, version, contract, contract_checksum)
        values (v_task, 'hovering', 'test', '{}'::jsonb, v_sha);
    insert into catalog.algorithm_versions(id, algorithm_code, version, config_schema, framework_version)
        values (v_algorithm, 'ppo', 'test', '{}'::jsonb, 'test');
    insert into catalog.adapter_versions(id, adapter_code, version, simulator_id, capabilities, mapping_version)
        values (v_adapter, 'test_adapter', 'test', v_simulator, '{}'::jsonb, 'test');
    insert into config.snapshots(id, experiment_id, project_id, payload, schema_version, sha256, seed,
                                 task_version_id, algorithm_version_id, adapter_version_id)
        values (v_snapshot, v_experiment, v_project, '{}'::jsonb, '1', v_sha, 7,
                v_task, v_algorithm, v_adapter);

    begin
        update config.snapshots set seed = 8 where id = v_snapshot;
    exception when sqlstate '55000' then
        v_failed := true;
    end;
    perform test_support.assert_true(v_failed, 'snapshot update must be rejected');

    insert into execution.training_runs(id, project_id, experiment_id, snapshot_id,
                                        requested_by_user_id, idempotency_key)
        values (v_run, v_project, v_experiment, v_snapshot, v_user, 'test-run-1');
    insert into execution.jobs(training_run_id) values (v_run) returning id into v_job;

    select * into v_claim from execution.claim_next_job('worker-test');
    perform test_support.assert_true(v_claim.job_id = v_job, 'queued job must be claimed');
    perform test_support.assert_true(v_claim.fencing_token = 1, 'first fencing token must be one');
    perform test_support.assert_true((select count(*) = 1 from execution.attempts where job_id = v_job),
                                     'claim must create exactly one attempt');
    perform test_support.assert_true(not exists(select 1 from execution.claim_next_job('worker-other')),
                                     'claimed job must not be claimed twice');

    v_failed := false;
    begin
        insert into platform.artifacts(project_id, experiment_id, training_run_id, artifact_type,
                                       status, manifest, schema_version)
        values (v_project, v_experiment, v_run, 'checkpoint', 'available', '{}'::jsonb, '1');
    exception when check_violation then
        v_failed := true;
    end;
    perform test_support.assert_true(v_failed, 'available artifact requires verified storage metadata');

    insert into results.metric_definitions(id, metric_code, version, phase, definition, aggregation, source)
    values (v_metric_definition, 'test.reward', '1', 'training', 'Test reward', 'last', 'task');

    v_failed := false;
    begin
        insert into results.training_metrics(run_id, attempt_id, metric_definition_id, sequence_no,
                                             availability, value, occurred_at)
        values (v_run, v_claim.attempt_id, v_metric_definition, 1, 'unavailable', 0, now());
    exception when check_violation then
        v_failed := true;
    end;
    perform test_support.assert_true(v_failed, 'unavailable metric must not silently become zero');
end;
$$;

rollback;
