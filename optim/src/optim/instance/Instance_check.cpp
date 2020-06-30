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
 
#include "../instance/Instance.h"
#include "../lib/ppk_assert.h"
#include <iostream>
#include <stdlib.h>
#include <sstream>

using namespace std;


void Instance::check() const {
	checkAttributesConsistency();
	checkTriangularInequality();
	checkPickupAndDeliveryTimeWindows();
	checkRideTimeConstraints();
}

/*************************************** Check ******************************************/

void Instance::checkAttributesConsistency() const {
	PPK_ASSERT(nb_users==users.size(),formatJson("internalError","checkAttributesConsistency()"));
	PPK_ASSERT(nb_depots==depots.size());
	for (auto * use : users) {
		PPK_ASSERT(use->getLoad().size()==nb_user_type);
		PPK_ASSERT(use->getItineraries().size()>0);
	}
	for (auto * depot : depots) {
		PPK_ASSERT(depot->getLoad().size()==nb_user_type);
		PPK_ASSERT(depot->getItineraries().size()>0);

	}

	// check there is at least one vehicle able to hanle de type of users
	bool feasible=false;
	for(auto v : vehicleTypes){
		for(auto c : v->getConfigurations())
			if(c->getCapacity().size()==nb_user_type){
				feasible=true;
				break;
			}
	}
	if(!feasible)
		throw std::invalid_argument(formatJson("error","there is not vehicle to handle " + to_string(nb_user_type) + " user types"));
}

void Instance::checkTriangularInequality() const {
	try{
		std::vector<std::string> list;
		size_t n = distance_ij.size();
		PPK_ASSERT(time_ij.size()==n,"the size of the matrix (time and distance) are not the same");
		for (size_t k = 0; k <n ; ++k){
			PPK_ASSERT(time_ij[k].size()==n,"the size of the time matrix is not correct");
			PPK_ASSERT(distance_ij[k].size()==n,"the size of the distance matrix is not correct");
			for (size_t i = 0; i <n ; ++i){
				for (size_t j = 0; j <n ; ++j){
					if(time_ij[i][j] > (time_ij[i][k]+time_ij[k][j]))
						list.push_back("\"It is shorter to pass by point " + std::to_string(k) + " than going directly from "+ std::to_string(i) + " to " + std::to_string(j)+"\"");
					//V1 //PPK_ASSERT_WARNING(time_ij[i][j] <= (time_ij[i][k]+time_ij[k][j]),formatJson("warning",message));
				}
			}
		}
		if(list.size()>0)
			throw std::invalid_argument(formatJson("warning","the triangular inequality is not respected",std::vector<User*>(),list));
	}
	catch(const std::exception& msg){
		cst::clusterRemoval=false;
		if(cst::verbosite > 1){
			std::cerr<<msg.what()<<std::endl;
		}else{
			std::cerr<<formatJson("warning","the triangular inequality is not respected but now is Fixed")<<std::endl;
		}
	}
}

