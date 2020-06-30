-- creation of a user type corresponding to transport organizer
insert into reference.util_thesaurus (id, cat, code, label, rec_st) values ('efddab0e-cbc7-11e8-a9f5-02efb7513225','USER_MAIN_TYPE','TRANSPORT_ORGANIZER','Autorité organisatrice de transports','C');

-- creation of a user role corresponding to transport organizer
INSERT INTO reference.acl_role (code,label,rec_st) VALUES ('TRANSPORT_ORGANIZER', 'Autorité organisatrice de transports', 'C');

INSERT INTO reference.user_main (login,passwd,firstname,lastname,domain,status_th,type_th,rec_st,lastconnection_dt) VALUES
    ('transport_organizer',crypt('transport_organizer',gen_salt('bf')::text),'Transport','Organizer',null,
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_STATUS' and code ='ENABLED'),
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='TRANSPORT_ORGANIZER'),
    'C',null);  

INSERT INTO reference.acl_roleuser (user_main_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.user_main where login = 'transport_organizer'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');

-- association between actions and roles
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access/{userId}/{actionCode}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/{AOIId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/to-timestamp'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/update'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/{demandId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/{groupId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/data/hrs'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/logistics/demands'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/{hrId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/update-durations'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/map/access-token'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/institutions'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/transporters'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hrs'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hr-drivers'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/vehicle-categories'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/users'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/scenario'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/demands'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/groups'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/optim'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/optim/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/default-params'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/{id}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/check'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/from-routes'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/from-scenario'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/stop'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/pause'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/process-fifo'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/to-routes/{optimId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list/transport'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/{POIId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/reverse-geocode'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/update-service-duration'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/update-acceptable-durations'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/acceptable-durations'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/save-acceptable-durations'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');    
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/calendar'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/poi/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/directions/{coordinates}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/restore'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/minimap/{scenarioId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/{scenarioId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/duplicate'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/duplicate-route'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/calendar/copy'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/calendar/update'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/poi/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/route/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/{siteId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/is-morning/{thesaurusId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/{thesaurusId}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/{id}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/update-password'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/list'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/{id}'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/save'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/mark-as-removed'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');