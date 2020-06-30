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


#include "constant.h"
#include <sstream>
#include <limits>
#include <fstream>

#include "lib/json.hpp"
#include "lib/lib_tools.h"

using json = nlohmann::json;

bool cst::capacity_on_points=false;

// MPDARP
double cst::alpha=1.0;
bool cst::MPDARP=false;
bool cst::minConsistency=true;
long cst::deltaIrreg = 10*60;      /**<  time consistency is respected within  [time +/- deltaIrreg]*/
bool cst::maxNbReconfigurations=false;

long cst::multiplier = 1;
bool cst::displayTitle= false;
bool cst::GDARP_instance= false;
std::string cst::path_stop_file="";
std::string cst::path_export_best_sol="";
std::string cst::path_final_results="";
std::string cst::path_refSol="";

bool cst::clusterRemoval=false;

bool cst::allOperators=false;
bool cst::allPreOperators=false;
bool cst::pool=false; // true is aborted in execution
bool cst::python=false;

#ifdef DEBUG
bool cst::checkAll= true;  /**< Activates a solution checker for every iteration*/
int cst::verbosite = 1;
bool cst::checkerAbort=true; /**< abort if the checker returns false */
bool cst::checkFinal=true; /**< check the final solution */
#else
bool cst::checkAll= false;
int cst::verbosite = 0;
bool cst::checkerAbort=false;
bool cst::checkFinal=true;
#endif

//used in the toString method
std::string cst::pathInst="";  // this variable is updated in the main
std::string cst::pathVehicle="";  // this variable is updated in the main

std::string cst::toString(){ //std::string path) {
	std::stringstream s;

	s<<"\n pathInst\t"<<pathInst;    /**< Activates a solution checher for every iteration*/
	s<<"\n pathVehicle\t"<<pathVehicle;    /**< Activates a solution checher for every iteration*/

	s<<"\n checkAll\t"<<checkAll;    /**< Activates a solution checher for every iteration*/
	s<<"\n maxNbReconfigurations\t"<<maxNbReconfigurations;  /**< Activates a constraint limiting the number of reconfigurations allowed in route */
	s<<"\n verbosite\t"<<verbosite;
	s<<"\n checkerAbort\t"<<checkerAbort;			/**< abort if the checker return false */
	s<<"\n checkFinal\t"<<checkFinal;				/**< check the final solution */

	s<<"\n displaySol\t"<<displaySol;  /**< prints out routes and cost in console */

	s<<"\n clusterRemoval\t"<<clusterRemoval;
	s<<"\n allOperator\t"<<allOperators;

	s<<"\n capacity_on_points\t"<<capacity_on_points;
	s<<"\n MPdarp\t"<<MPDARP;

	return s.str();
}

std::ostream& operator<<(std::ostream& out, const cst& f){
	out<<"************* Parameters Algo \n";
	out << f.toString();
	return out;
}

void cst::fromJson(const std::string & paramJson){
	cst::python=false;
	cst::MPDARP=false;
	cst::minConsistency=false;
	cst::GDARP_instance=false;

	json param = json::parse(paramJson);

	if (param.find("checkAll")!=param.end())
		cst::checkAll=param.at("checkAll").get<bool>();
	if (param.find("verbosite")!=param.end())
		cst::verbosite=param.at("verbosite").get<int>();
	if (param.find("displayTitle")!=param.end())
		cst::displayTitle=param.at("displayTitle").get<bool>();
	if (param.find("poolOfRoutes")!=param.end())
		cst::pool=param.at("poolOfRoutes").get<bool>();
	if (param.find("multiplier")!=param.end())
		cst::multiplier=param.at("multiplier").get<long>();
	if (param.find("maxNbReconfigurations")!=param.end())
		cst::maxNbReconfigurations=param.at("maxNbReconfigurations").get<bool>();
	if (param.find("allOperators")!=param.end())
		cst::allOperators=param.at("allOperators").get<bool>();
	if (param.find("GDARP_instance")!=param.end())
		cst::GDARP_instance=param.at("GDARP_instance").get<bool>();
	if (param.find("capacity_on_points")!=param.end())
		cst::capacity_on_points=param.at("capacity_on_points").get<bool>();
	if (param.find("path_stop_file")!=param.end())
		cst::path_stop_file=param.at("path_stop_file").get<std::string>();
	if (param.find("path_export_best_sol")!=param.end())
		cst::path_export_best_sol=param.at("path_export_best_sol").get<std::string>();
	if (param.find("path_final_results")!=param.end())
		cst::path_final_results=param.at("path_final_results").get<std::string>();
	if (param.find("path_refSol")!=param.end())
		cst::path_refSol=param.at("path_refSol").get<std::string>();

	PPK_ASSERT(cst::multiplier>0, messageJson("error","you should set the multiplier to a value bigger than 0"));  // if multDist=0 infinite loop
	if (param.find("python")!=param.end())
		cst::python=param.at("python").get<bool>();
	if (param.find("MPDARP")!=param.end())
		cst::MPDARP=param.at("MPDARP").get<bool>();
	if (param.find("minConsistency")!=param.end())
		cst::minConsistency=param.at("minConsistency").get<int>();
	if (param.find("regularityToleranceSeconds")!=param.end())
		cst::deltaIrreg=param.at("regularityToleranceSeconds").get<long>();


}
