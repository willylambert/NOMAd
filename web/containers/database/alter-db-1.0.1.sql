-- DATACHECKER MAIN
CREATE TABLE reference.datachecker_main(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  label text,
  status_th uuid NOT NULL,
  scope_th uuid NOT NULL,
  level_th uuid NOT NULL,
  label_tpl text,
  hookname text,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "datachecker_main_PK" PRIMARY KEY (id)
);

COMMENT ON TABLE reference.datachecker_main IS 'Definition of consistency checks';
COMMENT ON COLUMN reference.datachecker_main.status_th IS 'Status : enable / disable';
COMMENT ON COLUMN reference.datachecker_main.scope_th IS 'On whick element checker is applied : scenario, route, vehicle category, poi, rh ...';
COMMENT ON COLUMN reference.datachecker_main.level_th IS 'Level : ERROR,WARNING,INFO';
COMMENT ON COLUMN reference.datachecker_main.label_tpl IS 'Template Label used to generate checker message displayed to user';
COMMENT ON COLUMN reference.datachecker_main.hookname IS 'Hookname used in PHP code to defined the checker';

ALTER TABLE reference.datachecker_main ADD CONSTRAINT "datachecker_main_FK01" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_main ADD CONSTRAINT "datachecker_main_FK02" FOREIGN KEY (scope_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_main ADD CONSTRAINT "datachecker_main_FK03" FOREIGN KEY (level_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- DATACHECKER DETAIL
CREATE TABLE reference.datachecker_detail(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  datachecker_main_id uuid NOT NULL,
  label text,
  dt integer,
  ack_yn text NOT NULL DEFAULT 'N',
  ack_user_id uuid,
  ack_dt integer,
  scenario_main_id uuid,
  transport_demand_id uuid,
  transport_calendar_id uuid,
  transport_route_id uuid,
  vehicle_category_id uuid,
  site_poi_id uuid,
  hr_main_id uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "datachecker_detail_PK" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX datachecker_detail_unique
    ON reference.datachecker_detail
       (datachecker_main_id, 
        coalesce(scenario_main_id, '00000000-0000-0000-0000-000000000000'),
        coalesce(transport_demand_id,'00000000-0000-0000-0000-000000000000'),
        coalesce(transport_calendar_id,'00000000-0000-0000-0000-000000000000'),
        coalesce(transport_route_id,'00000000-0000-0000-0000-000000000000'),
        coalesce(vehicle_category_id,'00000000-0000-0000-0000-000000000000'),
        coalesce(site_poi_id,'00000000-0000-0000-0000-000000000000'),
        coalesce(hr_main_id,'00000000-0000-0000-0000-000000000000')
       );

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK01" FOREIGN KEY (datachecker_main_id)
REFERENCES reference.datachecker_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK02" FOREIGN KEY (scenario_main_id)
REFERENCES reference.scenario_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK03" FOREIGN KEY (transport_demand_id)
REFERENCES reference.transport_demand (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK04" FOREIGN KEY (transport_calendar_id)
REFERENCES reference.transport_calendar (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK05" FOREIGN KEY (transport_route_id)
REFERENCES reference.transport_route (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK06" FOREIGN KEY (vehicle_category_id)
REFERENCES reference.vehicle_category (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK07" FOREIGN KEY (site_poi_id)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.datachecker_detail ADD CONSTRAINT "datachecker_detail_FK08" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMENT ON TABLE reference.datachecker_detail IS 'Generated consistency checks';
COMMENT ON COLUMN reference.datachecker_detail.label IS 'full message generated describing the error/info';
COMMENT ON COLUMN reference.datachecker_detail.dt IS 'date (timestamp) of generation';
COMMENT ON COLUMN reference.datachecker_detail.ack_yn IS 'message acknowledge by user';
COMMENT ON COLUMN reference.datachecker_detail.ack_user_id IS 'user who acknowledge message';
COMMENT ON COLUMN reference.datachecker_detail.ack_dt IS 'date (timestamp) of acknowledge';
COMMENT ON COLUMN reference.datachecker_detail.scenario_main_id IS 'Context : Linked Scenario';
COMMENT ON COLUMN reference.datachecker_detail.transport_route_id IS 'Context : Linked Route';
COMMENT ON COLUMN reference.datachecker_detail.vehicle_category_id IS 'Context : Linked Vehicle Cateogry';
COMMENT ON COLUMN reference.datachecker_detail.site_poi_id IS 'Context : Linked POI';
COMMENT ON COLUMN reference.datachecker_detail.hr_main_id IS 'Context : Linked HR';

-- DATACHECKER THESAURUS ENTRIES
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_STATUS','ENABLED','Activé','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_STATUS','DISABLED','Désactivé','C');

insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','SCENARIO','Scénario','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','ROUTE','Route','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','VEHICLE_CAT','Catégorie de véhicule','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','POI','Point','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','DEMAND','Demande','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','HR','Usager','C');

insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_LEVEL','ERROR','Erreur','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_LEVEL','WARNING','Avertissement','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_LEVEL','INFO','Information','C');

-- DATACHECKER DEFAULT DATA
insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Usager : avec demande mais sans tournée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='DEMAND'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='ERROR'),
             'Dans le scénario {{scenario.label}}, le {{(calendar.date_dt/1000)|date("m/d/Y") }} {{calendar.timeslot_label}} l''usager {{hr.firstname}} {{hr.lastname}} n''est pas pris en charge. Veuillez corriger.',
             'hr_demand_without_route'
            );

-- ACL
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/menu/data/checker','Accès au menu Data/Contrôles','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/list','Lister des contrôles de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/{checkerId}','Afficher un contrôle de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/save','Enregistrer un contrôle de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/mark-as-removed','Supprimer un contrôle de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/delete','Supprimer définitivement un contrôle de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datachecker/run','Exécuter un contrôle de cohérence','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datacheckerdetail/list','Lister les résultats de l''exécution des contrôles de cohérences','C');
INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/datacheckerdetail/delete','Supprimer définitivement un résultat de contrôle de cohérence','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/menu/data/checker'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/list'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/{checkerId}'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/save'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/mark-as-removed'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/delete'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datachecker/run'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datacheckerdetail/list'),(select id from reference.acl_role where code='ADMIN'), 'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES ((select id from reference.acl_action where code = '/datacheckerdetail/delete'),(select id from reference.acl_role where code='ADMIN'), 'C');