INSERT INTO reference.acl_action (code,label,rec_st) VALUES ('/route/list-by-hrmainid/{hrMainId}','Lister les prises en charge/dépose d''un usager','C');

INSERT INTO reference.acl_roleaction (acl_action_id,acl_role_id,rec_st) VALUES
    (
    (select id from reference.acl_action where code = '/route/list-by-hrmainid/{hrMainId}'),
    (select id from reference.acl_role where code='USER'),
    'C');