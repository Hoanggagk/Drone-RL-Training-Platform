-- Development-only seed. It intentionally does not claim simulator/task support.
begin;

insert into catalog.simulators(code, name, status)
values
    ('project_airsim', 'Project AirSim', 'configured'),
    ('gym_pybullet_drones', 'Gym-PyBullet-Drones', 'configured')
on conflict (code) do nothing;

commit;
