CREATE SCHEMA reference;

-- object: reference.util_thesaurus | type: TABLE --
-- DROP TABLE IF EXISTS reference.util_thesaurus CASCADE;
CREATE TABLE reference.util_thesaurus(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  cat text NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  orderdisplay integer,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_thesaurus_PK" PRIMARY KEY (id),
  CONSTRAINT "site_thesaurus_UN" UNIQUE (cat,code)

);
COMMENT ON TABLE reference.util_thesaurus IS 'thesaurus';
COMMENT ON COLUMN reference.util_thesaurus.id IS 'util_thesaurus : PK';
COMMENT ON COLUMN reference.util_thesaurus.cat IS 'category';
COMMENT ON COLUMN reference.util_thesaurus.code IS 'code';
COMMENT ON COLUMN reference.util_thesaurus.label IS 'label';
COMMENT ON COLUMN reference.util_thesaurus.orderdisplay IS 'order of display';
COMMENT ON COLUMN reference.util_thesaurus.rec_st IS 'Record status';
ALTER TABLE reference.util_thesaurus OWNER TO postgres;


-- object: reference.hr_main | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_main CASCADE;
CREATE TABLE reference.hr_main(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  lastname text,
  lastnamemaiden text,
  firstname text,
  gender_th uuid,
  identifiantldap text,
  birthday_dt integer,
  type_th uuid NOT NULL,
  status_th uuid,
  notice_delay integer,
  notify_yn text,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_main_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.hr_main IS 'list of employee / intervener';
COMMENT ON COLUMN reference.hr_main.lastname IS 'lastname';
COMMENT ON COLUMN reference.hr_main.lastnamemaiden IS 'maiden lastname';
COMMENT ON COLUMN reference.hr_main.firstname IS 'firstname';
COMMENT ON COLUMN reference.hr_main.gender_th IS 'gender (see thesaurus)';
COMMENT ON COLUMN reference.hr_main.identifiantldap IS 'identifiant into LDAP';
COMMENT ON COLUMN reference.hr_main.birthday_dt IS 'birthday';
COMMENT ON COLUMN reference.hr_main.type_th IS 'Type of person : user, salaried';
COMMENT ON COLUMN reference.hr_main.status_th IS 'status (see thesaurus)';
COMMENT ON COLUMN reference.hr_main.notice_delay IS 'Number of seconds elapsed before message sending and expected even';
COMMENT ON COLUMN reference.hr_main.notify_yn IS 'Whether sending notification by phone is allowed or not';
ALTER TABLE reference.hr_main OWNER TO postgres;

-- object: "hr_main_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_main DROP CONSTRAINT IF EXISTS "hr_main_FK01" CASCADE;
ALTER TABLE reference.hr_main ADD CONSTRAINT "hr_main_FK01" FOREIGN KEY (gender_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_main_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_main DROP CONSTRAINT IF EXISTS "hr_main_FK02" CASCADE;
ALTER TABLE reference.hr_main ADD CONSTRAINT "hr_main_FK02" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_main_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_main DROP CONSTRAINT IF EXISTS "hr_main_FK03" CASCADE;
ALTER TABLE reference.hr_main ADD CONSTRAINT "hr_main_FK03" FOREIGN KEY (type_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: reference.hr_contact | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_contact CASCADE;
CREATE TABLE reference.hr_contact(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  hr_main_id uuid NOT NULL,
  priority smallint NOT NULL DEFAULT 1,
  content text,
  type_th uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_contact_PK" PRIMARY KEY (id),
  CONSTRAINT "hr_contact_UN" UNIQUE (hr_main_id,content)

);
COMMENT ON TABLE reference.hr_contact IS 'list of phone/email for a person';
COMMENT ON COLUMN reference.hr_contact.hr_main_id IS 'FK for hr_main table';
COMMENT ON COLUMN reference.hr_contact.priority IS 'priority into contact';
COMMENT ON COLUMN reference.hr_contact.content IS 'phone number or email';
COMMENT ON COLUMN reference.hr_contact.type_th IS 'type of phone (mobile, fix ...) or email';
COMMENT ON COLUMN reference.hr_contact.rec_st IS 'Record status, C:create, D: deleted';
ALTER TABLE reference.hr_contact OWNER TO postgres;

-- object: "hr_contact_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_contact DROP CONSTRAINT IF EXISTS "hr_contact_FK01" CASCADE;
ALTER TABLE reference.hr_contact ADD CONSTRAINT "hr_contact_FK01" FOREIGN KEY (type_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_contact_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_contact DROP CONSTRAINT IF EXISTS "hr_contact_FK02" CASCADE;
ALTER TABLE reference.hr_contact ADD CONSTRAINT "hr_contact_FK02" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.hr_messenger | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_messenger CASCADE;
CREATE TABLE reference.hr_messenger(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  content text NOT NULL,
  dt integer,
  phonenumber text,
  hr_main_id uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_messenger_PK" PRIMARY KEY (id)
);
COMMENT ON TABLE reference.hr_messenger IS 'List of messages sent to hrs';
COMMENT ON COLUMN reference.hr_messenger.id IS 'user_main : PK';
COMMENT ON COLUMN reference.hr_messenger.content IS 'Message content';
COMMENT ON COLUMN reference.hr_messenger.dt IS 'Date of the message in seconds';
COMMENT ON COLUMN reference.hr_messenger.phonenumber IS 'Phonenumber to which the message is sent';
COMMENT ON COLUMN reference.hr_messenger.hr_main_id IS 'FK hr_main : hr to which the message is adressed';
COMMENT ON COLUMN reference.hr_messenger.rec_st IS 'Record status';
ALTER TABLE reference.hr_messenger OWNER TO postgres;

-- object: "hr_messenger_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_messenger DROP CONSTRAINT IF EXISTS "hr_messenger_FK01" CASCADE;
ALTER TABLE reference.hr_messenger ADD CONSTRAINT "hr_messenger_FK01" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.user_main | type: TABLE --
-- DROP TABLE IF EXISTS reference.user_main CASCADE;
CREATE TABLE reference.user_main(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  login text NOT NULL,
  passwd text ,
  firstname text,
  lastname text,
  domain text,
  status_th uuid NOT NULL,
  type_th uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  lastconnection_dt integer,
  CONSTRAINT "user_main_PK" PRIMARY KEY (id),
  CONSTRAINT "user_main_UN" UNIQUE (login)

);
COMMENT ON TABLE reference.user_main IS 'user list';
COMMENT ON COLUMN reference.user_main.id IS 'user_main : PK';
COMMENT ON COLUMN reference.user_main.login IS 'login';
COMMENT ON COLUMN reference.user_main.passwd IS 'password';
COMMENT ON COLUMN reference.user_main.firstname IS 'Firstname';
COMMENT ON COLUMN reference.user_main.lastname IS 'Lastname';
COMMENT ON COLUMN reference.user_main.domain IS 'Domain LDAP for connection';
COMMENT ON COLUMN reference.user_main.status_th IS 'Status';
COMMENT ON COLUMN reference.user_main.lastconnection_dt IS 'Date of last connexion.If null, password must be changed';
COMMENT ON COLUMN reference.user_main.type_th IS 'Type';
COMMENT ON COLUMN reference.user_main.rec_st IS 'Record status';
ALTER TABLE reference.user_main OWNER TO postgres;

-- object: "user_main _IDX01" | type: INDEX --
-- DROP INDEX IF EXISTS reference."user_main _IDX01" CASCADE;
CREATE INDEX "user_main _IDX01" ON reference.user_main
  USING btree
  (
    login
  );


ALTER TABLE reference.user_main ADD CONSTRAINT "user_main_FK02" FOREIGN KEY (status_th)
REFERENCES reference."util_thesaurus" (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.user_main ADD CONSTRAINT "user_main_FK03" FOREIGN KEY (type_th)
REFERENCES reference."util_thesaurus" (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: reference.user_mainhr | type: TABLE --
-- DROP TABLE IF EXISTS reference.user_mainhr CASCADE;
CREATE TABLE reference.user_mainhr(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  user_main_id uuid NOT NULL,
  hr_main_id uuid NOT NULL,
  CONSTRAINT "user_mainhr_PK" PRIMARY KEY (id)
);
-- ddl-end --
COMMENT ON TABLE reference.user_mainhr IS 'list of hr of the user';
-- ddl-end --
ALTER TABLE reference.user_mainhr OWNER TO postgres;
-- ddl-end --

-- object: "user_mainhr_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.user_mainhr DROP CONSTRAINT IF EXISTS "user_mainhr_FK01" CASCADE;
ALTER TABLE reference.user_mainhr ADD CONSTRAINT "user_mainhr_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: "user_mainhr_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.user_mainhr DROP CONSTRAINT IF EXISTS "user_mainhr_FK02" CASCADE;
ALTER TABLE reference.user_mainhr ADD CONSTRAINT "user_mainhr_FK02" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: reference.user_maintransportgroup | type: TABLE --
-- DROP TABLE IF EXISTS reference.user_maintransportgroup CASCADE;
CREATE TABLE reference.user_maintransportgroup(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  user_main_id uuid NOT NULL,
  transport_group_id uuid NOT NULL,
  CONSTRAINT "user_maintransportgroup_PK" PRIMARY KEY (id)
);
-- ddl-end --
COMMENT ON TABLE reference.user_maintransportgroup IS 'list of transport groups to which the user has access';
-- ddl-end --
ALTER TABLE reference.user_maintransportgroup OWNER TO postgres;
-- ddl-end --

-- object: "user_maintransportgroup_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.user_maintransportgroup DROP CONSTRAINT IF EXISTS "user_maintransportgroup_FK01" CASCADE;
ALTER TABLE reference.user_maintransportgroup ADD CONSTRAINT "user_maintransportgroup_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_maintransportgroup (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --


-- object: reference.acl_role | type: TABLE --
-- DROP TABLE IF EXISTS reference.acl_role CASCADE;
CREATE TABLE reference.acl_role(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  code text NOT NULL,
  label text NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "acl_role_PK" PRIMARY KEY (id),
  CONSTRAINT "acl_role_UN" UNIQUE (code)

);
COMMENT ON TABLE reference.acl_role IS 'role list into application';
COMMENT ON COLUMN reference.acl_role.id IS 'acl_role : PK';
COMMENT ON COLUMN reference.acl_role.code IS 'Code';
COMMENT ON COLUMN reference.acl_role.label IS 'Label';
COMMENT ON COLUMN reference.acl_role.rec_st IS 'Record status';
ALTER TABLE reference.acl_role OWNER TO postgres;


-- object: reference.acl_action | type: TABLE --
-- DROP TABLE IF EXISTS reference.acl_action CASCADE;
CREATE TABLE reference.acl_action(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  code text NOT NULL,
  label text NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "acl_action_PK" PRIMARY KEY (id),
  CONSTRAINT "acl_action_UN" UNIQUE (code)

);
COMMENT ON TABLE reference.acl_action IS 'action list into application';
COMMENT ON COLUMN reference.acl_action.id IS 'acl_action : PK';
COMMENT ON COLUMN reference.acl_action.code IS 'code';
COMMENT ON COLUMN reference.acl_action.label IS 'label';
COMMENT ON COLUMN reference.acl_action.rec_st IS 'Record status';
ALTER TABLE reference.acl_action OWNER TO postgres;

-- object: reference.acl_roleaction | type: TABLE --
-- DROP TABLE IF EXISTS reference.acl_roleaction CASCADE;
CREATE TABLE reference.acl_roleaction(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  acl_action_id uuid,
  acl_role_id uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "acl_roleaction_PK" PRIMARY KEY (id),
  CONSTRAINT "acl_roleaction_UN" UNIQUE (acl_action_id, acl_role_id)

);
COMMENT ON TABLE reference.acl_roleaction IS 'List of actions associated with a role';
COMMENT ON COLUMN reference.acl_roleaction.id IS 'acl_roleaction : PK';
COMMENT ON COLUMN reference.acl_roleaction.acl_action_id IS 'action';
COMMENT ON COLUMN reference.acl_roleaction.acl_role_id IS 'role';
COMMENT ON COLUMN reference.acl_roleaction.rec_st IS 'Record status';
ALTER TABLE reference.acl_roleaction OWNER TO postgres;

-- object: "acl_roleaction_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.acl_roleaction DROP CONSTRAINT IF EXISTS "acl_roleaction_FK01" CASCADE;
ALTER TABLE reference.acl_roleaction ADD CONSTRAINT "acl_roleaction_FK01" FOREIGN KEY (acl_action_id)
REFERENCES reference.acl_action (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "acl_roleaction_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.acl_roleaction DROP CONSTRAINT IF EXISTS "acl_roleaction_FK02" CASCADE;
ALTER TABLE reference.acl_roleaction ADD CONSTRAINT "acl_roleaction_FK02" FOREIGN KEY (acl_role_id)
REFERENCES reference.acl_role (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.acl_roleuser | type: TABLE --
-- DROP TABLE IF EXISTS reference.acl_roleuser CASCADE;
CREATE TABLE reference.acl_roleuser(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  user_main_id uuid NOT NULL,
  acl_role_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "acl_roleuser_PK" PRIMARY KEY (id),
  CONSTRAINT "acl_roleuser_UN" UNIQUE (user_main_id,acl_role_id)

);
COMMENT ON TABLE reference.acl_roleuser IS 'List of roles for a user';
COMMENT ON COLUMN reference.acl_roleuser.id IS 'acl_roleuser : PK';
COMMENT ON COLUMN reference.acl_roleuser.user_main_id IS 'user';
COMMENT ON COLUMN reference.acl_roleuser.acl_role_id IS 'role';
COMMENT ON COLUMN reference.acl_roleuser.rec_st IS 'Record status';
ALTER TABLE reference.acl_roleuser OWNER TO postgres;

-- object: "acl_roleuser_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.acl_roleuser DROP CONSTRAINT IF EXISTS "acl_roleuser_FK01" CASCADE;
ALTER TABLE reference.acl_roleuser ADD CONSTRAINT "acl_roleuser_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "acl_roleuser_FK2" | type: CONSTRAINT --
-- ALTER TABLE reference.acl_roleuser DROP CONSTRAINT IF EXISTS "acl_roleuser_FK2" CASCADE;
ALTER TABLE reference.acl_roleuser ADD CONSTRAINT "acl_roleuser_FK2" FOREIGN KEY (acl_role_id)
REFERENCES reference.acl_role (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_main | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_main CASCADE;
CREATE TABLE reference.site_main(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  code text NOT NULL,
  label text,
  site_main_id_entity uuid,
  type_th uuid NOT NULL,
  status_th uuid ,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_main_UN" UNIQUE (code),
  CONSTRAINT "site_main_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.site_main IS 'Site list';
COMMENT ON COLUMN reference.site_main.id IS 'site_main : PK';
COMMENT ON COLUMN reference.site_main.label IS 'label';
COMMENT ON COLUMN reference.site_main.site_main_id_entity IS 'entity';
COMMENT ON COLUMN reference.site_main.type_th IS 'type site - FK util_thesaurs';
COMMENT ON COLUMN reference.site_main.status_th IS 'Status - FK util_thesaurs';
COMMENT ON COLUMN reference.site_main.rec_st IS 'Record status';
ALTER TABLE reference.site_main OWNER TO postgres;

-- object: "site_main_IDX01" | type: INDEX --
-- DROP INDEX IF EXISTS reference."site_main_IDX01" CASCADE;
CREATE INDEX "site_main_IDX01" ON reference.site_main
  USING btree
  (
    code,
    type_th ASC NULLS LAST,
    status_th ASC NULLS LAST
  );

-- object: "site_main_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_main DROP CONSTRAINT IF EXISTS "site_main_FK01" CASCADE;
ALTER TABLE reference.site_main ADD CONSTRAINT "site_main_FK01" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: "site_main_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.site_main DROP CONSTRAINT IF EXISTS "site_main_FK02" CASCADE;
ALTER TABLE reference.site_main ADD CONSTRAINT "site_main_FK02" FOREIGN KEY (type_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "site_main_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.site_main DROP CONSTRAINT IF EXISTS "site_main_FK03" CASCADE;
ALTER TABLE reference.site_main ADD CONSTRAINT "site_main_FK03" FOREIGN KEY (site_main_id_entity)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_poi | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_poi CASCADE;
CREATE TABLE reference.site_poi(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  site_main_id uuid NOT NULL,
  "position" integer NOT NULL,
  label text,
  addr1 text,
  addr2 text,
  postcode text,
  city text,
  country_th uuid,
  type_th uuid,
  geom public.geometry,
  service_duration integer NOT NULL DEFAULT 300,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_poi_PK" PRIMARY KEY (id),
  CONSTRAINT "poi_site_UN" UNIQUE (site_main_id,"position")

);
COMMENT ON TABLE reference.site_poi IS 'poi for a site_main';
COMMENT ON COLUMN reference.site_poi.site_main_id IS 'site';
COMMENT ON COLUMN reference.site_poi."position" IS 'position into a site';
COMMENT ON COLUMN reference.site_poi.label IS 'label';
COMMENT ON COLUMN reference.site_poi.addr1 IS 'adress 1';
COMMENT ON COLUMN reference.site_poi.addr2 IS 'adress 2';
COMMENT ON COLUMN reference.site_poi.postcode IS 'post code';
COMMENT ON COLUMN reference.site_poi.city IS 'city';
COMMENT ON COLUMN reference.site_poi.country_th IS 'country';
COMMENT ON COLUMN reference.site_poi.type_th IS 'Type';
COMMENT ON COLUMN reference.site_poi.geom IS 'point geometry';
COMMENT ON COLUMN reference.site_poi.rec_st IS 'Record status';
COMMENT ON COLUMN reference.site_poi.service_duration IS 'Duration of service in second';
ALTER TABLE reference.site_poi OWNER TO postgres;



-- object: "poi_site_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_poi DROP CONSTRAINT IF EXISTS "poi_site_FK01" CASCADE;
ALTER TABLE reference.site_poi ADD CONSTRAINT "poi_site_FK01" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_aoi | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_aoi CASCADE;
CREATE TABLE reference.site_aoi(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  site_main_id uuid NOT NULL,
  "position" integer NOT NULL,
  label text,
  type_th uuid,
  geom public.geometry,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_aoi_PK" PRIMARY KEY (id),
  CONSTRAINT "site_aoi_UN" UNIQUE (site_main_id,"position")

);
COMMENT ON TABLE reference.site_aoi IS 'aoi for a site_main';
COMMENT ON COLUMN reference.site_aoi.site_main_id IS 'site';
COMMENT ON COLUMN reference.site_aoi."position" IS 'position into a site';
COMMENT ON COLUMN reference.site_aoi.label IS 'label';
COMMENT ON COLUMN reference.site_aoi.type_th IS 'type';
COMMENT ON COLUMN reference.site_aoi.geom IS 'aoi geometry';
COMMENT ON COLUMN reference.site_aoi.rec_st IS 'Record status';
ALTER TABLE reference.site_aoi OWNER TO postgres;

-- object: "site_aoi_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_aoi DROP CONSTRAINT IF EXISTS "site_aoi_FK01" CASCADE;
ALTER TABLE reference.site_aoi ADD CONSTRAINT "site_aoi_FK01" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_poivehiclecategory | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_poivehiclecategory CASCADE;
CREATE TABLE reference.site_poivehiclecategory(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  site_poi_id uuid NOT NULL,
  vehicle_category_id uuid NOT NULL,
  quantity integer NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_poivehiclecategory_PK" PRIMARY KEY (id),
  CONSTRAINT "site_poivehiclecategory_UN" UNIQUE (site_poi_id,vehicle_category_id)

);
COMMENT ON TABLE reference.site_poivehiclecategory IS 'Set the of vehicles of a given type parked at a given poi';
COMMENT ON COLUMN reference.site_poivehiclecategory.site_poi_id IS 'poi';
COMMENT ON COLUMN reference.site_poivehiclecategory.vehicle_category_id IS 'vehicle category';
COMMENT ON COLUMN reference.site_poivehiclecategory.quantity IS 'The number of available vehicles for the poi/category';
COMMENT ON COLUMN reference.site_poivehiclecategory.rec_st IS 'Record status';
ALTER TABLE reference.site_poivehiclecategory OWNER TO postgres;

-- object: "site_poivehiclecategory_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_poi DROP CONSTRAINT IF EXISTS "site_poivehiclecategory_FK01" CASCADE;
ALTER TABLE reference.site_poivehiclecategory ADD CONSTRAINT "site_poivehiclecategory_FK01" FOREIGN KEY (site_poi_id)
REFERENCES reference.site_poi (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_hour | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_hour CASCADE;
CREATE TABLE reference.site_hour(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  site_main_id uuid NOT NULL,
  timeslot_th uuid NOT NULL,
  start_hr integer,
  end_hr integer,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_hour_PK" PRIMARY KEY (id)
);

COMMENT ON TABLE reference.site_hour IS 'List of opening periods for a site';
COMMENT ON COLUMN reference.site_hour.id IS 'PK of site_hour';
COMMENT ON COLUMN reference.site_hour.site_main_id IS 'foreign key for the site';
COMMENT ON COLUMN reference.site_hour.timeslot_th IS 'time slot, foregin key to util_thesaurus';
COMMENT ON COLUMN reference.site_hour.start_hr IS 'opening time for the opening period in second';
COMMENT ON COLUMN reference.site_hour.end_hr IS 'close time for the opening period in second';
COMMENT ON COLUMN reference.site_hour.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.site_hour OWNER TO postgres;

-- object: "site_hour_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_hour DROP CONSTRAINT IF EXISTS "site_hour_FK01" CASCADE;
ALTER TABLE reference.site_hour ADD CONSTRAINT "site_hour_FK01" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "site_hour_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.site_hour DROP CONSTRAINT IF EXISTS "site_hour_FK02" CASCADE;
ALTER TABLE reference.site_hour ADD CONSTRAINT "site_hour_FK02" FOREIGN KEY (timeslot_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.user_mainsite | type: TABLE --
-- DROP TABLE IF EXISTS reference.user_mainsite CASCADE;
CREATE TABLE reference.user_mainsite(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  user_main_id uuid NOT NULL,
  site_main_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "user_society_PK" PRIMARY KEY (id),
  CONSTRAINT "user_mainsite_UN" UNIQUE (user_main_id,site_main_id)

);
COMMENT ON TABLE reference.user_mainsite IS 'list of entity of the user';
COMMENT ON COLUMN reference.user_mainsite.user_main_id IS 'user';
COMMENT ON COLUMN reference.user_mainsite.site_main_id IS 'site - entity';
COMMENT ON COLUMN reference.user_mainsite.rec_st IS 'Record status';
ALTER TABLE reference.user_mainsite OWNER TO postgres;

-- object: "user_society_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.user_mainsite DROP CONSTRAINT IF EXISTS "user_society_FK01" CASCADE;
ALTER TABLE reference.user_mainsite ADD CONSTRAINT "user_society_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "user_society_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.user_mainsite DROP CONSTRAINT IF EXISTS "user_society_FK02" CASCADE;
ALTER TABLE reference.user_mainsite ADD CONSTRAINT "user_society_FK02" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.user_session | type: TABLE --
-- DROP TABLE IF EXISTS reference.user_session CASCADE;
CREATE TABLE reference.user_session(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  user_main_id uuid NOT NULL,
  start_dt integer NOT NULL,
  lastaction_dt integer NOT NULL,
  application_name text,
  session_data json,
  CONSTRAINT "user_lastsession_PK" PRIMARY KEY (id),
  CONSTRAINT "user_session_UN" UNIQUE (user_main_id,application_name)

);
COMMENT ON TABLE reference.user_session IS 'last user session';
COMMENT ON COLUMN reference.user_session.id IS 'user_lastsession : PK';
COMMENT ON COLUMN reference.user_session.user_main_id IS 'user : FK';
COMMENT ON COLUMN reference.user_session.start_dt IS 'Date of beginning session';
COMMENT ON COLUMN reference.user_session.lastaction_dt IS 'date of the last action';
COMMENT ON COLUMN reference.user_session.application_name IS 'application name';
COMMENT ON COLUMN reference.user_session.session_data IS 'Variables session';
ALTER TABLE reference.user_session OWNER TO postgres;

-- object: "user_lastsession_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.user_session DROP CONSTRAINT IF EXISTS "user_lastsession_FK01" CASCADE;
ALTER TABLE reference.user_session ADD CONSTRAINT "user_lastsession_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.audit_trail | type: TABLE --
-- DROP TABLE IF EXISTS reference.audit_trail CASCADE;
CREATE TABLE reference.audit_trail(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  dt integer NOT NULL,
  table_name text NOT NULL,
  column_name text NOT NULL,
  event_code text NOT NULL,
  record_id uuid NOT NULL,
  column_value json,
  user_main_id uuid NOT NULL,
  CONSTRAINT "audit_trail_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.audit_trail IS 'audit trail';
COMMENT ON COLUMN reference.audit_trail.dt IS 'date of event';
COMMENT ON COLUMN reference.audit_trail.table_name IS 'table name';
COMMENT ON COLUMN reference.audit_trail.column_name IS 'column name';
COMMENT ON COLUMN reference.audit_trail.event_code IS 'Code event';
COMMENT ON COLUMN reference.audit_trail.record_id IS 'record id into table name';
COMMENT ON COLUMN reference.audit_trail.column_value IS 'value of column';
COMMENT ON COLUMN reference.audit_trail.user_main_id IS 'user ';
ALTER TABLE reference.audit_trail OWNER TO postgres;
-- object: "audit_trail_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.audit_trail DROP CONSTRAINT IF EXISTS "audit_trail_FK01" CASCADE;
ALTER TABLE reference.audit_trail ADD CONSTRAINT "audit_trail_FK01" FOREIGN KEY (user_main_id)
REFERENCES reference.user_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.doc_file | type: TABLE --
-- DROP TABLE IF EXISTS reference.doc_file CASCADE;
CREATE TABLE reference.doc_file(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  label text,
  dt integer,
  namefile text NOT NULL,
  type_th uuid NOT NULL,
  content json,
  status_th uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "doc_file_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.doc_file IS 'List of files';
COMMENT ON COLUMN reference.doc_file.id IS 'doc file identifier';
COMMENT ON COLUMN reference.doc_file.label IS 'File label';
COMMENT ON COLUMN reference.doc_file.dt IS 'Date as unix timestamp at which the document was inserted';
COMMENT ON COLUMN reference.doc_file.namefile IS 'File name (without path)';
COMMENT ON COLUMN reference.doc_file.type_th IS 'File type (see thesaurus)';
COMMENT ON COLUMN reference.doc_file.content IS 'File content, encoded in base 64';
COMMENT ON COLUMN reference.doc_file.status_th IS 'File status, approved or rejected for instance (see thesaurus)';
COMMENT ON COLUMN reference.doc_file.rec_st IS 'File deletion mark, D means marked as deleted';
ALTER TABLE reference.doc_file OWNER TO postgres;

-- object: "doc_file_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.doc_file DROP CONSTRAINT IF EXISTS "doc_file_FK01" CASCADE;
ALTER TABLE reference.doc_file ADD CONSTRAINT "doc_file_FK01" FOREIGN KEY (type_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "doc_file_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.doc_file DROP CONSTRAINT IF EXISTS "doc_file_FK02" CASCADE;
ALTER TABLE reference.doc_file ADD CONSTRAINT "doc_file_FK02" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.doc_filesite | type: TABLE --
-- DROP TABLE IF EXISTS reference.doc_filesite CASCADE;
CREATE TABLE reference.doc_filesite(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  doc_file_id uuid NOT NULL,
  site_main_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "doc_filesite_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.doc_filesite IS 'Link between a document and a site';
COMMENT ON COLUMN reference.doc_filesite.doc_file_id IS 'FK for doc_file table';
COMMENT ON COLUMN reference.doc_filesite.site_main_id IS 'FK for site_main table';
COMMENT ON COLUMN reference.doc_filesite.rec_st IS 'File deletion mark, D means marked as deleted';
ALTER TABLE reference.doc_filesite OWNER TO postgres;

-- object: "doc_filesite_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.doc_filesite DROP CONSTRAINT IF EXISTS "doc_filesite_FK01" CASCADE;
ALTER TABLE reference.doc_filesite ADD CONSTRAINT "doc_filesite_FK01" FOREIGN KEY (doc_file_id)
REFERENCES reference.doc_file (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "doc_filesite_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.doc_filesite DROP CONSTRAINT IF EXISTS "doc_filesite_FK02" CASCADE;
ALTER TABLE reference.doc_filesite ADD CONSTRAINT "doc_filesite_FK02" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: reference.util_context | type: TABLE --
-- DROP TABLE IF EXISTS reference.util_context CASCADE;
CREATE TABLE reference.util_context(
  version text,
  date_dt integer
);
COMMENT ON TABLE reference.util_context IS 'context of OSS';
COMMENT ON COLUMN reference.util_context.version IS 'version';
COMMENT ON COLUMN reference.util_context.date_dt IS 'date of version';
ALTER TABLE reference.util_context OWNER TO postgres;


-- object: reference.vehicle_category | type: TABLE --
-- DROP TABLE IF EXISTS reference.vehicle_category CASCADE;
CREATE TABLE reference.vehicle_category(
  id uuid NOT NULL DEFAULT uuid_generate_v1 (),
  code text NOT NULL,
  label text,
  axles_count integer,
  fuel_consumption real,
  daily_cost real,
  hourly_cost real,
  kilometric_cost real,
  co2_quantity real,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "vehicle_category_PK" PRIMARY KEY (id),
  CONSTRAINT "vehicle_category_UN" UNIQUE (code)

);
COMMENT ON TABLE reference.vehicle_category IS 'Category of vehicle';
COMMENT ON COLUMN reference.vehicle_category.code IS 'code';
COMMENT ON COLUMN reference.vehicle_category.co2_quantity IS 'emitted CO2 expressed in grams per kilometer';
COMMENT ON COLUMN reference.vehicle_category.rec_st IS 'record status';
ALTER TABLE reference.vehicle_category OWNER TO postgres;

-- object: "site_poivehiclecategory_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.site_poi DROP CONSTRAINT IF EXISTS "site_poivehiclecategory_FK02" CASCADE;
ALTER TABLE reference.site_poivehiclecategory ADD CONSTRAINT "site_poivehiclecategory_FK02" FOREIGN KEY (vehicle_category_id)
REFERENCES reference.vehicle_category (id) MATCH SIMPLE
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.vehicle_configuration | type: TABLE --
-- DROP TABLE IF EXISTS reference.vehicle_configuration CASCADE;
CREATE TABLE reference.vehicle_configuration(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  code text NOT NULL,
  label text,
  vehicle_category_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "vehicle_configuration_PK" PRIMARY KEY (id),
  CONSTRAINT "vehicle_configuration_UN" UNIQUE (code,vehicle_category_id)

);
COMMENT ON TABLE reference.vehicle_configuration IS 'list of configurations possible for a category of vehicles';
COMMENT ON COLUMN reference.vehicle_configuration.vehicle_category_id IS 'FK for vehicle_category table';
COMMENT ON COLUMN reference.vehicle_configuration.rec_st IS 'record status';
ALTER TABLE reference.vehicle_configuration OWNER TO postgres;

-- object: "vehicle_configuration_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.vehicle_configuration DROP CONSTRAINT IF EXISTS "vehicle_configuration_FK01" CASCADE;
ALTER TABLE reference.vehicle_configuration ADD CONSTRAINT "vehicle_configuration_FK01" FOREIGN KEY (vehicle_category_id)
REFERENCES reference.vehicle_category (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.vehicle_capacity | type: TABLE --
-- DROP TABLE IF EXISTS reference.vehicle_capacity CASCADE;
CREATE TABLE reference.vehicle_capacity(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  vehicle_configuration_id uuid NOT NULL,
  quantity real NOT NULL,
  unit_th uuid NOT NULL,
  transported_th uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "vehicle_capacity_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.vehicle_capacity IS 'capacity of a vehicle';
COMMENT ON COLUMN reference.vehicle_capacity.unit_th IS 'unit of transported';
ALTER TABLE reference.vehicle_capacity OWNER TO postgres;

-- object: "vehicle_capacity_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.vehicle_capacity DROP CONSTRAINT IF EXISTS "vehicle_capacity_FK01" CASCADE;
ALTER TABLE reference.vehicle_capacity ADD CONSTRAINT "vehicle_capacity_FK01" FOREIGN KEY (vehicle_configuration_id)
REFERENCES reference.vehicle_configuration (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "vehicle_capacity_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.vehicle_capacity DROP CONSTRAINT IF EXISTS "vehicle_capacity_FK02" CASCADE;
ALTER TABLE reference.vehicle_capacity ADD CONSTRAINT "vehicle_capacity_FK02" FOREIGN KEY (transported_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "vehicle_capacity_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.vehicle_capacity DROP CONSTRAINT IF EXISTS "vehicle_capacity_FK03" CASCADE;
ALTER TABLE reference.vehicle_capacity ADD CONSTRAINT "vehicle_capacity_FK03" FOREIGN KEY (unit_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.hr_mainsite | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_mainsite CASCADE;
CREATE TABLE reference.hr_mainsite(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  hr_main_id uuid NOT NULL,
  site_main_id uuid NOT NULL,
  type_th uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_mainsite_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.hr_mainsite IS 'Link between hr_main and site_main with a type of link';
ALTER TABLE reference.hr_mainsite OWNER TO postgres;

-- object: "hr_mainsite_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_mainsite DROP CONSTRAINT IF EXISTS "hr_mainsite_FK01" CASCADE;
ALTER TABLE reference.hr_mainsite ADD CONSTRAINT "hr_mainsite_FK01" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_mainsite_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_mainsite DROP CONSTRAINT IF EXISTS "hr_mainsite_FK02" CASCADE;
ALTER TABLE reference.hr_mainsite ADD CONSTRAINT "hr_mainsite_FK02" FOREIGN KEY (site_main_id)
REFERENCES reference.site_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_mainsite_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_mainsite DROP CONSTRAINT IF EXISTS "hr_mainsite_FK03" CASCADE;
ALTER TABLE reference.hr_mainsite ADD CONSTRAINT "hr_mainsite_FK03" FOREIGN KEY (type_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: reference.hr_group | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_group CASCADE;
CREATE TABLE reference.hr_group(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  code text NOT NULL,
  label text,
  hr_main_id uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_group_PK" PRIMARY KEY (id),
  CONSTRAINT "hr_group_UN" UNIQUE (code)

);
COMMENT ON TABLE reference.hr_group IS 'List of group of human ressource';
ALTER TABLE reference.hr_group OWNER TO postgres;

-- object: "hr_group_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_group DROP CONSTRAINT IF EXISTS "hr_group_FK01" CASCADE;
ALTER TABLE reference.hr_group ADD CONSTRAINT "hr_group_FK01" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.hr_maindetail | type: TABLE --
-- DROP TABLE IF EXISTS reference.hr_maindetail CASCADE;
CREATE TABLE reference.hr_maindetail(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  hr_main_id uuid NOT NULL,
  crisis_risk text,
  specific_arrangement text,
  transportmode_th uuid,
  pickup_duration integer,
  delivery_duration integer,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "hr_maindetail_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.hr_maindetail IS 'List of detail about a human ressource';
COMMENT ON COLUMN reference.hr_maindetail.id IS 'hr_maindetail : PK';
COMMENT ON COLUMN reference.hr_maindetail.hr_main_id IS 'FK for hr_main';
COMMENT ON COLUMN reference.hr_maindetail.crisis_risk IS 'Crisis risks';
COMMENT ON COLUMN reference.hr_maindetail.specific_arrangement IS 'Specific arrangements (earphones, toys, means of restraint, ...)';
COMMENT ON COLUMN reference.hr_maindetail.transportmode_th IS 'mode of transport';
COMMENT ON COLUMN reference.hr_maindetail.pickup_duration IS 'duration to pick the hr in a vehicle in seconds';
COMMENT ON COLUMN reference.hr_maindetail.delivery_duration IS 'duration to deliver the hr from a vehicle in seconds';
COMMENT ON COLUMN reference.hr_maindetail.rec_st IS 'Record status';
ALTER TABLE reference.hr_maindetail OWNER TO postgres;

-- object: "hr_maindetail_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_maindetail DROP CONSTRAINT IF EXISTS "hr_maindetail_FK01" CASCADE;
ALTER TABLE reference.hr_maindetail ADD CONSTRAINT "hr_maindetail_FK01" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "hr_maindetail_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.hr_maindetail DROP CONSTRAINT IF EXISTS "hr_maindetail_FK02" CASCADE;
ALTER TABLE reference.hr_maindetail ADD CONSTRAINT "hr_maindetail_FK02" FOREIGN KEY (transportmode_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

/******************************************************************************************************************************************************************************/
/*   TRANSPORT TABLES     */
/******************************************************************************************************************************************************************************/

-- object: reference.transport_demand | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_demand CASCADE;
CREATE TABLE reference.transport_demand(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  site_poi_id_institution uuid NOT NULL,
  site_poi_id_hr uuid NOT NULL,
  hr_main_id uuid,
  start_dt integer NOT NULL DEFAULT 1535760000,
  end_dt integer NOT NULL DEFAULT 1567209600,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "transport_demand_PK" PRIMARY KEY (id)

);

COMMENT ON TABLE reference.transport_demand IS 'List of demand of transport';
COMMENT ON COLUMN reference.transport_demand.id IS 'PK of tranport_demand';
COMMENT ON COLUMN reference.transport_demand.site_poi_id_institution IS 'poi for institution ';
COMMENT ON COLUMN reference.transport_demand.site_poi_id_hr IS 'point of the child''s depot';
COMMENT ON COLUMN reference.transport_demand.hr_main_id IS 'child';
COMMENT ON COLUMN reference.transport_demand.start_dt IS 'date of the beginning of the demand';
COMMENT ON COLUMN reference.transport_demand.end_dt IS 'date of the end of the demand';
COMMENT ON COLUMN reference.transport_demand.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_demand OWNER TO postgres;

-- object: "transport_demand_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_demand DROP CONSTRAINT IF EXISTS "transport_demand_FK01" CASCADE;
ALTER TABLE reference.transport_demand ADD CONSTRAINT "transport_demand_FK01" FOREIGN KEY (site_poi_id_institution)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_demand_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_demand DROP CONSTRAINT IF EXISTS "transport_demand_FK02" CASCADE;
ALTER TABLE reference.transport_demand ADD CONSTRAINT "transport_demand_FK02" FOREIGN KEY (site_poi_id_hr)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_demand_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_demand DROP CONSTRAINT IF EXISTS "transport_demand_FK03" CASCADE;
ALTER TABLE reference.transport_demand ADD CONSTRAINT "transport_demand_FK03" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.transport_demandtime | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_demandtime CASCADE;
CREATE TABLE reference.transport_demandtime(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  transport_demand_id uuid NOT NULL,
  timeslot_th uuid NOT NULL,
  start_hr integer,
  end_hr integer,
  repeatDemand json,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "transport_demandtime_PK" PRIMARY KEY (id)

);

COMMENT ON TABLE reference.transport_demandtime IS 'List of time slot for a demand';
COMMENT ON COLUMN reference.transport_demandtime.id IS 'PK of transport_demandtime';
COMMENT ON COLUMN reference.transport_demandtime.transport_demand_id IS 'foreign key for the associated demand';
COMMENT ON COLUMN reference.transport_demandtime.timeslot_th IS 'time slot, foregin key to util_thesaurus';
COMMENT ON COLUMN reference.transport_demandtime.start_hr IS 'pickup start time in second';
COMMENT ON COLUMN reference.transport_demandtime.end_hr IS 'pickup end time in second';
COMMENT ON COLUMN reference.transport_demandtime.repeatDemand IS 'how the transport demand is repeated from one week to another';
COMMENT ON COLUMN reference.transport_demandtime.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_demandtime OWNER TO postgres;

-- object: "transport_demandtime_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_demandtime DROP CONSTRAINT IF EXISTS "transport_demandtime_FK01" CASCADE;
ALTER TABLE reference.transport_demandtime ADD CONSTRAINT "transport_demandtime_FK01" FOREIGN KEY (transport_demand_id)
REFERENCES reference.transport_demand (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_demandtime_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_demandtime DROP CONSTRAINT IF EXISTS "transport_demandtime_FK02" CASCADE;
ALTER TABLE reference.transport_demandtime ADD CONSTRAINT "transport_demandtime_FK02" FOREIGN KEY (timeslot_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.transport_calendar | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_calendar CASCADE;
CREATE TABLE reference.transport_calendar(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  transport_demand_id uuid NOT NULL,
  site_poi_id_institution uuid NOT NULL,
  site_poi_id_hr uuid NOT NULL,
  hr_main_id uuid NOT NULL,
  date_dt integer NOT NULL,
  timeslot_th uuid NOT NULL,
  start_hr integer,
  end_hr integer,
  manually_updated_yn text NOT NULL DEFAULT 'N',
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "transport_calendar_PK" PRIMARY KEY (id)

);
-- ddl-end --
COMMENT ON TABLE reference.transport_calendar IS 'List of demand day by day : this table is a catch of the table transport_demand';
COMMENT ON COLUMN reference.transport_calendar.id IS 'PK for transport_calendar';
COMMENT ON COLUMN reference.transport_calendar.transport_demand_id IS 'foreign key for the associated demand';
COMMENT ON COLUMN reference.transport_calendar.site_poi_id_institution IS 'poi for institution';
COMMENT ON COLUMN reference.transport_calendar.site_poi_id_hr IS 'point of the child''''s depot';
COMMENT ON COLUMN reference.transport_calendar.hr_main_id IS 'child';
COMMENT ON COLUMN reference.transport_calendar.date_dt IS 'Date of the transport';
COMMENT ON COLUMN reference.transport_calendar.timeslot_th IS 'time slot, foregin key to util_thesaurus';
COMMENT ON COLUMN reference.transport_calendar.start_hr IS 'pickup start time in second';
COMMENT ON COLUMN reference.transport_calendar.end_hr IS 'pickup end time in second';
COMMENT ON COLUMN reference.transport_calendar.manually_updated_yn IS 'record updated manually ? ';
COMMENT ON COLUMN reference.transport_calendar.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_calendar OWNER TO postgres;

-- object: "transport_calendar_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_calendar DROP CONSTRAINT IF EXISTS "transport_calendar_FK01" CASCADE;
ALTER TABLE reference.transport_calendar ADD CONSTRAINT "transport_calendar_FK01" FOREIGN KEY (transport_demand_id)
REFERENCES reference.transport_demand (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_calendar_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_calendar DROP CONSTRAINT IF EXISTS "transport_calendar_FK02" CASCADE;
ALTER TABLE reference.transport_calendar ADD CONSTRAINT "transport_calendar_FK02" FOREIGN KEY (site_poi_id_institution)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_calendar_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_calendar DROP CONSTRAINT IF EXISTS "transport_calendar_FK03" CASCADE;
ALTER TABLE reference.transport_calendar ADD CONSTRAINT "transport_calendar_FK03" FOREIGN KEY (site_poi_id_hr)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_calendar_FK04" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_calendar DROP CONSTRAINT IF EXISTS "transport_calendar_FK04" CASCADE;
ALTER TABLE reference.transport_calendar ADD CONSTRAINT "transport_calendar_FK04" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_calendar_FK05" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_calendar DROP CONSTRAINT IF EXISTS "transport_calendar_FK05" CASCADE;
ALTER TABLE reference.transport_calendar ADD CONSTRAINT "transport_calendar_FK05" FOREIGN KEY (timeslot_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;


-- object: reference.transport_group | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_group CASCADE;
CREATE TABLE reference.transport_group(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  label text,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "transport_group_PK" PRIMARY KEY (id)
);

COMMENT ON TABLE reference.transport_group IS 'List of transport demand groups';
COMMENT ON COLUMN reference.transport_group.id IS 'PK for transport_group';
COMMENT ON COLUMN reference.transport_group.label IS 'Label of the group';
COMMENT ON COLUMN reference.transport_group.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_group OWNER TO postgres;
-- ddl-end --


-- object: reference.transport_groupdemand | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_groupdemand CASCADE;
CREATE TABLE reference.transport_groupdemand(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  transport_demand_id uuid NOT NULL,
  transport_group_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "transport_groupdemand_PK" PRIMARY KEY (id),
  CONSTRAINT "transport_groupdemand_UN" UNIQUE (transport_demand_id,transport_group_id)
);

COMMENT ON TABLE reference.transport_groupdemand IS 'Association between groups and demands';
COMMENT ON COLUMN reference.transport_groupdemand.id IS 'PK for transport_groupdemand';
COMMENT ON COLUMN reference.transport_groupdemand.transport_demand_id IS 'foreign key to the transport demand';
COMMENT ON COLUMN reference.transport_groupdemand.transport_group_id IS 'foreign key to the transport group';
COMMENT ON COLUMN reference.transport_groupdemand.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_groupdemand OWNER TO postgres;
-- ddl-end --

-- object: "transport_groupdemand_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_groupdemand DROP CONSTRAINT IF EXISTS "transport_groupdemand_FK01" CASCADE;
ALTER TABLE reference.transport_groupdemand ADD CONSTRAINT "transport_groupdemand_FK01" FOREIGN KEY (transport_demand_id)
REFERENCES reference.transport_demand (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_groupdemand_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_groupdemand DROP CONSTRAINT IF EXISTS "transport_groupdemand_FK02" CASCADE;
ALTER TABLE reference.transport_groupdemand ADD CONSTRAINT "transport_groupdemand_FK02" FOREIGN KEY (transport_group_id)
REFERENCES reference.transport_group (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "user_maintransportgroup_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.user_mainhr DROP CONSTRAINT IF EXISTS "user_maintransportgroup_FK02" CASCADE;
ALTER TABLE reference.user_maintransportgroup ADD CONSTRAINT "user_maintransportgroup_FK02" FOREIGN KEY (transport_group_id)
REFERENCES reference.transport_group(id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: reference.scenario_directory | type: TABLE --
-- DROP TABLE IF EXISTS reference.scenario_directory CASCADE;
CREATE TABLE reference.scenario_directory(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  label text,
  scenario_directory_id_parent uuid,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "scenario_directory_PK" PRIMARY KEY (id)

);
COMMENT ON TABLE reference.scenario_directory IS 'List of directory for scenario';
COMMENT ON COLUMN reference.scenario_directory.id IS 'PK for scenario_directory';
COMMENT ON COLUMN reference.scenario_directory.label IS 'Label of the directory';
COMMENT ON COLUMN reference.scenario_directory.scenario_directory_id_parent IS 'Parent of the directory';
COMMENT ON COLUMN reference.scenario_directory.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.scenario_directory OWNER TO postgres;

ALTER TABLE reference.scenario_directory ADD CONSTRAINT "scenario_directory_FK01" FOREIGN KEY (scenario_directory_id_parent)
REFERENCES reference.scenario_directory (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.scenario_main | type: TABLE --
-- DROP TABLE IF EXISTS reference.scenario_main CASCADE;
CREATE TABLE reference.scenario_main(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  code text NOT NULL,
  label text,
  status_th uuid NOT NULL,
  scenario_directory_id uuid,
  start_dt integer NOT NULL,
  end_dt integer NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "scenario_main_PK" PRIMARY KEY (id),
  CONSTRAINT "scenario_main_UN" UNIQUE (code)
);

COMMENT ON TABLE reference.scenario_main IS 'List of scenario';
COMMENT ON COLUMN reference.scenario_main.id IS 'PK for scenario_main';
COMMENT ON COLUMN reference.scenario_main.code IS 'Code of the scenario';
COMMENT ON COLUMN reference.scenario_main.label IS 'Label of the scenario';
COMMENT ON COLUMN reference.scenario_main.status_th IS 'Status of the scenario';
COMMENT ON COLUMN reference.scenario_main.scenario_directory_id IS 'Directory ID';
COMMENT ON COLUMN reference.scenario_main.start_dt IS 'Scenario start date';
COMMENT ON COLUMN reference.scenario_main.end_dt IS 'Scenario end date';
COMMENT ON COLUMN reference.scenario_main.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.scenario_main OWNER TO postgres;
ALTER TABLE reference.scenario_main ADD CONSTRAINT "scenario_main_FK01" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE reference.scenario_main ADD CONSTRAINT "scenario_main_FK02" FOREIGN KEY (scenario_directory_id)
REFERENCES reference.scenario_directory (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.scenario_vehiclecategory | type: TABLE --
-- DROP TABLE IF EXISTS reference.scenario_vehiclecategory CASCADE;
CREATE TABLE reference.scenario_vehiclecategory(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  vehicle_category_id uuid NOT NULL,
  scenario_main_id uuid NOT NULL,
  quantity integer,
  unlimited_yn text,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT scenario_vehiclecategory_pk PRIMARY KEY (id),
  CONSTRAINT "scenario_vehiclecategory_UN" UNIQUE (scenario_main_id,vehicle_category_id)
);
COMMENT ON TABLE reference.scenario_vehiclecategory IS 'List of vehicle categories used in a scenario';
COMMENT ON COLUMN reference.scenario_vehiclecategory.id IS 'PK for scenario_vehiclecategory';
COMMENT ON COLUMN reference.scenario_vehiclecategory.vehicle_category_id IS 'Vehicle Categories ID';
COMMENT ON COLUMN reference.scenario_vehiclecategory.scenario_main_id IS 'Scenario ID';
COMMENT ON COLUMN reference.scenario_vehiclecategory.quantity IS 'Quantity of vehicle categories';
COMMENT ON COLUMN reference.scenario_vehiclecategory.unlimited_yn IS 'Quantity unilimited ?';
COMMENT ON COLUMN reference.scenario_vehiclecategory.rec_st IS 'record status : D means marked as deleted';

ALTER TABLE reference.scenario_vehiclecategory OWNER TO postgres;
ALTER TABLE reference.scenario_vehiclecategory ADD CONSTRAINT "scenario_vehiclecategory_FK01" FOREIGN KEY (vehicle_category_id)
REFERENCES reference.vehicle_category (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE reference.scenario_vehiclecategory ADD CONSTRAINT "scenario_vehiclecategory_FK02" FOREIGN KEY (scenario_main_id)
REFERENCES reference.scenario_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.optim_main | type: TABLE --
-- DROP TABLE IF EXISTS reference.optim_main CASCADE;

-- Table: reference.optim_main

-- DROP TABLE reference.optim_main;

CREATE TABLE reference.optim_main
(
    id uuid NOT NULL DEFAULT uuid_generate_v1(),
    code text COLLATE pg_catalog."default" NOT NULL,
    label text COLLATE pg_catalog."default",
    start_dt integer NOT NULL,
    instance json,
    parameters json,
    solution json,
    rec_st text COLLATE pg_catalog."default" NOT NULL DEFAULT 'C'::text,
    logs text COLLATE pg_catalog."default",
    last_solution_dt integer,
    status_th uuid,
    transport_scenario_id_2019_08_21 uuid,
    timeslot_th uuid,
    errors text COLLATE pg_catalog."default",
    matrix_download_url_2019_08_01 text COLLATE pg_catalog."default",
    matrix_blocks json,
    scenario_main_id uuid,
    calendar_dt integer,
  CONSTRAINT "optim_main_PK" PRIMARY KEY (id),
  CONSTRAINT "optim_main_UN" UNIQUE (code)
);

-- ddl-end --
COMMENT ON TABLE reference.optim_main IS 'list of optim run';
-- ddl-end --
COMMENT ON COLUMN reference.optim_main.id IS 'PK for optim_main';
COMMENT ON COLUMN reference.optim_main.code IS 'code for the instance';
COMMENT ON COLUMN reference.optim_main.label IS 'label for the instance';
COMMENT ON COLUMN reference.optim_main.scenario_main_id IS 'FK scenario_main : the scenario that generated the instance';
COMMENT ON COLUMN reference.optim_main.timeslot_th IS 'FK util_thesaurus : the timeslot that generated the instance';
COMMENT ON COLUMN reference.optim_main.calendar_dt IS 'the calendar date that generated the instance';
COMMENT ON COLUMN reference.optim_main.start_dt IS 'date of creation for the instance in database';
COMMENT ON COLUMN reference.optim_main.last_solution_dt IS 'date of the last found solution for the instance';
COMMENT ON COLUMN reference.optim_main.status_th IS 'FK util_thesaurus : status for the instance, indicating whether it is waiting for start, started or finished';
COMMENT ON COLUMN reference.optim_main.instance IS 'Json representation of a collection of demands';
COMMENT ON COLUMN reference.optim_main.parameters IS 'Json representation of parameters';
COMMENT ON COLUMN reference.optim_main.solution IS 'Solver output as Json';
COMMENT ON COLUMN reference.optim_main.logs IS 'Solver logs as text';
COMMENT ON COLUMN reference.optim_main.errors IS 'Solver error logs as text';
COMMENT ON COLUMN reference.optim_main.matrix_blocks IS 'The distance and time matrices divided into blocks';
COMMENT ON COLUMN reference.optim_main.rec_st IS 'record status : D means marked as deleted';

ALTER TABLE reference.optim_main ADD CONSTRAINT "optim_main_FK01" FOREIGN KEY (scenario_main_id)
REFERENCES reference.scenario_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.optim_main ADD CONSTRAINT "optim_main_FK02" FOREIGN KEY (timeslot_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE reference.optim_main ADD CONSTRAINT "optim_main_FK03" FOREIGN KEY (status_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.transport_route | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_route CASCADE;
CREATE TABLE reference.transport_route(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  code text COLLATE pg_catalog."default" NOT NULL,
  label text COLLATE pg_catalog."default",
  date_dt integer,
  timeslot_th uuid NOT NULL,
  start_hr integer,
  end_hr integer,
  vehicle_category_id uuid,
  site_poi_id_start uuid,
  site_poi_id_end uuid,
  duration integer,
  distance integer,
  optim_main_id uuid,
  scenario_main_id uuid,
  transport_route_id_parent uuid,
  hr_main_id_driver uuid,
  start_driver_dt integer,
  end_driver_dt integer,
  rec_st text COLLATE pg_catalog."default" NOT NULL DEFAULT 'C'::text,
  CONSTRAINT "transport_route_PK" PRIMARY KEY (id),
  CONSTRAINT "transport_route_UN" UNIQUE (code)
);

COMMENT ON TABLE reference.transport_route IS 'List of route';
COMMENT ON COLUMN reference.transport_route.id IS 'PK for transport_route';
COMMENT ON COLUMN reference.transport_route.code IS 'code of the route';
COMMENT ON COLUMN reference.transport_route.date_dt IS 'Date of the transport. If the date is null, this is a typical tour for a time slot';
COMMENT ON COLUMN reference.transport_route.timeslot_th IS 'time slot, foregin key to util_thesaurus';
COMMENT ON COLUMN reference.transport_route.start_hr IS 'Planned hour for the route start in seconds';
COMMENT ON COLUMN reference.transport_route.end_hr IS 'Planned hour for the route end in seconds';
COMMENT ON COLUMN reference.transport_route.start_driver_dt IS 'Real hour for the route start as a unix timestamp as set by the driver';
COMMENT ON COLUMN reference.transport_route.end_driver_dt IS 'Real hour for the route end as a unix timestamp as set by the driver';
COMMENT ON COLUMN reference.transport_route.vehicle_category_id IS 'foreign key for vehicle_category table';
COMMENT ON COLUMN reference.transport_route.site_poi_id_start IS 'Starting point ';
COMMENT ON COLUMN reference.transport_route.site_poi_id_end IS 'Arrival point ';
COMMENT ON COLUMN reference.transport_route.duration IS 'duration of the route in second';
COMMENT ON COLUMN reference.transport_route.distance IS 'distance of the route';
COMMENT ON COLUMN reference.transport_route.scenario_main_id IS 'FK for scenario_main';
COMMENT ON COLUMN reference.transport_route.optim_main_id IS 'FK for optim_main in case the route results from an optimization';
COMMENT ON COLUMN reference.transport_route.transport_route_id_parent IS 'FK for transport_route in case the route was copied from another route';
COMMENT ON COLUMN reference.transport_route.hr_main_id_driver IS 'FK for hr_main the driver associated to the route';
COMMENT ON COLUMN reference.transport_route.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_route OWNER TO postgres;
-- ddl-end --


-- object: "transport_order_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_order_FK01" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK01" FOREIGN KEY (timeslot_th)
REFERENCES reference.util_thesaurus (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_route_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK02" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK02" FOREIGN KEY (site_poi_id_start)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_route_FK04" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK04" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK04" FOREIGN KEY (site_poi_id_end)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_route_FK05" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK05" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK05" FOREIGN KEY (vehicle_category_id)
REFERENCES reference.vehicle_category (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: "transport_route_FK06" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK06" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK06" FOREIGN KEY (scenario_main_id)
REFERENCES reference.scenario_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: "transport_route_FK07" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK07" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK07" FOREIGN KEY (optim_main_id)
REFERENCES reference.optim_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_route_FK08" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK08" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK08" FOREIGN KEY (transport_route_id_parent)
REFERENCES reference.transport_route (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_route_FK09" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_route DROP CONSTRAINT IF EXISTS "transport_route_FK09" CASCADE;
ALTER TABLE reference.transport_route ADD CONSTRAINT "transport_route_FK09" FOREIGN KEY (hr_main_id_driver)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.transport_routesitepoi | type: TABLE --
-- DROP TABLE IF EXISTS reference.transport_routesitepoi CASCADE;
CREATE TABLE reference.transport_routesitepoi(
    id uuid NOT NULL DEFAULT uuid_generate_v1(),
    transport_route_id uuid NOT NULL,
    transport_demand_id uuid,
    site_poi_id uuid NOT NULL,
    hr_main_id uuid,
    orderroute integer,
    rec_st text COLLATE pg_catalog."default" NOT NULL DEFAULT 'C'::text,
    waiting_duration integer,
    arrival_dt integer,
    notified_yn text COLLATE pg_catalog."default",
    visited_yn text COLLATE pg_catalog."default",
    visit_missing_yn text COLLATE pg_catalog."default",
    visit_comments text COLLATE pg_catalog."default",
    target_hr integer,
    visited_dt integer,
    CONSTRAINT "transport_routesitepoi_PK" PRIMARY KEY (id)
);

COMMENT ON TABLE reference.transport_routesitepoi IS 'list of points of a route';
COMMENT ON COLUMN reference.transport_routesitepoi.id IS 'PK for transport_routesitepoi';
COMMENT ON COLUMN reference.transport_routesitepoi.transport_route_id IS 'foreign key for transport_route';
COMMENT ON COLUMN reference.transport_routesitepoi.transport_demand_id IS 'foreign key for transport_demand';
COMMENT ON COLUMN reference.transport_routesitepoi.site_poi_id IS 'Point ';
COMMENT ON COLUMN reference.transport_routesitepoi.orderroute IS 'order of point in the route';
COMMENT ON COLUMN reference.transport_routesitepoi.waiting_duration IS 'waiting duration before reaching the point (in seconds)';
COMMENT ON COLUMN reference.transport_routesitepoi.target_hr IS 'target local arrival time on the POI';
COMMENT ON COLUMN reference.transport_routesitepoi.arrival_dt IS 'estimated or real arrival time on the POI';
COMMENT ON COLUMN reference.transport_routesitepoi.notified_yn IS 'whether the hr was notified of the vehicle approach';
COMMENT ON COLUMN reference.transport_routesitepoi.visited_yn IS 'whether the poi was visited by driver or not yet';
COMMENT ON COLUMN reference.transport_routesitepoi.visited_dt IS 'timestamp at which driver visited the poi (as provided by the mobile device)';
COMMENT ON COLUMN reference.transport_routesitepoi.visit_missing_yn IS 'whether the hr was missing at during the driver visit';
COMMENT ON COLUMN reference.transport_routesitepoi.visit_comments IS 'Some free comments about the driver visit on the point';
COMMENT ON COLUMN reference.transport_routesitepoi.rec_st IS 'record status : D means marked as deleted';
ALTER TABLE reference.transport_routesitepoi OWNER TO postgres;

-- object: "transport_routesitepoi_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_routesitepoi DROP CONSTRAINT IF EXISTS "transport_routesitepoi_FK01" CASCADE;
ALTER TABLE reference.transport_routesitepoi ADD CONSTRAINT "transport_routesitepoi_FK01" FOREIGN KEY (transport_route_id)
REFERENCES reference.transport_route (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_routesitepoi_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_routesitepoi DROP CONSTRAINT IF EXISTS "transport_routesitepoi_FK02" CASCADE;
ALTER TABLE reference.transport_routesitepoi ADD CONSTRAINT "transport_routesitepoi_FK02" FOREIGN KEY (transport_demand_id)
REFERENCES reference.transport_demand (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_routesitepoi_FK03" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_routesitepoi DROP CONSTRAINT IF EXISTS "transport_routesitepoi_FK03" CASCADE;
ALTER TABLE reference.transport_routesitepoi ADD CONSTRAINT "transport_routesitepoi_FK03" FOREIGN KEY (site_poi_id)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "transport_routesitepoi_FK04" | type: CONSTRAINT --
-- ALTER TABLE reference.transport_routesitepoi DROP CONSTRAINT IF EXISTS "transport_routesitepoi_FK04" CASCADE;
ALTER TABLE reference.transport_routesitepoi ADD CONSTRAINT "transport_routesitepoi_FK04" FOREIGN KEY (hr_main_id)
REFERENCES reference.hr_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.gis_transportroute_current | type: TABLE --
-- DROP TABLE IF EXISTS reference.gis_transportroute_current CASCADE;
CREATE TABLE reference.gis_transportroute_current(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  transport_route_id uuid NOT NULL,
  geom_dt integer NOT NULL,
  geom geometry NOT NULL,
  site_poi_id_next uuid NOT NULL,
  duration_to_next_poi integer NOT NULL,
  CONSTRAINT "gis_transportroute_current_PK" PRIMARY KEY (id),
  CONSTRAINT "gis_transportroute_current_UN" UNIQUE (transport_route_id)
);

COMMENT ON TABLE reference.gis_transportroute_current IS 'last position for a route realization';
COMMENT ON COLUMN reference.gis_transportroute_current.id IS 'PK';
COMMENT ON COLUMN reference.gis_transportroute_current.transport_route_id IS 'Fk for transport_route table';
COMMENT ON COLUMN reference.gis_transportroute_current.geom_dt IS 'date of geom';
COMMENT ON COLUMN reference.gis_transportroute_current.geom IS 'The geometry (point)';
COMMENT ON COLUMN reference.gis_transportroute_current.site_poi_id_next IS 'FK for site_poi table id of the next POI in the route';
COMMENT ON COLUMN reference.gis_transportroute_current.duration_to_next_poi IS 'Estimated duration in seconds to the next POI in the route';
ALTER TABLE reference.gis_transportroute_current OWNER TO postgres;

-- object: "gis_transportroute_current_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.gis_transportroute_current DROP CONSTRAINT IF EXISTS "gis_transportroute_current_FK01" CASCADE;
ALTER TABLE reference.gis_transportroute_current ADD CONSTRAINT "gis_transportroute_current_FK01" FOREIGN KEY (transport_route_id)
REFERENCES reference.transport_route (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: "gis_transportroute_current_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.gis_transportroute_current DROP CONSTRAINT IF EXISTS "gis_transportroute_current_FK02" CASCADE;
ALTER TABLE reference.gis_transportroute_current ADD CONSTRAINT "gis_transportroute_current_FK02" FOREIGN KEY (site_poi_id_next)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.gis_transportroute | type: TABLE --
-- DROP TABLE IF EXISTS reference.gis_transportroute CASCADE;
CREATE TABLE reference.gis_transportroute(
  id uuid NOT NULL DEFAULT uuid_generate_v1(),
  transport_route_id uuid NOT NULL,
  geom_dt integer NOT NULL,
  geom geometry NOT NULL,
  heading integer,
  speed integer,
  accuracy integer,
  event json,
  CONSTRAINT "gis_transportroute_PK" PRIMARY KEY (id),
  CONSTRAINT "gis_transportroute_UN" UNIQUE (transport_route_id,geom_dt)

);
ALTER TABLE reference.gis_transportroute OWNER TO postgres;

-- object: "gis_transportroute_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.gis_transportroute DROP CONSTRAINT IF EXISTS "gis_transportroute_FK01" CASCADE;
ALTER TABLE reference.gis_transportroute ADD CONSTRAINT "gis_transportroute_FK01" FOREIGN KEY (transport_route_id)
REFERENCES reference.transport_route (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

-- object: reference.site_poisitepoi | type: TABLE --
-- DROP TABLE IF EXISTS reference.site_poisitepoi CASCADE;
CREATE TABLE reference.site_poisitepoi(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  site_poi_id_start uuid NOT NULL,
  site_poi_id_end uuid NOT NULL,
  acceptable_duration integer,
  depart_dt integer,
  arrival_dt integer,
  duration integer,
  distance integer,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT "site_poisitepoi_PK" PRIMARY KEY (id),
  CONSTRAINT "site_poisitepoi_UN" UNIQUE (site_poi_id_start,site_poi_id_end,depart_dt,arrival_dt)

);
-- ddl-end --
COMMENT ON TABLE reference.site_poisitepoi IS 'characteristics between two poi';
-- ddl-end --
COMMENT ON COLUMN reference.site_poisitepoi.id IS 'PK for site_poisitepoi';
COMMENT ON COLUMN reference.site_poisitepoi.site_poi_id_start IS 'FK site poi : the start POI';
COMMENT ON COLUMN reference.site_poisitepoi.site_poi_id_end IS 'FK site poi : the end POI';
COMMENT ON COLUMN reference.site_poisitepoi.acceptable_duration IS 'Acceptable duration of the journey in seconds';
COMMENT ON COLUMN reference.site_poisitepoi.depart_dt IS 'Depart date (when using tomtom routing) as unix time stamp';
COMMENT ON COLUMN reference.site_poisitepoi.arrival_dt IS 'Arrival date (when using tomtom routing) as unix time stamp';
COMMENT ON COLUMN reference.site_poisitepoi.duration IS 'Computed route duration in seconds';
COMMENT ON COLUMN reference.site_poisitepoi.distance IS 'Computed route distance in meters';
COMMENT ON COLUMN reference.site_poisitepoi.rec_st IS 'record status : D means marked as deleted';
-- ddl-end --
ALTER TABLE reference.site_poisitepoi OWNER TO postgres;
-- ddl-end --

-- object: "site_poisitepoi_FK01" | type: CONSTRAINT --
-- ALTER TABLE reference.site_poisitepoi DROP CONSTRAINT IF EXISTS "site_poisitepoi_FK01" CASCADE;
ALTER TABLE reference.site_poisitepoi ADD CONSTRAINT "site_poisitepoi_FK01" FOREIGN KEY (site_poi_id_start)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: "site_poisitepoi_FK02" | type: CONSTRAINT --
-- ALTER TABLE reference.site_poisitepoi DROP CONSTRAINT IF EXISTS "site_poisitepoi_FK02" CASCADE;
ALTER TABLE reference.site_poisitepoi ADD CONSTRAINT "site_poisitepoi_FK02" FOREIGN KEY (site_poi_id_end)
REFERENCES reference.site_poi (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ddl-end --

-- object: reference.scenario_transportgroup | type: TABLE --
-- DROP TABLE IF EXISTS reference.scenario_transportgroup CASCADE;
-- object: reference.scenario_transportgroup | type: TABLE --
-- DROP TABLE IF EXISTS reference.scenario_transportgroup CASCADE;
CREATE TABLE reference.scenario_transportgroup(
  id uuid NOT NULL DEFAULT uuid_generate_V1(),
  scenario_main_id uuid NOT NULL,
  transport_group_id uuid NOT NULL,
  rec_st text NOT NULL DEFAULT 'C',
  CONSTRAINT scenario_transportgroup_pk PRIMARY KEY (id),
  CONSTRAINT "scenario_transportgroup_UN" UNIQUE (scenario_main_id,transport_group_id)

);
ALTER TABLE reference.scenario_transportgroup OWNER TO postgres;
ALTER TABLE reference.scenario_transportgroup ADD CONSTRAINT "scenario_transportgroup_FK01" FOREIGN KEY (scenario_main_id)
REFERENCES reference.scenario_main (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE reference.scenario_transportgroup ADD CONSTRAINT "scenario_transportgroup_FK02" FOREIGN KEY (transport_group_id)
REFERENCES reference.transport_group (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

