INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/menu/dashboard','Afficher les tableaux de bords','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/menu/dashboard'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/menu/dashboard'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');

INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/dashboard/scenario-date-range','Recupérer un tableau de bord','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/dashboard/scenario-date-range'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/dashboard/scenario-date-range'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');

INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/calendar/set-status','Mise à jour du statut','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/calendar/set-status'),
    (select id from reference.acl_role where code='TRANSPORT_ORGANIZER'),
    'C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES (
    (select id from reference.acl_action where code = '/calendar/set-status'),
    (select id from reference.acl_role where code='ADMIN'),
    'C');    

ALTER TABLE reference.transport_route ADD cost real;
COMMENT ON COLUMN reference.transport_route.cost IS 'Cost in Euros';

ALTER TABLE reference.transport_route ADD co2 real;
COMMENT ON COLUMN reference.transport_route.co2 IS 'CO2 emissions in mg';