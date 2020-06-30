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
 
#include "MPdarp.h"

#include "solve/solve.h"
#include "lib/lib_tools.h"

namespace darp {

using namespace std;


MPdarp::MPdarp(const std::string& instJson, const std::string& paramJson, const std::string& referenceSol) {
	deleteAll=false;
	loadProblemJson(new Instance(instJson), new LNS_SCP_Parameters(paramJson), paramJson);
	darps[0]->loadSolutionJson(referenceSol);
}

MPdarp::MPdarp(const std::string& instJson, const std::string& paramJson) {
	deleteAll=false;
	loadProblemJson(new Instance(instJson), new LNS_SCP_Parameters(paramJson), paramJson);
}

MPdarp::MPdarp(const Instance * inst, LNS_SCP_Parameters * param, const string& paramJson){
	deleteAll=true;
	loadProblemJson(inst, param, paramJson);
}

void MPdarp::loadProblemJson(const Instance * _instance, LNS_SCP_Parameters * _alnsParam, const string& paramJson){
	instance=_instance;
	alnsParam=_alnsParam;
	cst::fromJson(paramJson);
	for (int p = 0; p < (int)instance->getNbPeriods(); ++p) {
		Darp * darp=new Darp(_instance, _alnsParam, paramJson);
		vector<size_t> activeUsers;
		for(const User * user : instance->getUsers()){
			if(user->hasDemand(p)){
				activeUsers.push_back(user->getId());
			}
		}
		darp->getSol()->setActiveUsers(activeUsers);
		darp->getSol()->setNonInserted(activeUsers);
		darps.push_back(darp);
	}
	cout<<"load problem ... DONE" <<endl;
}


} /* namespace darp */

darp::MPdarp::~MPdarp() {
	for(auto * darp : darps){
		delete darp;
	}
	if(deleteAll){
		delete instance;
		delete alnsParam;
	}
}

void darp::MPdarp::readSolution(int period, std::string path) {
	darps[period]->getSol()->from_json(path_to_string(path));
}
