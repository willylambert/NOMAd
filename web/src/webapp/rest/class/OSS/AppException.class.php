<?php
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


namespace OSS;

use Exception;

class AppException extends Exception
{

  // Exception codes
  const ALREADY_EXISTS = 101;
  const SAVE_INTO_DATABASE_FAILED = 102;
  const OPTIM_FAILED = 103;
  const OPTIM_FAILED_MISSING_TRANSPORT_MODE = 104;
  const OPTIM_FAILED_NO_VEHICLE = 105;
  const OPTIM_FAILED_NO_WALKING_CAPACITY = 106;
  const OPTIM_FAILED_NO_WHEELCHAIR_CAPACITY = 107;
  const OPTIM_FAILED_SERVER_DOWN = 108;
  const OPTIM_FAILED_HR_TIME_WINDOWS = 109;
  const OPTIM_FAILED_INSTITUTION_TIME_WINDOWS = 110;
  const OPTIM_FAILED_PICKUP_DURATION = 111;
  const OPTIM_FAILED_DELIVERY_DURATION = 112;
  const OPTIM_FAILED_NO_MATRIX = 113;
  const INVALID_INPUT_DATA = 120;

}
