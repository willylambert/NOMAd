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
 
#include "Route.h"
#include <sstream>

using namespace std;

void Route::reinitErrors(){
	timeWindowErrors.clear();
	rideTimeErrors.clear();
	noVehicleCapable=false;
	vehicleCapacityErrors.clear();
	nbReconfigurationErrors.clear();
}

void Route::reinitTimeErrors(){
	timeWindowErrors.clear();
	rideTimeErrors.clear();
}

void Route::addTimeWindowsError(const int & i){
	timeWindowErrors.push_back(i);}

void Route::addRideTimeError(const int & i){
	if(rideTimeErrors.empty() || rideTimeErrors.back()!=i)
		rideTimeErrors.push_back(i);}

bool Route::isTimeFeasible() const{
	return timeWindowErrors.empty()
			&& rideTimeErrors.empty();}

void Route::setNoVehicleCapable(){
	noVehicleCapable=true;}

void Route::setReconfigurationErrors(const int & i){
	nbReconfigurationErrors.push_back(i);}

void Route::setVehicleCapacityErrors(const int & i){
	vehicleCapacityErrors.push_back(i);}

bool Route::isCapacityFeasible() const{
	return !noVehicleCapable && nbReconfigurationErrors.empty()
			&& vehicleCapacityErrors.empty();}

bool Route::isFeasible() const{
	return isTimeFeasible() && isCapacityFeasible();}

std::string Route::errors_to_json() const{
	json j;
	j["timeWindowErrors"]=timeWindowErrors;
	j["rideTimeErrors"]=rideTimeErrors;
	j["noVehicleCapable"]=noVehicleCapable;
	j["vehicleCapacityErrors"]=vehicleCapacityErrors;
	j["nbReconfigurationErrors"]=nbReconfigurationErrors;
	string s=j.dump();
	return s;
}


const char * Route::formatJson(std::string type, std::string message, bool infoRoute, Node* _node, size_t position, bool infoVehicle) const{
	string addInfo="";

	if(infoRoute)
		addInfo+=",\n \"idRoute\": "+ to_string(id);

	if (_node!=nullptr)
		addInfo+= ",\n \"position\": "+ to_string(position)+",\n \"name\": \""+ this->nodes[position]->getUser()->getName()
		+ "\",\n \"idUserJson\": " +  to_string(_node->getIdUserJson());

	if (infoVehicle)
		addInfo+= ",\n \"vehicle\":" + vt->to_json();


	// error v2
	std::string msg =  "{ \"message\" : \" " + message +" \" "+ addInfo +"}";
	json jmsg =  json::parse(msg);

	// error v1
	message="\n<json> {\n \"type\" : \"" + type + "\",\n \"message\" :\"" + message +"\""+ addInfo + "\n } </json>";


	// open parse
	std::ifstream ifs("logs.json");
	std::stringstream buffer;
	buffer << ifs.rdbuf();
	std::string s = buffer.str();
	ifs.close();

	// append errors
	nlohmann::json j;
	if(s!="")
		j = nlohmann::json::parse(s);
	j[type].push_back(jmsg);

	// save in file
	std::ofstream myfile;
	myfile.open ("logs.json",std::ios_base::trunc);
	myfile << j.dump(2);
	myfile.close();
	return message.c_str();
}


const char * Route::formatJsonU(std::string type, std::string message, bool infoRoute,const User* _user, int idItinerary) const{
	string addInfo="";

	if(infoRoute)
		addInfo+=",\n \"idRoute\": "+ to_string(id);
//	if(infoRoute)
//		addInfo+=",\n \"route\": \" "+ this->str_tour() + "\"";

	if (_user!=nullptr)
		addInfo+= ",\n \"user\": \""+ _user->getName()
				+ "\",\n \"idUserJson\": " + to_string(_user->getIdJson());

	if (idItinerary!=-1)
		addInfo+= ",\n \"itinerary\": " + _user->getItineraries()[idItinerary]->to_json();

	// error v2
	std::string msg =  "{ \"message\" : \" " + message +" \" "+ addInfo +"}";
	json jmsg =  json::parse(msg);

	// error v1
	message="\n<json> {\n \"type\" : \"" + type + "\",\n \"message\" :\"" + message +"\""+ addInfo + "\n } </json>";

	// open parse
	std::ifstream ifs("logs.json");
	std::stringstream buffer;
	buffer << ifs.rdbuf();
	std::string s = buffer.str();
	ifs.close();

	// append errors
	nlohmann::json j;
	if(s!="")
		j = nlohmann::json::parse(s);
	j[type].push_back(jmsg);

	// save in file
	std::ofstream myfile;
	myfile.open ("logs.json",std::ios_base::trunc);
	myfile << j.dump(2);
	myfile.close();
	return message.c_str();


}

