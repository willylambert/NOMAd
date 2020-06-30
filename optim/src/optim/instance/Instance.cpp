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
 
#include "Instance.h"

#include <iostream>
#include <sstream>


using namespace std;
using json = nlohmann::json;

void Instance::init(){
	calcMaxTime();  //-> computes maxtime var
	computeMaxVehicleCapacity(); //-> needed for bitset
	for(auto& v:vehicleTypes ){ //->needed in bitset test
		v->generateBitSet();
	}
	addStimeFixeToTimeMatrix();

	if(cst::checkInstance) this->check();
	if(cst::tightenTW) {
		int count=0;
		while(tightenTimeWindows()){
			if(cst::verbosite>1) std::cout<<"tightening TW:"<<count++<<std::endl;
			if(cst::checkAll)    this->check();
		}
	}
}

void Instance::addStimeFixeToTimeMatrix(){
	for(auto pJ: points){
		size_t j=pJ->getId();
		for(auto pI: points){
			size_t i=pI->getId();
			if(i!=j){
				time_ij[i][j]+=pJ->getStimeFixe();
			}
		}
	}
}

nodeType Instance::strToNodeType(std::string node) {
	if(node=="pickup") return nodeType::pickup;
	if(node=="delivery") return nodeType::delivery;
	if(node=="depotIn") return nodeType::depotIn;
	if(node=="depotOut") return nodeType::depotOut;
	else PPK_ASSERT(false, "wrong node type");
	return nodeType::pickup;
}

std::string Instance::nodeTypeToStr(nodeType node) {
	if(node==nodeType::pickup) return "pickup";
	if(node==nodeType::delivery) return "delivery";
	if(node==nodeType::depotIn) return "depotIn";
	if(node==nodeType::depotOut) return "depotOut";
	else PPK_ASSERT(false, "wrong node type");
	return "pickup";
}

