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
 
#include "../lib/json.hpp"
#include <iostream>
#include <sstream>
#include <fstream>
#include <math.h>

#include "LNSSCP_Parameters.h"

using namespace std;
using json = nlohmann::json;

//Constructor
LNS_SCP_Parameters::LNS_SCP_Parameters(const string & paramJson){
	// Stopping parameters
	maxNbIterations = 100000;
	maxRunningTime = 30000; //300 seconds per cluster

	timeLimitSCP=3;
	maxNbIterationSetCovering=1000; //1000;
	frecRateSCP=0.8;

	displayLogFrequency = 1; //1 printout iterations in console
	
	probabilityAcceptance=0.05;//0.05 record-to-record criterion
	
	PATH="./output/";

	maxDestroyPerc=0;
	minDestroyPerc=0;

	/************************* JSON UPDATE ******************************/

	json param = json::parse(paramJson);

	if (param.find("nbIterations") != param.end()){
		if (param.at("nbIterations").get<int>() >= 0)
			maxNbIterations=param.at("nbIterations").get<int>();
		else maxNbIterations=1000000;
	}
	if (param.find("nbIterationsSCP") != param.end())
		maxNbIterationSetCovering=param.at("nbIterationsSCP").get<int>();

	if (param.find("timeLimit") != param.end())
		maxRunningTime=param.at("timeLimit").get<double>();

	if (param.find("timeLimitSCP") != param.end())
		timeLimitSCP=param.at("timeLimitSCP").get<double>();

	if (param.find("displayLogFrequency") != param.end())
		displayLogFrequency = param.at("displayLogFrequency").get<int>();

	if (param.find("regularityToleranceSeconds") != param.end())
		toleranceRegularity = param.at("regularityToleranceSeconds").get<int>();

}

//Destructor
LNS_SCP_Parameters::~LNS_SCP_Parameters() {
}

std::string LNS_SCP_Parameters::toString(){ //std::string path) {
	std::stringstream s;

	s<<" Parameters: ";
	s<<"\n maxNbIterations\t"<<maxNbIterations;
	s<<"\n maxRunningTime \t"<<maxRunningTime; //300 seconds per cluster
	s<<"\n timeLimitSCP\t"<<timeLimitSCP;
	s<<"\n maxNbIterationSetCovering\t"<<maxNbIterationSetCovering; //1000;
	s<<"\n frecRateSCP\t"<<frecRateSCP;
	s<<"\n displayLogFrequency\t"<<displayLogFrequency; //1 printout iterations in console
	s<<"\n probabilityAcceptance\t"<<probabilityAcceptance;//0.05 record-to-record criterion
	s<<"\n Parameters: ";//alns parameters


	return s.str();

}

