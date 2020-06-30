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
 
#include <iostream>
#include <cmath>
#include "Solution.h"
#include "../constant.h"
#include "Route.h"
#include "../lib/ppk_assert.h"
#include "Node.h"


using namespace std;

void Solution::check(bool verifyCompleteness,bool checkIdConfigParameters) const{
	if(cst::verbosite>1) cerr<<" >> Check solution "<< name<<"\n";

	for(auto route: routes)
		route->check(checkIdConfigParameters);

	route_id_duplicateTest();

	checkActiveUsers();

	if(cst::capacity_on_points)
		capaPointsTest();

	if(verifyCompleteness)
		solutionCompletnessTest();

	checkSolutionPerformance();

	//checkVehiculeFleet();

	if(cst::verbosite>1) cerr<<" >> Checker Ok"<<endl;
}


void Solution::checkVehiculeFleet() const{
	try{
		auto routesUsed = getRoutesUsed();
		std::vector<std::pair<int,const VehicleType*> > unfeasibleVehicles;
		for (auto& vehicle : inst->getVehicleTypes()){
			if(vehicle->getNbVehicles()!="unlimited"){
				int nbVehiclesUsed=0;
				for(auto& route :  routesUsed){
					if(route->getVehicle()->getId()==vehicle->getId())
						nbVehiclesUsed+=1;
				}
				if(nbVehiclesUsed > stoi(vehicle->getNbVehicles()))
					unfeasibleVehicles.push_back(make_pair(nbVehiclesUsed,vehicle));
			}
		}
		if(unfeasibleVehicles.size()>0)
			throw std::invalid_argument(formatJson("error","The number of vehicles used is higher than what is allowed", nullptr,std::vector<const User*>(),-1, unfeasibleVehicles));
	}
	catch(const std::exception& error)
	{
		cout<<error.what()<<endl;
		PPK_ASSERT(false);
	}

}

bool Solution::isActiveUser(size_t idUser) const{
	return find(activeUsers.begin(),activeUsers.end(),idUser)!=activeUsers.end();
}

void Solution::checkActiveUsers()  const {
	for (auto *route : routes) {
		for (auto * node : route->nodes) {
			if(node->getType()==nodeType::pickup)
				PPK_ASSERT(isActiveUser(node->getIdUser()),formatJson("internalError","Inserted user **id** "+to_string(node->getIdUser()) +" is not active"));
		}
	}
}


void Solution::solutionCompletnessTest()  const {
	try{
		std::vector<const User*> nonInserted;
		for (size_t idUser : activeUsers) {
			int nb_presence=0,position=0;
			for (auto *route : routes) {

				// verify the node is present in the solution
				position=0;
				for (auto * node : route->nodes) {
					if(node->getIdUser()==idUser && node->isPickup()) {
						nb_presence+=1;
					}
					position++;
				}
			}

			if (nb_presence==0)// warning if solution incompletness
				nonInserted.push_back(inst->getUser(idUser)); // this is to get the user information in the error handler
			else
				PPK_ASSERT_WARNING(nb_presence==1, "Node %i is present %i times in solution\n", (int)idUser, nb_presence);
		}

		if(nonInserted.size()>0)
			throw std::invalid_argument(formatJson("warning","Some users could not be inserted in the solution", nullptr, nonInserted));
	}
	catch(const std::exception& error)
	{
		cout<<error.what()<<endl; // its a warning
		//abort();
	}
}

void Solution::checkSolutionPerformance() const  {
	double total_cost=0;
	double total_irregularity=0;
	double objective_value=0;
	long total_RT=0;
	//verifier les distances pour les tournées
	for (size_t i = 0; i < getNbRoutes(); ++i) {
		const Route * t = getRoute_const(i);
		if (t->size()>2) {
			total_cost+=t->getCost();
			total_irregularity+=t->getIrregularity();
			objective_value+=t->getObjVal();
			total_RT+=t->getSumRT();
		}
		if(cst::GDARP_instance && t->size()==2){
			total_cost+=t->getCost();
		}
	}
	PPK_ASSERT(abs(this->getTotalCost()-cst::S2Dd(total_cost)) <= 0.01, formatJson("error","Invalid value of cost parameter in solution"));
	PPK_ASSERT(abs(this->getTotalIrreg()-cst::S2Dd(total_irregularity)) <= 0.01, formatJson("error","Invalid value of irreguarity parameter in solution"));
	PPK_ASSERT(abs(this->getObjectiveValue()-cst::S2Dd(objective_value)) <= 0.01, formatJson("error","Invalid value of irreguarity parameter in solution"));
}

