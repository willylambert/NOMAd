INSERT INTO reference.user_main (login,passwd,firstname,lastname,domain,status_th,type_th,rec_st,lastconnection_dt) VALUES
    ('demo',crypt('demo',gen_salt('bf')::text),null,'Demo',null,
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_STATUS' and code ='ENABLED'),
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='ADMIN'),
    'C',null),
    ('cypress',crypt('cypress',gen_salt('bf')::text),null,'Cypress',null,
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_STATUS' and code ='ENABLED'),
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='ADMIN'),
    'C',1554710322),
    ('user',crypt('user',gen_salt('bf')::text),null,'User',null,
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_STATUS' and code ='ENABLED'),
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),
    'C',null),
    ('etab',crypt('etab',gen_salt('bf')::text),null,'Etab',null,
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_STATUS' and code ='ENABLED'),
    (select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='INSTITUTION'),
    'C',null);

INSERT INTO reference.acl_roleuser (user_main_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.user_main where login = 'demo'),
    (select id from reference.acl_role where code='ADMIN'),
    'C'),
    (
    (select id from reference.user_main where login = 'cypress'),
    (select id from reference.acl_role where code='ADMIN'),
    'C'),
    (
    (select id from reference.user_main where login = 'user'),
    (select id from reference.acl_role where code='USER'),
    'C'),
    (
    (select id from reference.user_main where login = 'etab'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access/{userId}/{actionCode}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access/{userId}/{actionCode}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/has-access/{userId}/{actionCode}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/aclaction/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aclrole/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aclrole/{id}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aclrole/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aclrole/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/{AOIId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/{AOIId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/aoi/{AOIId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/to-timestamp'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/to-timestamp'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/to-timestamp'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/update'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/calendar/update'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/{demandId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/{demandId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/{demandId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/demand/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/{groupId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/{groupId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/group/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/data/hrs'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/data/hrs'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/data/hr'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/logistics/demands'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/home/logistics/trip'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/{hrId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/{hrId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/{hrId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/update-durations'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/import/csv'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/map/access-token'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/map/access-token'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/map/access-token'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/institutions'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/institutions'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/transporters'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hrs'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hrs'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hrs'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/hr-drivers'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/vehicle-categories'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/vehicle-categories'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/users'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/users'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/acl'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/data/import'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/scenario'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/scenario'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/trip'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/demands'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/demands'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/demands'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/groups'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/logistics/groups'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/optim'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/menu/optim/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/default-params'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/{id}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/check'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/from-routes'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/from-scenario'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/stop'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/pause'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/process-fifo'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/optim/to-routes/{optimId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/list/transport'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/{POIId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/{POIId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/{POIId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/reverse-geocode'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/update-service-duration'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/update-acceptable-durations'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/update-acceptable-durations'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/acceptable-durations'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/acceptable-durations'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/acceptable-durations'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/poi/save-acceptable-durations'),
    (select id from reference.acl_role where code='ADMIN'),
    'C'); 
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/calendar'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/calendar'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/poi/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/poi/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/directions/{coordinates}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/directions/{coordinates}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/restore'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/minimap/{scenarioId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/minimap/{scenarioId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/{scenarioId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/{scenarioId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/duplicate'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/duplicate-route'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/calendar/copy'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/poi/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/poi/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/route/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/scenario/route/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/{siteId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/{siteId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/{siteId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/site/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/is-morning/{thesaurusId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/is-morning/{thesaurusId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/is-morning/{thesaurusId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/{thesaurusId}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/{thesaurusId}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/thesaurus/{thesaurusId}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/list'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/{id}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/{id}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/{id}'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/update-password'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/update-password'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/update-password'),
    (select id from reference.acl_role where code='USER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/user/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/list'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/list'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/{id}'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/{id}'),
    (select id from reference.acl_role where code='INSTITUTION'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/save'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/mark-as-removed'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/vehiclecategory/delete'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/hr/routes'),
    (select id from reference.acl_role where code='DRIVER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/insert-location'),
    (select id from reference.acl_role where code='DRIVER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/start'),
    (select id from reference.acl_role where code='DRIVER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/end'),
    (select id from reference.acl_role where code='DRIVER'),
    'C');
INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/visit'),
    (select id from reference.acl_role where code='DRIVER'),
    'C');
    












insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0f2e977c-cd33-11e8-8390-02efb7513225','LEBRUN',null,'Sonia','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('10dcdbb0-cd33-11e8-8456-02efb7513225','MARCHAL',null,'Herbert','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1117e3d6-cd33-11e8-8471-02efb7513225','WEBER',null,'Guillaume','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1137f810-cd33-11e8-8480-02efb7513225','MALLET',null,'Jean','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1179998c-cd33-11e8-849e-02efb7513225','HAMON',null,'Liloo','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0e35447e-cd33-11e8-8321-02efb7513225','BOULANGER',null,'Pierrot','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('12bd93e8-cd33-11e8-852e-02efb7513225','JACOB',null,'Tatiana','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('139edce0-cd33-11e8-8597-02efb7513225','MONNIER',null,'Sophie','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('14c86776-cd33-11e8-8621-02efb7513225','MICHAUD',null,'Marc','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1b852d92-cd33-11e8-8942-02efb7513225','RODRIGUEZ',null,'Jérôme','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1c797618-cd33-11e8-89b4-02efb7513225','GUICHARD',null,'Loudjoum','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1d1960ce-cd33-11e8-89ff-02efb7513225','GILLET',null,'Nathalie','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('1e8f2d4e-cd33-11e8-8aad-02efb7513225','SICARD',null,'Saïd','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0ea309b4-cd33-11e8-8351-02efb7513225','CHABO',null,'Boris','f2f27b0e-cbd5-11e8-9206-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0e3f42e4-cd33-11e8-8324-02efb7513225','VERTAUX',null,'John','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0e4c5560-cd33-11e8-832a-02efb7513225','POUIT',null,'Diana','f2f27b0e-cbd5-11e8-9206-02efb7513225','758502000','U','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0fd8ecd6-cd33-11e8-83de-02efb7513225','REBUT',null,'Christobal','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('12aa5be8-cd33-11e8-8525-02efb7513225','ETOP',null,'Vinh','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('12aa5be9-cd33-11e8-8525-02efb7513225','User',null,'user','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');

insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2a19a-db83-11e8-a85b-005056b71414','0f2e977c-cd33-11e8-8390-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2d76e-db83-11e8-a85b-005056b71414','10dcdbb0-cd33-11e8-8456-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2e3e4-db83-11e8-a85b-005056b71414','1117e3d6-cd33-11e8-8471-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2e9de-db83-11e8-a85b-005056b71414','1137f810-cd33-11e8-8480-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2f000-db83-11e8-a85b-005056b71414','1179998c-cd33-11e8-849e-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb2f208-db83-11e8-a85b-005056b71414','0e35447e-cd33-11e8-8321-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb30eaa-db83-11e8-a85b-005056b71414','12bd93e8-cd33-11e8-852e-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb34546-db83-11e8-a85b-005056b71414','139edce0-cd33-11e8-8597-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('efb37b1a-db83-11e8-a85b-005056b71414','14c86776-cd33-11e8-8621-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df41498-db84-11e8-a85b-005056b71414','1b852d92-cd33-11e8-8942-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df439be-db84-11e8-a85b-005056b71414','1c797618-cd33-11e8-89b4-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df44a12-db84-11e8-a85b-005056b71414','1d1960ce-cd33-11e8-89ff-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df481b2-db84-11e8-a85b-005056b71414','1e8f2d4e-cd33-11e8-8aad-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df56226-db84-11e8-a85b-005056b71414','0ea309b4-cd33-11e8-8351-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df56d98-db84-11e8-a85b-005056b71414','0e3f42e4-cd33-11e8-8324-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df56e60-db84-11e8-a85b-005056b71414','0e4c5560-cd33-11e8-832a-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df5817a-db84-11e8-a85b-005056b71414','0fd8ecd6-cd33-11e8-83de-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df5a812-db84-11e8-a85b-005056b71414','12aa5be8-cd33-11e8-8525-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('2df5a813-db84-11e8-a85b-005056b71414','12aa5be9-cd33-11e8-8525-02efb7513225',null,null,'f041ba72-d6da-11e8-96f7-02efb7513225','C');

insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('0fd8ecd6-cd33-11e8-83de-08efb7513225','RIPOL',null,'Edmond','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9a2-cc81-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('12aa5be8-cd33-11e8-8525-08efb7513225','LAZAQ',null,'Edwige','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9a2-cc81-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('12aa5be9-cd33-11e8-8525-08efb7513225','ROULE',null,'Christophe','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9a2-cc81-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');


insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0e35438e-cd33-11e8-831f-02efb7513225','KCOTX9F4',null,'Sonia',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0e3f4276-cd33-11e8-8322-02efb7513225','WKJCA340',null,'Herbert',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0e4c54de-cd33-11e8-8328-02efb7513225','IIVJ3FCK',null,'Guillaume',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0ea3093c-cd33-11e8-834f-02efb7513225','79DGG2WP',null,'Jean',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0f2e9704-cd33-11e8-838e-02efb7513225','OEA617MV',null,'Liloo',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('0fd8ec68-cd33-11e8-83dc-02efb7513225','6RYPW3IB',null,'Pierrot',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('10dcdb38-cd33-11e8-8454-02efb7513225','7UHY9AZB',null,'Tatiana',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1117e368-cd33-11e8-846f-02efb7513225','5A4MSH54',null,'Sophie',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1137f798-cd33-11e8-847e-02efb7513225','PO840Z4Y',null,'Marc',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1179990a-cd33-11e8-849c-02efb7513225','KWGQPE9T',null,'Jérôme',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('12aa5b70-cd33-11e8-8523-02efb7513225','0GHWT24U',null,'Loudjoum',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('12bd937a-cd33-11e8-852c-02efb7513225','9SOBRVL9',null,'Nathalie',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('139edc68-cd33-11e8-8595-02efb7513225','A8JYOCPS',null,'Saïd',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('14c86708-cd33-11e8-861f-02efb7513225','301FIBH9',null,'Boris',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1b852d2e-cd33-11e8-8940-02efb7513225','DW0517AP',null,'John',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1c7975aa-cd33-11e8-89b2-02efb7513225','FG45T7QI',null,'Diana',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1d19606a-cd33-11e8-89fd-02efb7513225','QY3BXHHB',null,'Christobal',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('1e8f2cea-cd33-11e8-8aab-02efb7513225','8B4C9CEX',null,'Vinh',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');

insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('631644a8-43ed-11e9-bfb5-005056b81987','0e35438e-cd33-11e8-831f-02efb7513225','0e35447e-cd33-11e8-8321-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('66a81c04-43ed-11e9-bfb6-005056b81987','0e3f4276-cd33-11e8-8322-02efb7513225','0e3f42e4-cd33-11e8-8324-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('6991c55a-43ed-11e9-bfb7-005056b81987','0e4c54de-cd33-11e8-8328-02efb7513225','0e4c5560-cd33-11e8-832a-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('6e9febda-43ed-11e9-bfb8-005056b81987','0ea3093c-cd33-11e8-834f-02efb7513225','0ea309b4-cd33-11e8-8351-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('7206fd72-43ed-11e9-bfb9-005056b81987','0f2e9704-cd33-11e8-838e-02efb7513225','0f2e977c-cd33-11e8-8390-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('74a71c88-43ed-11e9-bfba-005056b81987','0fd8ec68-cd33-11e8-83dc-02efb7513225','0fd8ecd6-cd33-11e8-83de-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('77f3eeb6-43ed-11e9-bfbb-005056b81987','10dcdb38-cd33-11e8-8454-02efb7513225','10dcdbb0-cd33-11e8-8456-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('7bb449b0-43ed-11e9-bfbc-005056b81987','1117e368-cd33-11e8-846f-02efb7513225','1117e3d6-cd33-11e8-8471-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('7ea0165e-43ed-11e9-bfbd-005056b81987','1137f798-cd33-11e8-847e-02efb7513225','1137f810-cd33-11e8-8480-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('815d8002-43ed-11e9-bfbe-005056b81987','1179990a-cd33-11e8-849c-02efb7513225','1179998c-cd33-11e8-849e-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('84007c92-43ed-11e9-bfbf-005056b81987','12aa5b70-cd33-11e8-8523-02efb7513225','12aa5be8-cd33-11e8-8525-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('87426dfc-43ed-11e9-bfc0-005056b81987','12bd937a-cd33-11e8-852c-02efb7513225','12bd93e8-cd33-11e8-852e-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('89eb3912-43ed-11e9-bfc1-005056b81987','139edc68-cd33-11e8-8595-02efb7513225','139edce0-cd33-11e8-8597-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('8d6884f0-43ed-11e9-bfc2-005056b81987','14c86708-cd33-11e8-861f-02efb7513225','14c86776-cd33-11e8-8621-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('914d3c00-43ed-11e9-bfc3-005056b81987','1b852d2e-cd33-11e8-8940-02efb7513225','1b852d92-cd33-11e8-8942-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('93dad068-43ed-11e9-bfc4-005056b81987','1c7975aa-cd33-11e8-89b2-02efb7513225','1c797618-cd33-11e8-89b4-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('964540f4-43ed-11e9-bfc5-005056b81987','1d19606a-cd33-11e8-89fd-02efb7513225','1d1960ce-cd33-11e8-89ff-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('98db55ec-43ed-11e9-bfc6-005056b81987','1e8f2cea-cd33-11e8-8aab-02efb7513225','1e8f2d4e-cd33-11e8-8aad-02efb7513225');

insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0e354456-cd33-11e8-8320-02efb7513225','U0001','Dharni',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0e3f42c6-cd33-11e8-8323-02efb7513225','U0002','Sounda',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0e4c5538-cd33-11e8-8329-02efb7513225','U0004','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','U');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0ea30996-cd33-11e8-8350-02efb7513225','U0017','Mehdy',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0f2e975e-cd33-11e8-838f-02efb7513225','U0038','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('0fd8ecb8-cd33-11e8-83dd-02efb7513225','U0064','Lylia',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('10dcdb92-cd33-11e8-8455-02efb7513225','U0104','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1117e3b8-cd33-11e8-8470-02efb7513225','U0113','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1137f7f2-cd33-11e8-847f-02efb7513225','U0118','Nathan',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('11799964-cd33-11e8-849d-02efb7513225','U0128','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('12aa5bca-cd33-11e8-8524-02efb7513225','U0173','Nadija',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('12bd93ca-cd33-11e8-852d-02efb7513225','U0176','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('139edcc2-cd33-11e8-8596-02efb7513225','U0211','Nathan',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('14c86758-cd33-11e8-8620-02efb7513225','U0257','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1b852d74-cd33-11e8-8941-02efb7513225','U0524','Nathan',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1c7975fa-cd33-11e8-89b3-02efb7513225','U0562','Nathan',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1d1960b0-cd33-11e8-89fe-02efb7513225','U0587','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('1e8f2d30-cd33-11e8-8aac-02efb7513225','U0645','Mohamed',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');

insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f13a9220-cbcf-11e8-bc64-02efb7513225','IME_Yves_Farge','IME Yves Farge',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f14756d6-cbcf-11e8-bc65-02efb7513225','IME_Villa_Henri_Salvat','IME Villa Henri Salvat',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f15400ac-cbcf-11e8-bc66-02efb7513225','IME_Val_de_Saone','IME Val de Saône',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f160a9ec-cbcf-11e8-bc67-02efb7513225','IME_Saint_Romme','IME Saint Romme',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f16d51ce-cbcf-11e8-bc68-02efb7513225','IME_Mathis_Jeune','IME Mathis Jeune',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f179fece-cbcf-11e8-bc69-02efb7513225','IME_Guy_Yver','IME Guy Yver',null,'039c36f2-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('5e9bbf8a-0ab2-11e9-ab14-d663bd873d93','Dede_Transports','Dédé transports',null,'039c36f3-cbc7-11e8-a9f5-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');

-- create a right for user (user) to access the data of Dharni MARTIN (HR) --
insert into reference.user_mainsite (id, user_main_id, site_main_id, rec_st) values ('5e9bbf8b-0ab2-11e9-ab14-d663bd873d93', (select id from reference.user_main where login='user'), 'f13a9220-cbcf-11e8-bc64-02efb7513225', 'C');
insert into reference.user_mainsite (id, user_main_id, site_main_id, rec_st) values ('5e9bbf8c-0ab2-11e9-ab14-d663bd873d93', (select id from reference.user_main where login='user'), '0e354456-cd33-11e8-8320-02efb7513225', 'C');

insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b500046-cbd2-11e8-bb54-02efb7513225','f160a9ec-cbcf-11e8-bc67-02efb7513225','1','IME Saint Romme','200 impasse du Château',null,'38940','Roybon','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'010100000024456458C5FB14404CA60A4625A14640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b5cfc1a-cbd2-11e8-bb55-02efb7513225','f16d51ce-cbcf-11e8-bc68-02efb7513225','1','IME Mathis Jeune','1 avenue du Docteur Serullaz',null,'69670','Vaugneray','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'0101000000A986FD9E58A71240DC12B9E00CDE4640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b294186-cbd2-11e8-bb51-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','1','IME Yves Farge','5 rue Jean Marie Merle',null,'69120','Vaulx-en-Velin','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'010100000081EA1F4432A413400954FF2092E34640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b35f976-cbd2-11e8-bb52-02efb7513225','f14756d6-cbcf-11e8-bc65-02efb7513225','1','IME Villa Henri Salvat','2 rue de la Damette',null,'69540','Irigny','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'0101000000562DE9280753134005871744A4D64640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b42deb6-cbd2-11e8-bb53-02efb7513225','f15400ac-cbcf-11e8-bc66-02efb7513225','1','IME Val de Saône','110 rue de la Croix des Hormes',null,'69250','Montanay','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'01010000008D093197547D1340B39AAE27BAF04640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b69c5bc-cbd2-11e8-bb56-02efb7513225','f179fece-cbcf-11e8-bc69-02efb7513225','1','IME Guy Yver','939 route de Tamié',null,'74210','Faverges-Seythenex','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'010100000008B0C8AF1F32194017838769DFDE4640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('8b69c5bd-cbd2-11e8-bb56-02efb7513225','5e9bbf8a-0ab2-11e9-ab14-d663bd873d93','1','Dépôt','Avenue du 11 Novembre 1918',null,'69110','Lyon','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'01010000000080C808992F13408489443736DE4640','C');

insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('2639afba-cd33-11e8-8ddf-02efb7513225','0ea30996-cd33-11e8-8350-02efb7513225','1','Domicile','19 boulevard des Etats Unis',null,'69008','Lyon','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.73613465646931,4.8621440231800195),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('2639d102-cd33-11e8-8df4-02efb7513225','0f2e975e-cd33-11e8-838f-02efb7513225','1','Domicile','40 chemin Pierre Dupont',null,'69120','Vaulx-en-Velin','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.77769020087431,4.91218355111779),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('2639fe48-cd33-11e8-8e0e-02efb7513225','0fd8ecb8-cd33-11e8-83dd-02efb7513225','1','Domicile','10 rue de la république',null,'69680','Chassieu','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.74062147803982,4.970563790447633),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263a7a3a-cd33-11e8-8e36-02efb7513225','10dcdb92-cd33-11e8-8455-02efb7513225','1','Domicile','32 rue Marcellin Berthelot',null,'69120','Vaulx-en-Velin','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.790181079211116,4.92434820253401),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263a8bc4-cd33-11e8-8e3f-02efb7513225','1117e3b8-cd33-11e8-8470-02efb7513225','1','Domicile','23 passage Aynard',null,'69003','Lyon','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.758239752132255,4.876647427694065),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263a9560-cd33-11e8-8e44-02efb7513225','1137f7f2-cd33-11e8-847f-02efb7513225','1','Domicile','26 rue gervais',null,'69100','Villeurbanne','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.77281274131936,4.869632395915677),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263aa492-cd33-11e8-8e4e-02efb7513225','11799964-cd33-11e8-849d-02efb7513225','1','Domicile','794 Rue Émile Zola',null,'69400','Villefranche-sur-Saône','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.983805384871935,4.731086534447986),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263af79e-cd33-11e8-8e7b-02efb7513225','12aa5bca-cd33-11e8-8524-02efb7513225','1','Domicile','23 Chemin de Fond Rose',null,'69300','Caluire-et-Cuire','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.79139946547999,4.827044530976354),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263aff14-cd33-11e8-8e7e-02efb7513225','12bd93ca-cd33-11e8-852d-02efb7513225','1','Domicile','1 rue Favier',null,'69120','Vaulx-en-Velin','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.7838691,4.9114102),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263b3b0a-cd33-11e8-8ea1-02efb7513225','139edcc2-cd33-11e8-8596-02efb7513225','1','Domicile','28 avenue de l''Europe',null,'69140','Rillieux-la-Pape','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.81382417520972,4.895077538008108),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('2641f10c-cd33-11e8-8ecf-02efb7513225','14c86758-cd33-11e8-8620-02efb7513225','1','Domicile',null,null,null,null,'0716a812-cbc7-11e8-a9f6-02efb7513225',null,null,'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('264aab76-cd33-11e8-8fda-02efb7513225','1b852d74-cd33-11e8-8941-02efb7513225','1','Domicile','allée des airelles',null,'38340','Voreppe','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.287979495044674,5.644453304641748),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('264aeece-cd33-11e8-9000-02efb7513225','1c7975fa-cd33-11e8-89b3-02efb7513225','1','Domicile','20 Chemin du Fayet',null,'26260','Margès','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.14398951098836,5.043338338404237),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('264b51b6-cd33-11e8-9019-02efb7513225','1d1960b0-cd33-11e8-89fe-02efb7513225','1','Domicile','4, place Boileau',null,'69140','Rillieux-la-Pape','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.81223415598011,4.889071227494197),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('264bcc72-cd33-11e8-9053-02efb7513225','1e8f2d30-cd33-11e8-8aac-02efb7513225','1','Domicile',null,null,null,null,'0716a812-cbc7-11e8-a9f6-02efb7513225',null,null,'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('263971d0-cd33-11e8-8dcf-02efb7513225','0e354456-cd33-11e8-8320-02efb7513225','1','Domicile','570 rue Beer Sheva',null,'69009','Lyon','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.78826265123734,4.792377239002015),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('26398648-cd33-11e8-8dd0-02efb7513225','0e3f42c6-cd33-11e8-8323-02efb7513225','1','Domicile','5 avenue Général Leclerc',null,'69140','Rillieux-la-Pape','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.814232469312664,4.9041683690666416),'C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('26399386-cd33-11e8-8dd2-02efb7513225','0e4c5538-cd33-11e8-8329-02efb7513225','1','Domicile','17 rue Marcel Bramet',null,'69500','Bron','0716a812-cbc7-11e8-a9f6-02efb7513225',null,ST_MakePoint(45.74516291084375,4.924750162829938),'C');


insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266d4104-cd33-11e8-915f-02efb7513225','0e35447e-cd33-11e8-8321-02efb7513225','0e354456-cd33-11e8-8320-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266d5ed2-cd33-11e8-9160-02efb7513225','0e3f42e4-cd33-11e8-8324-02efb7513225','0e3f42c6-cd33-11e8-8323-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266d6f26-cd33-11e8-9162-02efb7513225','0e4c5560-cd33-11e8-832a-02efb7513225','0e4c5538-cd33-11e8-8329-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266d96fe-cd33-11e8-916f-02efb7513225','0ea309b4-cd33-11e8-8351-02efb7513225','0ea30996-cd33-11e8-8350-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266dc250-cd33-11e8-9184-02efb7513225','0f2e977c-cd33-11e8-8390-02efb7513225','0f2e975e-cd33-11e8-838f-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266df6da-cd33-11e8-919e-02efb7513225','0fd8ecd6-cd33-11e8-83de-02efb7513225','0fd8ecb8-cd33-11e8-83dd-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266e5c1a-cd33-11e8-91c6-02efb7513225','10dcdbb0-cd33-11e8-8456-02efb7513225','10dcdb92-cd33-11e8-8455-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266e6dea-cd33-11e8-91cf-02efb7513225','1117e3d6-cd33-11e8-8471-02efb7513225','1117e3b8-cd33-11e8-8470-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266e7718-cd33-11e8-91d4-02efb7513225','1137f810-cd33-11e8-8480-02efb7513225','1137f7f2-cd33-11e8-847f-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266e8e74-cd33-11e8-91de-02efb7513225','1179998c-cd33-11e8-849e-02efb7513225','11799964-cd33-11e8-849d-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266ef06c-cd33-11e8-920b-02efb7513225','12aa5be8-cd33-11e8-8525-02efb7513225','12aa5bca-cd33-11e8-8524-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266ef602-cd33-11e8-920e-02efb7513225','12bd93e8-cd33-11e8-852e-02efb7513225','12bd93ca-cd33-11e8-852d-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('266f39e6-cd33-11e8-9231-02efb7513225','139edce0-cd33-11e8-8597-02efb7513225','139edcc2-cd33-11e8-8596-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('267624f4-cd33-11e8-925f-02efb7513225','14c86776-cd33-11e8-8621-02efb7513225','14c86758-cd33-11e8-8620-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('267f3936-cd33-11e8-936a-02efb7513225','1b852d92-cd33-11e8-8942-02efb7513225','1b852d74-cd33-11e8-8941-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('267f862a-cd33-11e8-9390-02efb7513225','1c797618-cd33-11e8-89b4-02efb7513225','1c7975fa-cd33-11e8-89b3-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('267fbca8-cd33-11e8-93a9-02efb7513225','1d1960ce-cd33-11e8-89ff-02efb7513225','1d1960b0-cd33-11e8-89fe-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('2680418c-cd33-11e8-93e3-02efb7513225','1e8f2d4e-cd33-11e8-8aad-02efb7513225','1e8f2d30-cd33-11e8-8aac-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cbe664-cd33-11e8-94ef-02efb7513225','0e35447e-cd33-11e8-8321-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cbef6a-cd33-11e8-94f0-02efb7513225','0e3f42e4-cd33-11e8-8324-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cbf6f4-cd33-11e8-94f2-02efb7513225','0e4c5560-cd33-11e8-832a-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cc192c-cd33-11e8-94ff-02efb7513225','0ea309b4-cd33-11e8-8351-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cc40dc-cd33-11e8-9514-02efb7513225','0f2e977c-cd33-11e8-8390-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cc75ac-cd33-11e8-952e-02efb7513225','0fd8ecd6-cd33-11e8-83de-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26ccd4f2-cd33-11e8-9556-02efb7513225','10dcdbb0-cd33-11e8-8456-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cce5dc-cd33-11e8-955f-02efb7513225','1117e3d6-cd33-11e8-8471-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26ccf004-cd33-11e8-9564-02efb7513225','1137f810-cd33-11e8-8480-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cd026a-cd33-11e8-956e-02efb7513225','1179998c-cd33-11e8-849e-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cd653e-cd33-11e8-959b-02efb7513225','12aa5be8-cd33-11e8-8525-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cd6ade-cd33-11e8-959e-02efb7513225','12bd93e8-cd33-11e8-852e-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26cdad50-cd33-11e8-95c1-02efb7513225','139edce0-cd33-11e8-8597-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26d4f4ca-cd33-11e8-95ef-02efb7513225','14c86776-cd33-11e8-8621-02efb7513225','f13a9220-cbcf-11e8-bc64-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26dd9fbc-cd33-11e8-96fa-02efb7513225','1b852d92-cd33-11e8-8942-02efb7513225','f160a9ec-cbcf-11e8-bc67-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26de0eb6-cd33-11e8-9720-02efb7513225','1c797618-cd33-11e8-89b4-02efb7513225','f160a9ec-cbcf-11e8-bc67-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26de50c4-cd33-11e8-9739-02efb7513225','1d1960ce-cd33-11e8-89ff-02efb7513225','f16d51ce-cbcf-11e8-bc68-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26ded210-cd33-11e8-9773-02efb7513225','1e8f2d4e-cd33-11e8-8aad-02efb7513225','f16d51ce-cbcf-11e8-bc68-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');


insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26de0eb6-cd33-11ef-9750-02efb7513225','0fd8ecd6-cd33-11e8-83de-08efb7513225','5e9bbf8a-0ab2-11e9-ab14-d663bd873d93','76d416ca-cc6d-11e4-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26de50c4-cd33-11ef-9759-02efb7513225','12aa5be8-cd33-11e8-8525-08efb7513225','5e9bbf8a-0ab2-11e9-ab14-d663bd873d93','76d416ca-cc6d-11e4-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('26ded210-cd33-11ef-9753-02efb7513225','12aa5be9-cd33-11e8-8525-08efb7513225','5e9bbf8a-0ab2-11e9-ab14-d663bd873d93','76d416ca-cc6d-11e4-90f9-02efb7513225','C');


insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('97c61e34-ce19-11e8-9766-02efb7513225','VAN1','VAN1',null,null,'9.1300001','23.8104','0.12','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('97d5a61a-ce19-11e8-9768-02efb7513225','VAN2','VAN2',null,null,'10.9','23.8104','0.12','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('97e32f10-ce19-11e8-976a-02efb7513225','VAN3','VAN3',null,null,'14.82','23.8104','0.14','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('97f171d8-ce19-11e8-976c-02efb7513225','VAN4','VAN4',null,null,'19.65','26.190001','0.22','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('9800d7ea-ce19-11e8-976e-02efb7513225','VAN5','VAN5',null,null,'34.5','26.190001','0.23999999','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('98101372-ce19-11e8-9770-02efb7513225','VAN6','VAN6',null,null,'15.28','23.8104','0.12','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('981ed740-ce19-11e8-9772-02efb7513225','VAN7','VAN7',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('982d9320-ce19-11e8-9774-02efb7513225','VAN8','VAN8',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('983d6d2c-ce19-11e8-9776-02efb7513225','VAN9','VAN9',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('984b3934-ce19-11e8-9778-02efb7513225','VAN10','VAN10',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('9858b348-ce19-11e8-977a-02efb7513225','VAN11','VAN11',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('9865bd2c-ce19-11e8-977c-02efb7513225','VAN12','VAN12',null,null,'20.93','23.8104','0.17','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('9872f870-ce19-11e8-977e-02efb7513225','VAN13','VAN13',null,null,'26.190001','23.8104','0.20999999','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('9886d188-ce19-11e8-9781-02efb7513225','VAN14','VAN14',null,null,'12','23.8104','0.12','150','C');
insert into reference.vehicle_category (id, code, label, axles_count, fuel_consumption, daily_cost, hourly_cost, kilometric_cost, co2_quantity, rec_st) values ('989b06f8-ce19-11e8-9784-02efb7513225','VAN15','VAN15',null,null,'20.93','23.8104','0.17','150','C');

insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('97ce7afc-ce19-11e8-9767-02efb7513225','VAN1-1','VAN1-1','97c61e34-ce19-11e8-9766-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('97dbe7fa-ce19-11e8-9769-02efb7513225','VAN2-1','VAN2-1','97d5a61a-ce19-11e8-9768-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('97e981bc-ce19-11e8-976b-02efb7513225','VAN3-1','VAN3-1','97e32f10-ce19-11e8-976a-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('97f8ea30-ce19-11e8-976d-02efb7513225','VAN4-1','VAN4-1','97f171d8-ce19-11e8-976c-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98072942-ce19-11e8-976f-02efb7513225','VAN5-1','VAN5-1','9800d7ea-ce19-11e8-976e-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('9816c64a-ce19-11e8-9771-02efb7513225','VAN6-1','VAN6-1','98101372-ce19-11e8-9770-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98253978-ce19-11e8-9773-02efb7513225','VAN7-1','VAN7-1','981ed740-ce19-11e8-9772-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('9834d126-ce19-11e8-9775-02efb7513225','VAN8-1','VAN8-1','982d9320-ce19-11e8-9774-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('9843c12c-ce19-11e8-9777-02efb7513225','VAN9-1','VAN9-1','983d6d2c-ce19-11e8-9776-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('985192b6-ce19-11e8-9779-02efb7513225','VAN10-1','VAN10-1','984b3934-ce19-11e8-9778-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('985efd3e-ce19-11e8-977b-02efb7513225','VAN11-1','VAN11-1','9858b348-ce19-11e8-977a-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('986c1b40-ce19-11e8-977d-02efb7513225','VAN12-1','VAN12-1','9865bd2c-ce19-11e8-977c-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98793bfe-ce19-11e8-977f-02efb7513225','VAN13-1','VAN13-1','9872f870-ce19-11e8-977e-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('987fb97a-ce19-11e8-9780-02efb7513225','VAN13-2','VAN13-2','9872f870-ce19-11e8-977e-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('988d3956-ce19-11e8-9782-02efb7513225','VAN14-1','VAN14-1','9886d188-ce19-11e8-9781-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98938e82-ce19-11e8-9783-02efb7513225','VAN14-2','VAN14-2','9886d188-ce19-11e8-9781-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98a14f54-ce19-11e8-9785-02efb7513225','VAN15-1','VAN15-1','989b06f8-ce19-11e8-9784-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98a79f30-ce19-11e8-9786-02efb7513225','VAN15-2','VAN15-2','989b06f8-ce19-11e8-9784-02efb7513225','C');
insert into reference.vehicle_configuration (id, code, label, vehicle_category_id, rec_st) values ('98addc60-ce19-11e8-9787-02efb7513225','VAN15-3','VAN15-3','989b06f8-ce19-11e8-9784-02efb7513225','C');

insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9cfb7228-ce19-11e8-97ad-02efb7513225','988d3956-ce19-11e8-9782-02efb7513225','2','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d0838be-ce19-11e8-97ae-02efb7513225','988d3956-ce19-11e8-9782-02efb7513225','1','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d14d862-ce19-11e8-97af-02efb7513225','98938e82-ce19-11e8-9783-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d217464-ce19-11e8-97b0-02efb7513225','98a14f54-ce19-11e8-9785-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d2e07b0-ce19-11e8-97b1-02efb7513225','98a14f54-ce19-11e8-9785-02efb7513225','3','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d3ab230-ce19-11e8-97b2-02efb7513225','98a79f30-ce19-11e8-9786-02efb7513225','6','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d476098-ce19-11e8-97b3-02efb7513225','98a79f30-ce19-11e8-9786-02efb7513225','2','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d5428f0-ce19-11e8-97b4-02efb7513225','98addc60-ce19-11e8-9787-02efb7513225','7','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9d60d6ea-ce19-11e8-97b5-02efb7513225','98addc60-ce19-11e8-9787-02efb7513225','1','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9be4d546-ce19-11e8-9797-02efb7513225','97ce7afc-ce19-11e8-9767-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9bf1a6ae-ce19-11e8-9798-02efb7513225','97dbe7fa-ce19-11e8-9769-02efb7513225','6','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9bfe69ac-ce19-11e8-9799-02efb7513225','97e981bc-ce19-11e8-976b-02efb7513225','8','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c0b0bee-ce19-11e8-979a-02efb7513225','97f8ea30-ce19-11e8-976d-02efb7513225','16','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c17b718-ce19-11e8-979b-02efb7513225','98072942-ce19-11e8-976f-02efb7513225','22','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c245e78-ce19-11e8-979c-02efb7513225','9816c64a-ce19-11e8-9771-02efb7513225','5','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c3122a2-ce19-11e8-979d-02efb7513225','9816c64a-ce19-11e8-9771-02efb7513225','1','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c3dc44e-ce19-11e8-979e-02efb7513225','98253978-ce19-11e8-9773-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c4a5f10-ce19-11e8-979f-02efb7513225','98253978-ce19-11e8-9773-02efb7513225','3','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c56f752-ce19-11e8-97a0-02efb7513225','9834d126-ce19-11e8-9775-02efb7513225','7','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c63a650-ce19-11e8-97a1-02efb7513225','9834d126-ce19-11e8-9775-02efb7513225','1','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c7033e8-ce19-11e8-97a2-02efb7513225','9843c12c-ce19-11e8-9777-02efb7513225','3','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c7cfa56-ce19-11e8-97a3-02efb7513225','9843c12c-ce19-11e8-9777-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c89a09e-ce19-11e8-97a4-02efb7513225','985192b6-ce19-11e8-9779-02efb7513225','6','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9c964b32-ce19-11e8-97a5-02efb7513225','985192b6-ce19-11e8-9779-02efb7513225','2','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9ca2ecf2-ce19-11e8-97a6-02efb7513225','985efd3e-ce19-11e8-977b-02efb7513225','2','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9caf62d4-ce19-11e8-97a7-02efb7513225','985efd3e-ce19-11e8-977b-02efb7513225','3','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9cbc0980-ce19-11e8-97a8-02efb7513225','986c1b40-ce19-11e8-977d-02efb7513225','9','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9cc8c562-ce19-11e8-97a9-02efb7513225','98793bfe-ce19-11e8-977f-02efb7513225','3','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9cd57636-ce19-11e8-97aa-02efb7513225','98793bfe-ce19-11e8-977f-02efb7513225','5','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9ce21dbe-ce19-11e8-97ab-02efb7513225','987fb97a-ce19-11e8-9780-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','de9aa520-cdf4-11e8-9ab5-02efb7513225','C');
insert into reference.vehicle_capacity (id, vehicle_configuration_id, quantity, unit_th, transported_th, rec_st) values ('9ceeb3bc-ce19-11e8-97ac-02efb7513225','987fb97a-ce19-11e8-9780-02efb7513225','4','de5a6dca-cdf4-11e8-9ab4-02efb7513225','ded39010-cdf4-11e8-9ab6-02efb7513225','C');

/******************************************************************************************************************************************************************************/
/*   EXAMPLE FOR TRANSPORT TABLE     */
/******************************************************************************************************************************************************************************/


insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('b0980cfe-d866-11e8-8798-02efb7513225','LOZOFF',null,'Sophie','f2f27b0e-cbd5-11e8-9206-02efb7513225','758502000','U','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('b0ce8824-d866-11e8-8799-02efb7513225','ASSAIN',null,'Marc','f2f27b0e-cbd5-11e8-9206-02efb7513225','758502000','U','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('b0ee3566-d866-11e8-879a-02efb7513225','DUPONT',null,'Roger','f2f27b0e-cbd5-11e8-9206-02efb7513225','758502000','U','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');
insert into reference.hr_main (id, lastname, lastnamemaiden, firstname, gender_th, birthday_dt, rec_st, type_th, status_th) values ('b0fe0e46-d866-11e8-879b-02efb7513225','TETOU',null,'Léo','f2e30322-cbd5-11e8-9205-02efb7513225',null,'C','a0b5f9e2-cc61-11e8-90f7-02efb7513225','58e68176-cbd6-11e8-9207-02efb7513225');

insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('6bb4b662-77af-11e9-8f9e-2a86e4085a59','b0980cfe-d866-11e8-8798-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('6bb4b663-77af-11e9-8f9e-2a86e4085a59','b0ce8824-d866-11e8-8799-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('6bb4b664-77af-11e9-8f9e-2a86e4085a59','b0ee3566-d866-11e8-879a-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');
insert into reference.hr_maindetail (id, hr_main_id, crisis_risk, specific_arrangement, transportmode_th, rec_st) values ('6bb4b665-77af-11e9-8f9e-2a86e4085a59','b0fe0e46-d866-11e8-879b-02efb7513225',null,null,'f0591ffa-d6da-11e8-96f8-02efb7513225','C');

insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('2b970c0c-d867-11e8-879c-02efb7513225','b0980cfe-d866-11e8-8798-02efb7513225','f15400ac-cbcf-11e8-bc66-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('2ba65d9c-d867-11e8-879d-02efb7513225','b0ce8824-d866-11e8-8799-02efb7513225','f15400ac-cbcf-11e8-bc66-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('2bb52822-d867-11e8-879e-02efb7513225','b0ee3566-d866-11e8-879a-02efb7513225','f15400ac-cbcf-11e8-bc66-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('2bc6f098-d867-11e8-879f-02efb7513225','b0fe0e46-d866-11e8-879b-02efb7513225','f15400ac-cbcf-11e8-bc66-02efb7513225','76d416ca-cc6d-11e8-90f9-02efb7513225','C');

insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('fe7faba8-d8fb-11e8-9237-02efb7513225','U0913','Sophie',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f4e71248-d8fb-11e8-9234-02efb7513225','U0914','Marc',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f62fa0f2-d8fb-11e8-9235-02efb7513225','U0915','Roger',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');
insert into reference.site_main (id, code, label, site_main_id_entity, type_th, status_th, rec_st) values ('f753e0e2-d8fb-11e8-9236-02efb7513225','U0916','Léo',null,'0436ceae-cc6e-11e8-90fa-02efb7513225','f88cba04-cbc9-11e8-a9fa-02efb7513225','C');

insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('59087596-db95-11e8-a85b-005056b71414','b0980cfe-d866-11e8-8798-02efb7513225','fe7faba8-d8fb-11e8-9237-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('3b750122-db98-11e8-9a07-02efb7513225','b0ce8824-d866-11e8-8799-02efb7513225','f4e71248-d8fb-11e8-9234-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('3efd6474-db98-11e8-9a08-02efb7513225','b0ee3566-d866-11e8-879a-02efb7513225','f62fa0f2-d8fb-11e8-9235-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');
insert into reference.hr_mainsite (id, hr_main_id, site_main_id, type_th, rec_st) values ('41a480fe-db98-11e8-9a09-02efb7513225','b0fe0e46-d866-11e8-879b-02efb7513225','f753e0e2-d8fb-11e8-9236-02efb7513225','7698b882-cc6d-11e8-90f8-02efb7513225','C');

insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('6713395a-db95-11e8-a85b-005056b71414','fe7faba8-d8fb-11e8-9237-02efb7513225','1','Point de rdv','Rue du Stade Pierre Montmartin','Arrêt Croix Fleuri','69400','Gleizé','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'0101000000010000A6C3DD12403E9FEFF83A004740','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('ec005314-db95-11e8-a85b-005056b71414','f4e71248-d8fb-11e8-9234-02efb7513225','1','Point de rdv','Croisement rue de Port Masson et D51','','69650','Quincieux ','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'0101000000010000F0313413404E5F0AE9F0F24640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('fa0523ea-db95-11e8-a85b-005056b71414','f62fa0f2-d8fb-11e8-9235-02efb7513225','1','Domicile','Chemin du Cruy','','69250','Poleymieux-au-Mont-d''Or','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'01010000000000004626351340EA6437B8B5ED4640','C');
insert into reference.site_poi (id, site_main_id, position, label, addr1, addr2, postcode, city, country_th, type_th, geom, rec_st) values ('fd645434-db95-11e8-a85b-005056b71414','f753e0e2-d8fb-11e8-9236-02efb7513225','1','Domicile','Allée des Tamaris','','69250','Albigny-sur-Saône','0716a812-cbc7-11e8-a9f6-02efb7513225',null,'010100000001000046C24D13408C29400137EF4640','C');

insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('a1e068b4-5103-4418-94a3-a2cbb0790337','RER48REZ',null,'Sophie',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('a1e068b5-5103-4418-94a3-a2cbb0790337','TO4KI78G',null,'Marc',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('a1e068b6-5103-4418-94a3-a2cbb0790337','7TZOPQW9',null,'Roger',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');
insert into reference.user_main (id, login, passwd, firstname, lastname, domain, status_th, type_th, rec_st) values ('a1e068b7-5103-4418-94a3-a2cbb0790337','74GM5CV6',null,'Léo',null,null,'efce9a2a-cbc6-11e8-a9f2-02efb7513225',(select id from reference.util_thesaurus where cat = 'USER_MAIN_TYPE' and code ='CLIENT'),'C');

insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('817da7bd-9349-4590-9925-95db0d0f4b3f','a1e068b4-5103-4418-94a3-a2cbb0790337','b0980cfe-d866-11e8-8798-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('817da7be-9349-4590-9925-95db0d0f4b3f','a1e068b5-5103-4418-94a3-a2cbb0790337','b0ce8824-d866-11e8-8799-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('817da7bf-9349-4590-9925-95db0d0f4b3f','a1e068b6-5103-4418-94a3-a2cbb0790337','b0ee3566-d866-11e8-879a-02efb7513225');
insert into reference.user_mainhr (id, user_main_id, hr_main_id) values ('817da7c0-9349-4590-9925-95db0d0f4b3f','a1e068b7-5103-4418-94a3-a2cbb0790337','b0fe0e46-d866-11e8-879b-02efb7513225');

insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
  values ( '2c0f5bcc-db8b-11e8-a85b-005056b71414', '8b42deb6-cbd2-11e8-bb53-02efb7513225', '6713395a-db95-11e8-a85b-005056b71414', 'b0980cfe-d866-11e8-8798-02efb7513225' , 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th) values ( '2c0f5bcc-db8b-11e8-a85b-005056b71414', '747769be-d860-11e8-b443-02efb7513225') ;
insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
  values ( 'fc10a2d8-dc2e-11e8-a2f3-005056b71414', '8b42deb6-cbd2-11e8-bb53-02efb7513225', 'ec005314-db95-11e8-a85b-005056b71414', 'b0ce8824-d866-11e8-8799-02efb7513225' , 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th) values ( 'fc10a2d8-dc2e-11e8-a2f3-005056b71414', '747769be-d860-11e8-b443-02efb7513225') ;
insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
  values ( '06b141fc-dc2f-11e8-a2f3-005056b71414', '8b42deb6-cbd2-11e8-bb53-02efb7513225', 'fa0523ea-db95-11e8-a85b-005056b71414', 'b0ee3566-d866-11e8-879a-02efb7513225' , 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th) values ( '06b141fc-dc2f-11e8-a2f3-005056b71414', '747769be-d860-11e8-b443-02efb7513225') ;
insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
  values ( '0f4f0e5c-dc2f-11e8-a2f3-005056b71414', '8b42deb6-cbd2-11e8-bb53-02efb7513225', 'fd645434-db95-11e8-a85b-005056b71414', 'b0fe0e46-d866-11e8-879b-02efb7513225' , 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th) values ( '0f4f0e5c-dc2f-11e8-a2f3-005056b71414', '747769be-d860-11e8-b443-02efb7513225') ;
insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
    values ( 'e85a1678-1254-11e9-bb1d-0242ac120002', '8b294186-cbd2-11e8-bb51-02efb7513225', '26398648-cd33-11e8-8dd0-02efb7513225', '0e3f42e4-cd33-11e8-8324-02efb7513225', 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th, start_hr, end_hr) values ( 'e85a1678-1254-11e9-bb1d-0242ac120002', '747769be-d860-11e8-b443-02efb7513225', 28800, 43200);
insert into reference.transport_demand (id, site_poi_id_institution, site_poi_id_hr, hr_main_id, start_dt, end_dt)
    values ( '9ecdad80-1268-11e9-81f3-0242ac120002', '8b294186-cbd2-11e8-bb51-02efb7513225', '2639afba-cd33-11e8-8ddf-02efb7513225', '0ea309b4-cd33-11e8-8351-02efb7513225', 1539475200, 1540944000);
insert into reference.transport_demandtime (transport_demand_id, timeslot_th, start_hr, end_hr) values ( '9ecdad80-1268-11e9-81f3-0242ac120002', '747769be-d860-11e8-b443-02efb7513225', 28800, 43200);

insert into reference.transport_route (id, code, label, date_dt, timeslot_th) values ('5338cfe0-dc1b-11e8-b92a-02efb7513225', 'R0001', 'route numéro 1', 1539554400, '747769be-d860-11e8-b443-02efb7513225');

insert into reference.transport_routesitepoi (id, transport_route_id, transport_demand_id, site_poi_id, hr_main_id)
  values ('71f1277a-dc2f-11e8-a2f3-005056b71414', '5338cfe0-dc1b-11e8-b92a-02efb7513225', null, '8b42deb6-cbd2-11e8-bb53-02efb7513225', null) ;
insert into reference.transport_routesitepoi (id, transport_route_id, transport_demand_id, site_poi_id, hr_main_id)
  values ('77a5194c-dc2f-11e8-a2f3-005056b71414', '5338cfe0-dc1b-11e8-b92a-02efb7513225', '2c0f5bcc-db8b-11e8-a85b-005056b71414', '6713395a-db95-11e8-a85b-005056b71414', 'b0980cfe-d866-11e8-8798-02efb7513225') ;
insert into reference.transport_routesitepoi (id, transport_route_id, transport_demand_id, site_poi_id, hr_main_id)
  values ('7af8c396-dc2f-11e8-a2f3-005056b71414', '5338cfe0-dc1b-11e8-b92a-02efb7513225', 'fc10a2d8-dc2e-11e8-a2f3-005056b71414', 'ec005314-db95-11e8-a85b-005056b71414', 'b0ce8824-d866-11e8-8799-02efb7513225') ;
insert into reference.transport_routesitepoi (id, transport_route_id, transport_demand_id, site_poi_id, hr_main_id)
  values ('7e237be2-dc2f-11e8-a2f3-005056b71414', '5338cfe0-dc1b-11e8-b92a-02efb7513225', '06b141fc-dc2f-11e8-a2f3-005056b71414', 'fa0523ea-db95-11e8-a85b-005056b71414', 'b0ee3566-d866-11e8-879a-02efb7513225') ;
insert into reference.transport_routesitepoi (id, transport_route_id, transport_demand_id, site_poi_id, hr_main_id)
  values ('812d66ae-dc2f-11e8-a2f3-005056b71414', '5338cfe0-dc1b-11e8-b92a-02efb7513225', '0f4f0e5c-dc2f-11e8-a2f3-005056b71414', 'fd645434-db95-11e8-a85b-005056b71414', 'b0fe0e46-d866-11e8-879b-02efb7513225') ;

/******************************************************************************************************************************************************************************/
/*   END : EXAMPLE FOR TRANSPORT TABLE     */
/******************************************************************************************************************************************************************************/

insert into reference.scenario_main (code,label,status_th,start_dt,end_dt) values ('test','test','f0591ffb-d6da-11e8-96f8-02efb7513225',1566864000,1566950400);
insert into reference.transport_group (id, label) values ('812d66af-dc2f-11e8-a2f3-005056b71414','test');
insert into reference.transport_groupdemand (transport_demand_id, transport_group_id) values ('2c0f5bcc-db8b-11e8-a85b-005056b71414','812d66af-dc2f-11e8-a2f3-005056b71414')