void Instance::checkPickupAndDeliveryTimeWindows() const {
	std::vector<User*> unfeasibleUser;
	std::vector<User*> unfeasibleUserInDepots;
	std::vector<string> unfeasibleDepots;

	for (auto * user : users) {

		// time windows for users
		bool feasibleTWs=false;
		bool feasibleDepot=false;
		for (auto * it : user->getItineraries()){
			long tij = time_ij[it->get_pickup()][it->get_delivery()];
			if((it->b_delivery()-(it->a_pickup()+it->get_st_pick()))>=tij
					&& it->b_delivery()>=it->a_pickup()){
				feasibleTWs=true;
			}

			// verifying depots
			bool feasibleDepotRT=false;
			for(auto& depot : depots){
				for (auto * it_dp : depot->getItineraries()){
					long tij_dp_to_p = time_ij[it_dp->get_pickup()][it->get_pickup()];
					long tij_p_to_d = time_ij[it->get_pickup()][it->get_delivery()];
					long tij_d_to_dp = time_ij[it->get_delivery()][it_dp->get_delivery()];

					auto arrival_to_p = it_dp->a_pickup()+it_dp->get_st_pick() +tij_dp_to_p;
					auto arrival_to_d = arrival_to_p + it->get_st_pick() + tij_p_to_d;
					auto arrival_to_dp = arrival_to_d + tij_d_to_dp;

					// eval time windows
					if(arrival_to_p <= it->b_pickup() &&
							arrival_to_d <= it->b_delivery() &&
							arrival_to_dp <= it_dp->b_delivery()){
						feasibleDepot=true;
					}

					// eval ride time
					long tij = time_ij[it_dp->get_pickup()][it_dp->get_delivery()];
					if(	it->getMaxRT() >= tij ){
						feasibleDepotRT=true;
					}
					if(!feasibleDepotRT)
						unfeasibleDepots.push_back("{ \"name\" : \""+ depot->getName() + "\", \"id\": "+ to_string(depot->getIdJson())+ ", \"MaxRT\": "+ to_string(it->getMaxRT())+ "}");
				}
			}
		}

		if(!feasibleTWs)
			unfeasibleUser.push_back(user);

		if(!feasibleDepot)
			unfeasibleUserInDepots.push_back(user);

	}

	if(unfeasibleUser.size()>0){
		throw std::invalid_argument(formatJson("error","The pickup and delivery windows are very close to each other. It is not possible to go from pickup to delivery within the available time", unfeasibleUser));
	}

	if(unfeasibleUserInDepots.size()>0){
		throw std::invalid_argument(formatJson("error","Time windows of depots are too close that some users cannot be served", unfeasibleUserInDepots));
	}

	if(unfeasibleDepots.size()>0){
		throw std::invalid_argument(formatJson("error","The maximum ride time of depot cannot be respected ",std::vector<User*>(), unfeasibleDepots));
	}
}

void Instance::checkRideTimeConstraints() const {
	std::vector<User*> unfeasibleUsers;
	std::vector<string> unfeasibleUsersValues;
	for (auto * user : users) {
		bool feasibleRideTime=false;
		Itinerary* failIt=nullptr;
		for (auto * it : user->getItineraries()) {

			// verifying ride times for users
			long tij = time_ij[it->get_pickup()][it->get_delivery()];
			if(	it->getMaxRT() >= tij )
				feasibleRideTime=true;
			else
				failIt=it;

		}
		if(!feasibleRideTime){
			unfeasibleUsers.push_back(user);
			unfeasibleUsersValues.push_back("{ \"name\" : \""+ user->getName() + "\", \"maxRideTime\": "+ to_string(failIt->getMaxRT())+ ", \"RideTime\": "+ to_string(time_ij[failIt->get_pickup()][failIt->get_delivery()])+ "}");
		}
	}

	if(unfeasibleUsers.size()>0){ //unfeasibleUsers
		throw std::invalid_argument(formatJson("error","The maximum Ride time is too short that cannot be respected for some users", std::vector<User*>(), unfeasibleUsersValues));
	}
}



// v3
const char * Instance::formatJson(std::string type, std::string message, std::vector<User*> users, std::vector<string> mesg) const {
	string addInfo="";
	string sep="";

	if(users.size()>0){
		addInfo+=",\n \"users\": [";
		sep="\n";
		for(auto user : users){
			addInfo += sep +"{\"name\": \"" +  user->getName()
							//+ "\", \"id\": "+  to_string((int)user->getId())
							+   "\", \"idJson\": " +  to_string((int)user->getIdJson())
							+"}";
			sep=",\n";
		}
		addInfo+="]";
	}

	if(mesg.size()>0){
		addInfo+=",\n \"details\": [";
		sep="\n";
		for(auto msg : mesg){
			addInfo += sep + msg;
			sep=",\n";
		}
		addInfo+="]";
	}



	// error v2
	std::string msg =  "{ \"message\" : \" " + message +" \" "+ addInfo +"}";
	cout<<msg<<endl;
	json jmsg =  json::parse(msg);

	// error v1
	message ="\n<json> {\n \"type\" :\"" + type + "\",\n \"message\" : \"" + message +"\""+ addInfo + "\n} </json>";

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
