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
import 'package:nomad_mobile_driver/Components/login/login_bad_credentials.dart';
import 'package:nomad_mobile_driver/Components/login/nomad_logo.dart';
import 'package:nomad_mobile_driver/Components/login/sign_in_button.dart';
import 'package:provider/provider.dart';

import 'login_ctrl.dart';
import 'login_form.dart';


class Login extends StatelessWidget {
@override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ChangeNotifierProvider<LoginCtrl>(
        builder: (_) => LoginCtrl(),
        child: LoginView()
      )
    );
  }
}

class LoginView extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final loginModel = Provider.of<LoginCtrl>(context);
    loginModel.setContext(context);

    return Container(
              child: Container(
                  decoration: BoxDecoration(
                      gradient: LinearGradient(
                    colors: <Color>[
                      const Color.fromRGBO(162, 146, 199, 0.8),
                      const Color.fromRGBO(25, 43, 63, 0.9),
                    ],
                    stops: [0.2, 1.0],
                    begin: const FractionalOffset(0.0, 0.0),
                    end: const FractionalOffset(0.0, 1.0),
                  )),
                  child: ListView(
                    padding: const EdgeInsets.all(0.0),
                    children: <Widget>[
                      Stack(
                        alignment: AlignmentDirectional.bottomCenter,
                        children: <Widget>[
                          Column(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: <Widget>[
                              NomadLogo(),
                              LoginForm(usernameCtrl: loginModel.usernameCtrl,passwordCtrl: loginModel.passwordCtrl),
                              InkWell(
                                onTap: (){
                                  loginModel.login(username: loginModel.usernameCtrl.text,password: loginModel.passwordCtrl.text).then((result){
                                    if(result){
                                      Navigator.pushReplacementNamed(context, "/route-list");
                                    }
                                  });                                
                                },
                                child: SignIn()
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 20),
                                alignment: Alignment.centerRight,
                                child:
                                  Text(loginModel.appConfig.version),
                              ),
                              loginModel.showBadCredentials
                              ? BadCredentials()
                              : Container()
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
              )
    );
  }
  
}