void Solution::route_id_duplicateTest() const  {
	//verifier qu'il n'y a pas deux tour avec le meme id
	for (size_t i = 0; i < getNbRoutes(); ++i){
		PPK_ASSERT(i==getRoute(i)->id, formatJson("error","invalid route id compared to position " + to_string(i) + " in vector routes of solution",getRoute(i)));
		//PPK_ASSERT(i==getRoute(i)->id, "Invalid route id (=%i) compared to position in routes (=%i)",(int)i, (int)getRoute(i)->id );
		for (size_t j = i+1; j < getNbRoutes(); ++j){
			PPK_ASSERT(getRoute_const(i)->id!=getRoute_const(j)->id);
		}
	}
}

void Solution::capaPointsTest()  const {
	vector<int> count_cap_use, count_cap_veh;
	count_cap_use.resize(inst->getNbPoints(),0);
	count_cap_veh.resize(inst->getNbPoints(),0);

	for(auto * rout : routes){
		for(auto * nod : rout->nodes){
			count_cap_use[nod->getPointId()]+=nod->getUser()->getSumLoad();
			if (! nod->isDepotOut()){
				count_cap_veh[nod->getPointId()]+=1;
			}
		}
	}
	for (Point * p : inst->getPoints()){
		PPK_ASSERT(count_cap_use[p->getId()] <= p->getCapaUser(),formatJson("error","the cum capacity point > user, idPoint "+ to_string(p->getId())+" userCapacity " + to_string(p->getCapaUser())));
		PPK_ASSERT(count_cap_veh[p->getId()] <= p->getCapaVehi(),formatJson("error","the cum capacity point > vehicle, idPoint "+ to_string(p->getId())+" vehicleCapacity " + to_string(p->getCapaVehi())));
		//PPK_ASSERT(count_cap_use[p->getId()] <= p->getCapaUser(),"capacite point/user idPoint:%i capa:%i",(int)p->getId(),(int)p->getCapaUser());
		//PPK_ASSERT(count_cap_veh[p->getId()] <= p->getCapaVehi());
	}
}

void Solution::nodeIdTest() const {
	for (size_t pos = 0; pos < nodes.size(); ++pos) {
		PPK_ASSERT(nodes[pos]->getId()==pos);
		PPK_ASSERT(nodes[nodes[pos]->getIdsym()]->getIdsym()==pos);
	}
}


const char * Solution::formatJson(std::string type, std::string message, Route* route,
		const std::vector<const User*>& users, int nodePosition,const std::vector<std::pair<int, const VehicleType*> >& vehicles) const {

	string addInfo="";

	if(route!=nullptr)
		addInfo+=",\n \"idRoute\": "+ to_string(route->id);

	if(users.size()>0){
		addInfo+=",\n \"user\": [";
		string sep="\n";
			for(auto user : users){
				addInfo += sep +"{\"name\":\""+ user->getName() +"\""
						       + (nodePosition!=-1? ",  \"position\": "+ to_string(nodePosition):"")
						       + ", \"idJson\": " +  to_string((int)user->getIdJson())+"}";
				sep=",\n";
			}
		addInfo+="]";
	}

	if(vehicles.size()>0){
		addInfo+=",\n \"vehicles\": [";
		string sep="\n";
			for(auto pair : vehicles){
				auto vehicle=pair.second;
				addInfo += sep +"{\"name\": \"" + vehicle->getName()
						       + "\"  ,\" id \": " +  to_string((int)vehicle->getId())
						       +", \"nbVehicles\": \""+ vehicle->getNbVehicles() + "\", \"nbVehiclesUsed\": \" "+ to_string(pair.first)+"\" }";
				sep=",\n";
			}
		addInfo+="]";
	}


	// error v2
	std::string msg =  "{ \"message\" : \" " + message +" \" "+ addInfo +"}";
	json jmsg =  json::parse(msg);

	// error v1
	message="\n <json> {\n \"type\" :\"" + type + "\",\n \"message\" : \"" + message +"\""+ addInfo+ "\n } </json>";

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
