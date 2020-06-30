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

import 'package:flutter/material.dart';
import 'package:nomad_mobile_driver/Components/step/step_crud_action.dart';
import 'package:nomad_mobile_driver/Components/step/step_crud_address.dart';
import 'package:nomad_mobile_driver/Components/step/step_crud_ctrl.dart';
import 'package:nomad_mobile_driver/Components/step/step_map.dart';
import 'package:nomad_mobile_driver/Components/step/step_open_map.dart';
import 'package:provider/provider.dart';


class StepCrud extends StatelessWidget {
  
  @override
  Widget build(BuildContext context) {
    return Container(
      child: ChangeNotifierProvider<StepCrudCtrl>(
        builder: (_) => StepCrudCtrl(context),
        child: StepCrudViewScaffold()
      )
    );
  }
}

class StepCrudViewScaffold extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    final stepCrudModel = Provider.of<StepCrudCtrl>(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Color.fromRGBO(25, 43, 63, 0.9),
        title: Text(stepCrudModel.step.poi.label, style: TextStyle(color: Colors.white),),
      ),
      body: StepCrudView()
    );
  }
}

class StepCrudView extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final stepCrudModel = Provider.of<StepCrudCtrl>(context);
    stepCrudModel.setContext(context);

    final Size screenSize = MediaQuery.of(context).size;

    return Column(
        children:[
          StepCrudAddress(step: stepCrudModel.step,), 
          SizedBox(
            width: screenSize.width,
            height: 200,
            child: StepMap(stepPosition: stepCrudModel.step.poi.coordinates,)
          ),
          /*OpenMap(label: "Naviguer vers...",color:Colors.lightBlue[800],onTap: stepCrudModel.openMap),*/
          StepCrudAction(label:"Pris en charge",status:stepCrudModel.step.poi.visited && !stepCrudModel.step.poi.visitMissing ,onChanged:stepCrudModel.setVisited),
          StepCrudAction(label:"Absent",status:stepCrudModel.step.poi.visited && stepCrudModel.step.poi.visitMissing, onChanged: stepCrudModel.setCanceled),
        ]
      );
  }
}