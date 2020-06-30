/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import { AOI } from './aoi';
import { Polygon } from 'geojson'

export const AOIS: AOI[] =
[
    {"id":"d875432a-b5a4-11e8-96f8-529269fb1459","site_id":"a1977b74-b023-11e8-96f8-529269fb1459","site_code":"THORIGNE","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.68542242050171,47.634424421499],[-0.67795515060425,47.635884804191],[-0.67973613739014,47.633846040833],[-0.67995071411133,47.632660340454],[-0.68140983581543,47.631966259457],[-0.68162441253662,47.630361161843],[-0.68716049194336,47.62956582494],[-0.68670988082886,47.631749357255],[-0.68694591522217,47.632848319138],[-0.68542242050171,47.634424421499]]]} as Polygon},
    {"id":"d875467c-b5a4-11e8-96f8-529269fb1459","site_id":"a1977b74-b023-11e8-96f8-529269fb1459","site_code":"THORIGNE","label":"Chantier","position":2,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.68512201309204,47.634814824829],[-0.67696809768677,47.636448703416],[-0.67726850509644,47.637388521935],[-0.67726850509644,47.638819905353],[-0.67737579345703,47.639947634367],[-0.67726850509644,47.641863272088],[-0.6812596321106,47.64182712863],[-0.6805944442749,47.640431972048],[-0.68293333053589,47.639578956406],[-0.68528294563293,47.639889802702],[-0.68484306335449,47.636651127295],[-0.68512201309204,47.634814824829]]]} as Polygon},
    {"id":"d87548d4-b5a4-11e8-96f8-529269fb1459","site_id":"a19763c8-b023-11e8-96f8-529269fb1459","site_code":"ECERCLERE","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.52599191665649,47.495411312183],[-0.52588999271393,47.495342447302],[-0.52506387233734,47.495991223385],[-0.52481710910797,47.495973101257],[-0.5240660905838,47.495458430207],[-0.52322387695312,47.495795504071],[-0.5235081911087,47.497643935177],[-0.52584171295166,47.496371786632],[-0.52532136440277,47.496027467623],[-0.52599191665649,47.495411312183]]]} as Polygon},
    {"id":"d8754b18-b5a4-11e8-96f8-529269fb1459","site_id":"a19767e2-b023-11e8-96f8-529269fb1459","site_code":"DBAILLEUL","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.21001696586609,47.780960008923],[-0.20438432693481,47.780289528458],[-0.20398736000061,47.781464665935],[-0.20986676216125,47.781983736608],[-0.21001696586609,47.780960008923]]]} as Polygon},
    {"id":"d8754d48-b5a4-11e8-96f8-529269fb1459","site_id":"a1975f2c-b023-11e8-96f8-529269fb1459","site_code":"DLONGUE","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.11529207229614,47.389394000316],[-0.11265277862549,47.390803110777],[-0.11119365692139,47.38954653471],[-0.11425137519836,47.388159181827],[-0.11529207229614,47.389394000316]]]} as Polygon},
    {"id":"d8754f6e-b5a4-11e8-96f8-529269fb1459","site_id":"a1977d0e-b023-11e8-96f8-529269fb1459","site_code":"DPRUILLE","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.67525148391724,47.568650476643],[-0.67430734634399,47.568860401818],[-0.67488670349121,47.570083742134],[-0.67377090454102,47.570322615902],[-0.67221522331238,47.567180976858],[-0.67435026168823,47.566116830587],[-0.67484378814697,47.566913132553],[-0.67505836486816,47.567912112446],[-0.67525148391724,47.568650476643]]]} as Polygon},
    {"id":"d8755694-b5a4-11e8-96f8-529269fb1459","site_id":"a19765d0-b023-11e8-96f8-529269fb1459","site_code":"EMOULIHERNE","label":"Chantier","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[0.045264959335327,47.466824628114],[0.046262741088867,47.466657811713],[0.046659708023071,47.467789251702],[0.049202442169189,47.46727430447],[0.048655271530151,47.465265236754],[0.045082569122314,47.465236224384],[0.045264959335327,47.466824628114]]]} as Polygon},
    {"id":"d8755810-b5a4-11e8-96f8-529269fb1459","site_id":"a1976c92-b023-11e8-96f8-529269fb1459","site_code":"EPIFFAULT","label":"Chantier","position":1,"type_code":"ST","rec_st":"U","geom":{"type":"Polygon","coordinates":[[[0.18025517463684,47.969827011653],[0.18094182014465,47.969704897273],[0.18433213233948,47.967808495719],[0.18306612968445,47.967413403298],[0.18025517463684,47.969827011653]]]} as Polygon},
    {"id":"d875593c-b5a4-11e8-96f8-529269fb1459","site_id":"a1977ee4-b023-11e8-96f8-529269fb1459","site_code":"SOUZAY_CHAMPIGNY","label":"Plateforme","position":1,"type_code":"ST","rec_st":"C","geom":{"type":"Polygon","coordinates":[[[-0.021929740905762,47.20792232679],[-0.018668174743652,47.209861039227],[-0.014119148254395,47.20637713681],[-0.014698505401611,47.205502481022],[-0.02072811126709,47.20563368031],[-0.021929740905762,47.20792232679]]]} as Polygon}
];
