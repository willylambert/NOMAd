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
 
#include "../instance/VehicleType.h"
#include <iostream>
#include <cmath>
#include "../constant.h"

using namespace std;

VehicleType::~VehicleType() {
	for (size_t i = 0; i < v_configuration.size(); ++i)
		delete v_configuration[i];
}

void VehicleType::addConfiguration(const std::vector<int>& configuration){
	auto c = new Configuration(v_configuration.size(),configuration.size());
	c->setCapacity(configuration);
	v_configuration.push_back(c);
}

std::bitset<64> VehicleType::getBitSet(const std::vector<int>& load) const {
	std::bitset<64> temp(0); // all bits to 0, b/0 it's 0 in binary
	int pos=getBitSetPosition(load);
	if(pos>=0){
		temp=cap_set[pos];
	}
	return temp;
}

int VehicleType::getBitSetPosition(const std::vector<int>& a) const{
	int pos=0;
	for(int i=0;i < (int)a.size();++i){
		pos+=a[i]*(int)pow(dim,i);  //-> bitset matrix is allways squared
		if(a[i] > cap_bounds[i]) {
			return -1;
		}
	}
	return pos;
}

void VehicleType::generateBitSet() {
	computeCapacityBounds();
	cap_set.resize((int)pow(dim,(int)v_configuration[0]->getNbUserType()));
	bool dominated=true;
	int count=1;
	std::vector<int> point(v_configuration[0]->getNbUserType(),0);
	for(auto& s : cap_set){
		for(auto& c : v_configuration){
			dominated=isDominated(point,c->getCapacity());
			if(dominated){
				s.set(c->getId());
			}
		}
		//counter
		for(size_t u=0;u< v_configuration[0]->getNbUserType();++u){
			if((count % (int)pow(dim,u)) == 0){
				point[u]++;
				if(point[u]>=dim) {
					point[u]=0;
				}
			}
		}
		count++;
	}
}

void VehicleType::printBitSet(){
	for(auto& s: cap_set){
		std::cout<<s<<" "<<std::endl;
	}
}

bool VehicleType::isDominated(const std::vector<int>& a, const std::vector<int>& b){
	bool dominated=true;
	if(a.size()==b.size()){
		for(size_t i=0; i<a.size();++i){
			if(a[i]>b[i]){
				dominated=false;
				break;
			}

		}
	}else{
		std::cout<<"ERROR points doesn't have same dimension "<<__FILE__<<__LINE__<<std::endl;
	}
	return dominated;
}

void VehicleType::computeCapacityBounds() {
	dim=0;
	cap_bounds.resize(v_configuration[0]->getNbUserType(),0);
	for(auto& c : v_configuration){
		int i=0;
		for(int Q :c->getCapacity()){
			if(Q > dim){
				dim=Q;
			}
			if(cap_bounds[i] < Q) {
				cap_bounds[i]=Q;
			}
			++i;
		}
	}
	++dim; //b/o 0 counts as another row if the bit set
}

void VehicleType::from_json(json jvehicle, const size_t & _id){
	id=_id;
	this->jvehicle=jvehicle.dump(2);
	id_json=jvehicle.at("id").get<size_t>();
	name=jvehicle.at("name").get<string>();
	distance_cost=jvehicle.at("cost_distance").get<double>();
	time_cost=jvehicle.at("cost_time").get<double>();
	fixed_cost=jvehicle.at("cost_fixed").get<double>();
	fixed_cost*=(double)cst::multiplier;
	auto it = jvehicle.at("capacity");
	for (size_t i=1; i <= it.size(); ++i) {
		addConfiguration(it.at("c"+to_string(i)).get<vector<int> >());
	}
	nbVehicles="unlimited";
	if(jvehicle.find("nbVehicles")!=jvehicle.end())
		nbVehicles=jvehicle.at("nbVehicles").get<std::string>();

	if(nbVehicles=="unlimited"){
		this->idDepot=-1;
	}else{
		PPK_ASSERT(this->getDepotId()>=0);
		this->idDepot=jvehicle.at("idDepot").get<int>();
	}
}

/*
 * Display vehicle information pretty printed
 */
std::ostream& operator<<(std::ostream& out, const VehicleType& f){
	out << "Vehicle type\t" << f.getId();
	for (size_t i = 0; i < f.getNbConfigurations(); ++i) {
		out<< "\t" <<*f.getConfiguration(i);
	}
	out << "idDepot"<<f.getDepotId()<<"\tfc:"<<f.getFixedCost()<< "\tdc:"<<f.getDistanceCost()<< "\ttc:"<<f.getTimeCost();
	return out;

}


