CREATE TABLE reference.scenario_vehiclecategory_site(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  scenario_vehiclecategory_id uuid NOT NULL,
  site_main_id uuid NOT NULL,
  quantity integer,
  unlimited_yn text,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "scenario_vehiclecategory_site_PK" PRIMARY KEY (id),
  CONSTRAINT "scenario_vehiclecategory_site_UN" UNIQUE (scenario_vehiclecategory_id,site_main_id)
);

ALTER TABLE reference.scenario_vehiclecategory_site ADD CONSTRAINT "scenario_vehiclecategory_site_FK01" FOREIGN KEY (scenario_vehiclecategory_id)
REFERENCES reference.scenario_vehiclecategory (id) MATCH FULL;

ALTER TABLE reference.scenario_vehiclecategory_site ADD CONSTRAINT "scenario_vehiclecategory_site_FK02" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL;

INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/aclaction/has-access','Contrôler un droit','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access'),
    (select id from reference.acl_role where code='USER'),
    'C');

CREATE UNIQUE INDEX transport_demandtime_unique
    ON reference.transport_demandtime
       (timeslot_th, 
       transport_demand_id);