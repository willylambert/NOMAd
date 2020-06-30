<?php
/*
 * Copyright (c) 2020 INSA Lyon, Ressourcial, GIHP, ODO Smart Systems
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

$gTblConfig = array();

//ODO-VIA Version
$gTblConfig['VERSION'] = "2.0.0a1";

$gTblConfig['PRODUCTION'] = true;
$gTblConfig['CUSTOM'] = true;

$gTblConfig['BASE_URL'] = "http://localhost";
$gTblConfig['HOST_HOSTNAME'] = "localhost";

// My server URL
$gTblConfig['BASE_URL'] = '';

// Local test database configuration
$gTblConfig['DB_HOST'] = 'database';
$gTblConfig['DB_PORT'] = '5434';
$gTblConfig['DB_USER'] = 'oss';
$gTblConfig['DB_PASSWD'] = 'LeCaireRio117';
$gTblConfig['DB_NAME'] = 'oss';
$gTblConfig['DB_DEFAULT_SCHEMA'] = "reference";

//Logs handling
$gTblConfig['LOG_GRAYLOG_SERVER'] = "";
$gTblConfig['LOG_GRAYLOG_UDP_PORT'] = "12201";
$gTblConfig['LOG_FILE'] = "/var/www/data/logs/oss.log";
$gTblConfig['LOG_SLOW_QUERY_DURATION'] = 10; //Unit = seconds
$gTblConfig['LOG_SUBJECT_PREFIX'] = "";
$gTblConfig['LOG_TO_FILE'] = false;
$gTblConfig['LOG_TO_GRAYLOG'] = false;
//From 1 (Emergency) to 8 (Debug) Full list : EMERGENCY,ALERT,CRITICAL,ERROR,WARN,NOTICE,INFO,DEBUG
$gTblConfig['LOG_LEVEL'] = 7;

// Email recipient in case of errors
$gTblConfig['LOG_ERROR_EMAIL'] = '';

// Default SRID (Spatial Reference System Identifier), that enables to locate GPS coordinates on earth
// Also used for points that are sent to server by Leaflet
// This is the SRID in use for Nomad database columns for which the type is geometry
$gTblConfig['MAP']['SRID']['DEFAULT'] = 4326;

// SRID in use for OSM data stored in gis database, as defined by imposm tool.
// 900913 is a non standard EPSG code used in most of the webmapping applications (means "Google" but spelt with numbers)
// this code is equivalent to the standard EPSG:3857, but postgis will not accept mixing 3857 with 900913
$gTblConfig['MAP']['SRID']['OSM'] = 900913;

// Default map zoom level
$gTblConfig['MAP']['ZOOM'] = '12';

// Default maximum map zoom level
$gTblConfig['MAP']['MAXZOOM'] = '22';

// Default map center
$gTblConfig['MAP']['LAT'] = '45.759';
$gTblConfig['MAP']['LON'] = '4.849';

$gTblConfig['OPTIM_HOST_URL'] = 'host.docker.internal';
$gTblConfig['OPTIM_PORT'] = '5014';

// Some default parameters for the optimizations
$gTblConfig['OPTIM']['PARAMS'] = array(
  "nbIterations"=>-1,
  "timeLimit"=>10
);

// Mapox config
$gTblConfig['MAPBOX_KEY'] = '';
$gTblConfig['MAPBOX_SERVER'] = 'https://api.mapbox.com';

// TomTom config
$gTblConfig['TOMTOM_KEY'] = '';
$gTblConfig['TOMTOM_SERVER'] = 'https://api.tomtom.com';
$gTblConfig['TOMTOM_MATRIX_MAX_POINTS'] = '25';

// Nominatim server (still used for reverse geocoding)
$gTblConfig['NOMINATIM_URL'] = '';

$gTblConfig['OSRM_HOST'] = 'host.docker.internal'; // by example : http://osrmhost.com
$gTblConfig['OSRM_PORT'] = '5014'; // default OSRM port

// A set of static dates expressed as unix timestamp.
// They all correspond to a date at expressed at midnight (French local time)
// The dates are ranging from  Monday, September 7, 2020 to Sunday, September 13, 2020
$gTblConfig['MONDAY_REFERENCE_DT']    = 1599429600000;
$gTblConfig['TUESDAY_REFERENCE_DT']   = 1599516000000;
$gTblConfig['WEDNESDAY_REFERENCE_DT'] = 1599602400000;
$gTblConfig['THURSDAY_REFERENCE_DT']  = 1599688800000;
$gTblConfig['FRIDAY_REFERENCE_DT']    = 1599775200000;
$gTblConfig['SATURDAY_REFERENCE_DT']  = 1599861600000;
$gTblConfig['SUNDAY_REFERENCE_DT']    = 1599948000000;

//AWS - send SMS with AWS SNS Service
$gTblConfig['SNS_AWS_KEY'] = "YOUR_KEY";
$gTblConfig['SNS_AWS_SECRET'] = "SECRET";
$gTblConfig['SNS_AWS_REGION'] = "eu-west-1";

// Default values could be overrided by env variable
foreach($gTblConfig as $key=>$value){
  $envVar = getenv($key);
  if($envVar!==false && $envVar!=""){
    $gTblConfig[$key] = $envVar;
  }
}

return $gTblConfig;