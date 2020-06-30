-- DATACHECKER  DATA

insert into reference.util_thesaurus (cat, code, label, rec_st) values ('DATA_CHECKER_MAIN_SCOPE','TIME','Temps','C');

-- USER CHECKS --

update reference.datachecker_main
   set scope_th=(select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='HR')
 where hookname = 'hr_demand_without_route';

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Usager : avec demande et plusieurs tournées',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='HR'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='ERROR'),
             'Dans le scénario {{scenario.label}}, le {{(calendar.date_dt/1000)|date("m/d/Y") }} {{calendar.timeslot_label}}, tournée {{route.label}}, l''usager {{hr.firstname}} {{hr.lastname}} est pris en charge dans au moins une autre tournée. Veuillez corriger.',
             'hr_demand_with_several_route'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Usager : avec plusieurs demandes et points de prise en charge différents',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='HR'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='WARNING'),
             'Dans le scénario {{scenario.label}}, le {{(calendar.date_dt/1000)|date("m/d/Y") }} {{calendar.timeslot_label}}, point {{sitePoi.label}}, l''usager {{hr.firstname}} {{hr.lastname}} a au moins une autre demande de transport sur un point différent. Veuillez corriger si possible.',
             'hr_with_several_demands'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Usager : sans demande et servi dans des tournées',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='HR'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='WARNING'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}} l''usager {{hr.firstname}} {{hr.lastname}} n''a pas de demandes de transport mais est pris en charge dans la tournée {{route.label}}. Veuillez corriger si possible.',
             'hr_with_route_without_demands'
            );

-- VEHICLE CHECKS --

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Véhicule : tournée sans véhicule',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='VEHICLE_CAT'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='ERROR'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}} la tournée {{route.label}} n''a pas de véhicule associé. Veuillez corriger.',
             'vehicle_missing_in_route'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Véhicule : capacité dépassée lors d''une tournée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='VEHICLE_CAT'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='ERROR'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}} la tournée {{route.label}} présente un dépassement de capacité du véhicule. Veuillez corriger.',
             'vehicle_overflow_in_route'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Véhicule : flotte limitée dépassée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='VEHICLE_CAT'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='ERROR'),
             'Dans le scénario {{scenario.label}}, le {{(calendarDt/1000)|date("m/d/Y") }} ({{timeSlot.label}}) la flotte limitée de véhicules {{vehicleCategory.label}} est dépassée. Veuillez corriger.',
             'vehicle_fleet_overflow'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Véhicule : autre véhicule disponible à moindre coût',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='VEHICLE_CAT'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='DISABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='INFO'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}}, tournée {{route.label}}, il existe un autre véhicule disponible faisant baisser le coût de la tournée.',
             'vehicle_with_lower_cost_available'
            );

-- TIME CHECKS --

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Temps de transport : fenêtre de temps non respectée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='TIME'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='WARNING'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}} sur la tournée {{route.label}} et sur le point {{sitePoi.label}}{% if hr %} (usager {{hr.firstname}} {{hr.lastname}}){% endif %} la fenêtre de temps n''est pas respectée. Veuillez corriger si possible.',
             'time_windows_override'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Temps de transport : durée acceptable de trajet dépassée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='TIME'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='WARNING'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}} sur la tournée {{route.label}} la durée acceptable de trajet définie pour l''usager {{hr.firstname}} {{hr.lastname}} est dépassée. Veuillez corriger si possible.',
             'time_acceptable_duration_override'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Temps de transport : temps de trajet non respecté',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='TIME'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='WARNING'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}}, sur la tournée {{route.label}} et sur le point {{sitePoi.label}}{% if hr %}  (usager {{hr.firstname}} {{hr.lastname}}){% endif %} le temps de trajet calculé par le routeur n''est pas respecté. Veuillez corriger si possible.',
             'time_travel_duration_override'
            );

insert into reference.datachecker_main(label,scope_th,status_th,level_th,label_tpl,hookname) 
     values ('Temps de transport : présence d''un temps d''attente dans la tournée',
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_SCOPE' and code='TIME'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_STATUS' and code='ENABLED'),
             (select id from reference.util_thesaurus where cat='DATA_CHECKER_MAIN_LEVEL' and code='INFO'),
             'Dans le scénario {{scenario.label}}, le {{(route.date_dt/1000)|date("m/d/Y") }} {{route.timeslot_label}}, sur la tournée {{route.label}}, avant de servir le point {{sitePoi.label}}{% if hr %}  (usager {{hr.firstname}} {{hr.lastname}}){% endif %} il existe un temps d''attente. ',
             'time_route_with_waiting_duration'
            );

-- Add some columns to keep into memory the passage times computed by tomtom
ALTER TABLE reference.transport_routesitepoi ADD target_hr_manual integer;
ALTER TABLE reference.transport_routesitepoi ADD target_hr_auto integer;
COMMENT ON COLUMN reference.transport_routesitepoi.target_hr_manual IS 'target local arrival time on the POI defined manually';
COMMENT ON COLUMN reference.transport_routesitepoi.target_hr_auto IS 'target local arrival time on the POI defined automatically';

-- Add an extra data field, for instance to store the date associated to a check associated to no transport_calendar and no_route
ALTER TABLE reference.datachecker_detail ADD extra_data json;
COMMENT ON COLUMN reference.datachecker_detail.extra_data IS 'extra data';