void Instance::from_json(json& ins)
{
	//name
	PPK_ASSERT(ins.find("name")!=ins.end());
	name=ins.at("name").get<string>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	//usertypes
	PPK_ASSERT(ins.find("nbUserTypes")!=ins.end());
	nb_user_type=ins.at("nbUserTypes").get<size_t>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	//periods
	if (ins.find("periods")!=ins.end()){
		periods=ins.at("periods").get<vector<string>>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	}else{
		periods={""};
	}
	nbPeriods=periods.size();

	//nb max de reconfiguration (la valeur par defaut est 0)
	if (ins.find("nbReconfigurations")!=ins.end())
		maxNbReconfigurations=ins.at("nbReconfigurations").get<int>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	// Distance matrix & time matrix
	PPK_ASSERT(ins.find("distanceMatrix")!=ins.end());
	PPK_ASSERT(ins.find("timeMatrix")!=ins.end());
	vector<vector<double> > distance=ins.at("distanceMatrix").get< vector<vector<double> > >(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	vector<vector<double> > times=ins.at("timeMatrix").get< vector<vector<double> > >(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	distance_ij.resize(distance.size());
	time_ij.resize(times.size());
	for(size_t i=0 ; i < distance.size(); ++i){
		distance_ij[i].resize(distance[i].size());
		time_ij[i].resize(times[i].size());
		for(size_t j=0 ; j < distance.size(); ++j){
			distance_ij[i][j]=cst::D2L(distance[i][j]);
			time_ij[i][j]=cst::D2L(times[i][j]);
		}
	}

	nb_points=0;
	for (json& j : ins.at("points").get< vector<json> >()) { // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		points.push_back(new Point(j.dump(),nb_points++));
	}

	nb_users=0;
	for (json& j : ins.at("users").get< vector<json> >()) { // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		users.push_back(new User(j.dump(), nb_users++));
		if(cst::MPDARP) PPK_ASSERT(users.back()->getDemands().size()==nbPeriods);
	}

	nb_depots=0;
	for (json& j : ins.at("depots").get< vector<json> >()) { // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		depots.push_back(new Depot(j.dump(), nb_depots++));
	}

	// vehicles
	nb_vehicle_types=0;
	PPK_ASSERT(ins.find("vehicleTypes")!=ins.end());
	for (auto& jvehicle : ins.at("vehicleTypes").get< vector<json> >()){  // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		VehicleType* v = new VehicleType(jvehicle,nb_vehicle_types++);
		vehicleTypes.push_back(v);
	}

	//MPDAR : go (pickup consistency ); return (delivery consistency )
	if(ins.find("consistency")!=ins.end())
		for(auto node : ins.at("consistency").get<vector<string> >())
			consistency.push_back(strToNodeType(node)); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	//start for GDARP
	if(cst::GDARP_instance){
		PPK_ASSERT(ins.find("alpha")!=ins.end());
		alpha=ins.at("alpha").get<double>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	}
	//end for GDARP
	if(cst::verbosite>0) cout<<"[Instance] loaded\tnumber of users:"<< nb_users <<endl;
	init();
	forceTriangularInequality();
}

std::string Instance::to_json(std::string pathFile) const{
	if(pathFile!=""){
		ofstream myfile;
		myfile.open (pathFile);
		myfile << instanceJson;
		myfile.close();
	}
	return instanceJson;
}

void Instance::computeMaxVehicleCapacity(){
	maxcap.resize(nb_user_type);
	for(auto& vehicle : vehicleTypes){
		for (size_t i = 0; i < vehicle->getNbConfigurations(); ++i) {
			for(size_t u=0;u<nb_user_type; ++u){
				maxcap[u]=std::max(maxcap[u],vehicle->getConfiguration(i)->getCapacity()[u]);
			}
		}
	}
}


/**
 * Force the triangular inequality in time and distance matrix using Floyd-Warshall algorithm 1962
 */
void Instance::forceTriangularInequality() {
	size_t n=time_ij.size();
	for (size_t k = 0; k <n ; ++k){
		for (size_t i = 0; i <n ; ++i){
			for (size_t j = 0; j <n ; ++j){
				if(time_ij[i][j] > time_ij[i][k]+time_ij[k][j]){
					time_ij[i][j] = time_ij[i][k]+time_ij[k][j];
					distance_ij[i][j]=distance_ij[i][k]+distance_ij[k][j];
				}
			}
		}
	}
}


Instance::~Instance() {
	for (auto  use :   users) 		 delete use;
	for (auto vehicle: vehicleTypes) delete vehicle;
	for (auto point:   points) 		 delete point;
	for (auto depot:   depots)		 delete depot;
}


long Instance::arrival_time_from_depot(const Itinerary *it, size_t dep, size_t type){

	//Choses vector used to compute result and init result
	if (type%2==0) {
		return time_ij[dep][it->get_pickup()];
	}
	else{
		return time_ij[dep][it->get_delivery()];
	}
}

std::vector<const VehicleType*> Instance::getVehiclesWithUnlimitedQuantity() const {
	std::vector<const VehicleType*> listUnlimited;
	for(auto& v : vehicleTypes){
		if(v->getNbVehicles()=="unlimited"){
			listUnlimited.push_back(v);
		}
	}
	return listUnlimited;
}
std::vector<const VehicleType*> Instance::getVehiclesSortedByQuantity() const {
	std::vector<const VehicleType*> list;
	std::vector<const VehicleType*> listUnlimited;

	// include vehicles with limited capacity and sort them
	for(auto& v : vehicleTypes){
		if(v->getNbVehicles()!="unlimited"){
			list.push_back(v);
		}else{
			listUnlimited.push_back(v);
		}
	}
	std::sort(list.begin(), list.end(),
    [](const VehicleType* a, const VehicleType* b) -> bool {
		return a->getNbVehiclesInt() < b->getNbVehiclesInt();});

	// add vehicle with unlimited capacity
	list.insert(list.end(),listUnlimited.begin(),listUnlimited.end());

	if(cst::verbosite>1)
		for(auto v : list)
			std::cout<<"vehicle id "<<v->getId()<<" "<<v->getNbVehicles()<<std::endl;

	return list;
}


std::ostream& operator<<(std::ostream& out, Instance& inst){
	out<<inst.serialize(10,false);
	return out;
}

string Instance::serialize(size_t loop_limite, bool display_matrix) const {
	stringstream ss;
	ss<<"**************** Instance ****************"<<endl;
	ss << "n: " << nb_users <<endl;
	ss << "mt: " << nb_depots <<endl;
	ss << "u: " << nb_user_type <<endl;
	ss << endl << "Requests:" << endl;
	//ss << requestNodes[0]->Title_cout();
	for (size_t i = 0; i < nb_users; ++i) {
		if (i==loop_limite){
			ss << "\t...->"<<nb_users<<endl;
			break;
		}
		ss << *users[i] <<endl;
	}
	for (size_t i = 0; i < nb_depots; ++i) {
		if (i==loop_limite){
			ss << "\t...->"<<nb_depots<<endl;
			break;
		}
		ss << *depots[i] <<endl;
	}


	ss << endl << "Vehicle:" << endl;
	for (auto& vehicle : vehicleTypes) {
		ss << *vehicle <<endl;
	}

	if(display_matrix){
		ss << endl << "t_ij:" << endl;
		for (size_t i = 0; i < nb_points; ++i) {
			if (i==loop_limite){
				ss << "\t...->"<<nb_points<<endl;
				break;
			}
			for (size_t j = 0; j < nb_points; ++j) {
				if (j==loop_limite){
					ss << "...->"<<nb_points<<endl;
					break;
				}
				ss << time_ij[i][j]<< "\t" ;
			}
			ss << endl;
		}

		ss << endl << "d_ij:" << endl;
		for (size_t i = 0; i < nb_points; ++i) {
			if (i==loop_limite){
				ss << "\t...->"<<nb_points<<endl;
				break;
			}
			for (size_t j = 0; j < nb_points; ++j) {
				if (j==loop_limite){
					ss << "...->"<<nb_points<<endl;
					break;
				}
				ss << distance_ij[i][j]<< "\t" ;
			}
			ss << endl;
		}
		ss <<endl;
	}
	ss << endl;
	return ss.str();
}

void Instance::calcMaxTime(){
	maxtime=0;
	for (size_t i = 0; i < time_ij.size(); ++i)
	{
		for (size_t j = 0; j < time_ij[i].size(); ++j)
		{
			if(time_ij[i][j] > maxtime)
				maxtime=time_ij[i][j];
		}
	}
}

const VehicleType* Instance::getVehicleTypeJson(const size_t & idVtJson) const{
	for(const VehicleType * vt: vehicleTypes){
		if(vt->getIdJson()==idVtJson)
			return vt;
	}
	return nullptr;
}
