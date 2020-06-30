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

import 'package:nomad_mobile_driver/Components/database/database_service.dart';
import 'package:sqflite/sqflite.dart';

import 'app_context.dart';

class AppContextService{

  Future<AppContext> _context;

  static final AppContextService _singleton = new AppContextService._internal();
  
  AppContextService._internal() {
    // init singleton
  }

  factory AppContextService(){    
    return _singleton;
  }

  // Save config to db. One record per context id
  Future<void> save(AppContext context) async {
    final Database db = await DatabaseService().db();
    
    await db.insert(
      'app_context',
      context.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<AppContext> getContext() async {
    if(_context == null){
      await load();
    }
    return _context;
  }

  // Load config from db
  load() async {
    print("read context from db");
    final Database db = await DatabaseService().db();

    AppContext defaultContext = AppContext();
    print(AppContext().apiEndpoint);

    final List<Map<String, dynamic>> maps = await db.query("app_context",where:"id = ?",whereArgs: [defaultContext.contextId]);

    if(maps.length==1){
      this._context = Future.value(AppContext(apiEndpoint: maps[0]['api_endpoint']));
      print(maps[0]);
    }else{
      print("Init App Context with default values");      
      await this.save(defaultContext);
      this._context = Future.value(defaultContext);
    }

  }   
}