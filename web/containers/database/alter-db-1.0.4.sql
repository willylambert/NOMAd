ALTER TABLE reference.scenario_main ADD need_calendar_update_yn TEXT DEFAULT 'N';
COMMENT ON COLUMN reference.scenario_main.need_calendar_update_yn IS ' if ''Y'' scenario needs to update transport_calendar table ';

ALTER TABLE reference.transport_calendar ADD status_th uuid;
COMMENT ON COLUMN reference.transport_calendar.status_th IS 'Status';

insert into reference.util_thesaurus (cat, code, label, rec_st) values ('TRANSPORT_CALENDAR_STATUS','DO_NOT_SERVE','à ne pas desservir','C');
insert into reference.util_thesaurus (cat, code, label, rec_st) values ('TRANSPORT_CALENDAR_STATUS','TO_BE_SERVED','à desservir','C');

UPDATE reference.transport_calendar SET status_th = (SELECT ID FROM reference.util_thesaurus WHERE CAT='TRANSPORT_CALENDAR_STATUS' AND CODE='TO_BE_SERVED');
ALTER TABLE reference.transport_calendar ALTER COLUMN status_th SET NOT NULL;
