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

class LoginResponse{
  final bool result;
  final String token;
  final String userMainId;
  
  // User is linked to an HR with DRIVER type
  final String hrMainId; 

  LoginResponse({this.result,this.token,this.userMainId,this.hrMainId});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    
    // Extract id of hr link to user (<=> the driver)
    final hrs = json['hrs'] as List;
    String hrMainId = "";
    
    if(hrs!=null && hrs.length>0){
      final hr = hrs[0] as Map<String, dynamic>;
      hrMainId = hr["id"];
    }
    return LoginResponse(result: json['result'], token: json['user_session_id'],userMainId: json['user_main_id'],hrMainId: hrMainId);
  }


}