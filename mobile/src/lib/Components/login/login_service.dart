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

import 'dart:async';
import 'dart:convert';
import 'package:f_logs/f_logs.dart';
import 'package:http/http.dart' as http;
import 'package:nomad_mobile_driver/Components/app_context/app_context.dart';
import 'package:nomad_mobile_driver/Components/app_context/app_context_service.dart';

import '../nomad_exception.dart';
import 'login_response.dart';

class LoginService{

  static String authToken;
  static String userMainId;
  static String driverHrId;
  
  static final LoginService _singleton = new LoginService._internal();
  
  LoginService._internal(){
    // init singleton
  }

  factory LoginService(){    
    return _singleton;
  }

  Future <bool> login({username: String,password: String}) async {
    
    final AppContext context = await AppContextService().getContext();
    final url = Uri.http(context.apiEndpoint,"/rest/login");
    final body = {"login":username,"password":password};

    var response;
    try{
      response = await http.post(url,body:body);
    }on Exception {
      FLog.error(text:"network error ");
      throw NomadException(errMsg: "Erreur réseau");
    }

    if(response.statusCode == 200){
      final LoginResponse result = LoginResponse.fromJson(json.decode(response.body));
      if(result.result){
        FLog.info(text:"Successfull login for " + username + response.body);
        LoginService.authToken = result.token;
        LoginService.userMainId = result.userMainId;
        LoginService.driverHrId = result.hrMainId;
      }
      return result.result;
    }else{
      FLog.error(text:"error " + response.statusCode.toString() + " " + response.body);
      return false;
    }
  }

}