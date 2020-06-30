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
#include <bitset>
#include <iostream>

const VehicleType* Route::performCapacityTest(const std::vector<Node*> & vnode,
		std::vector<std::pair<double ,const VehicleType*>> lvehicles,
		long _distance) {
	nodesCap=&vnode;
	vehiclesCap=lvehicles;
	distanceCap=_distance;
	std::vector<int> dominantNodes=getDominantNodes();
	const VehicleType* minCostVehicle=nullptr;
	double minCost=INT_MAX, cost=0;
	for(auto& vehicle: vehiclesCap){
		if(isFesibleVehicle(vehicle.second,dominantNodes)){
			cost = vehicle.second->getFixedCost()+vehicle.second->getDistanceCost()*cst::L2D(distanceCap);
			if(cost < minCost){ //selecting the min cost vehicle
				minCostVehicle=vehicle.second;
				vehicle.first=cost;
				minCost=cost;
			}
			return minCostVehicle;
		}
	}
	return minCostVehicle;
}

bool Route::isFesibleVehicle(const VehicleType* vt,
		const std::vector<int>& dominantNodes) {
	std::bitset<64> s;
	std::bitset<64> e;
	e.flip();
	int r=0;
	for(int i : dominantNodes ){
		s=vt->getBitSet(L[i]);
		if(s==0){  // capacity test
			return false;
		}
		e = e & s; // max nb_reconfigurations
		if(e==0){
			r++;
			if(r > inst->getMaxNbReconfigurations() && cst::maxNbReconfigurations)
				return false;
			e=s;
		}
	}
	nbReconfigurationsCap=r;  //important
	return true;
}

bool Route::isFesibleVehicleEvalMode(const VehicleType* vt) {
	std::bitset<64> s;
	std::bitset<64> e;
	e.flip();
	int r=0;
	for (int i = 1; i < (int)sizeCap(); ++i) {
		s=vt->getBitSet(L[i]);
		if(s==0){  // capacity test
			setVehicleCapacityErrors(i);
		}
		e = e & s; // max nb_reconfigurations
		if(e==0){
			r++;
			if(r > inst->getMaxNbReconfigurations() && cst::maxNbReconfigurations)
				setReconfigurationErrors(i);
			e=s;
		}
	}
	nbReconfigurationsCap=r;  //important
	return true;
}

bool Route::isFesibleVehicleChecker(const VehicleType* vt) const {
	std::vector<int> v(inst->getNbUserType(),0);
	std::vector< std::vector<int> > L(sizeCap(),v);
	std::bitset<64> s;
	std::bitset<64> e;
	e.flip();
	int r=0;
	for (int i = 1; i < (int)sizeCap(); ++i) {
		for (size_t u = 0; u < inst->getNbUserType(); ++u) {
			L[i][u]=L[i-1][u]+niSol(i)->l(u);
		}

		s=vt->getBitSet(L[i]);
		if(s==0){  // capacity test
			return false;
		}
		e = e & s; // max nb_reconfigurations
		if(e==0){
			r++;
			if(r > inst->getMaxNbReconfigurations() && cst::maxNbReconfigurations)
				return false;
			e=s;
		}
	}
	//nbReconfigurationsCap=r;
	return true;
}


const std::vector<int> Route::getDominantNodes() {
	lCap.resize(inst->getNbUserType(),0); // s
	L.resize(sizeCap(),lCap); 							 // load profile														// compute new demands in the route
	std::vector<int> dominantNodes;  				// start in the origin
	for (int i = 1; i < (int)sizeCap(); ++i) {
		for (size_t u = 0; u < inst->getNbUserType(); ++u) {
			L[i][u]=L[i-1][u]+niSol(i)->l(u);
		}
		if(isInType(i) && isOutType(i-1)) {
			dominantNodes.push_back(i-1);
		}
	}
	return dominantNodes;
}

int Route::computeNbReconfigurations(std::vector<std::bitset<64> >& configurations){
	auto cont=0;
	idconfigurationCap.clear();
	idconfigurationCap.resize(sizeCap(),-1); //useless ?
	std::vector<std::bitset<64> > s(configurations.size(),0);
	s[0].flip(); // set to 1
	auto last=configurations.size();
	for(size_t i=1; i< last; ++i){
		s[i]=configurations[i]&s[i-1];
		if(s[i]==0){
			cont++;
			s[i]=configurations[i];
		}
	}
	return cont;
}


int Route::getConfigurationId(std::bitset<64> b){
	int idx = 0;
	while (idx < (int)b.size() && !b[idx]) {
		++idx;
	}
	return idx;
}


void Route::updateLoadParameters() {
	for (size_t i = 0; i < sizeCap(); ++i) {
		niSol(i)->load=L[i];
	}
	L.clear();
}

void Route::setIdConfigParameters(Route* r){
	nodesCap=&r->nodes;
	getDominantNodes();
	nbReconfigurationsCap=0;
	idconfigurationCap.clear();
	idconfigurationCap.resize(sizeCap(),-1);
	std::bitset<64> s,e,ep;
	e.flip();
	for(int i =0 ; i<(int) sizeCap() ; ++i){
		s=r->getVehicle()->getBitSet(L[i]);
		if(s==0){  // capacity test
			PPK_ASSERT(false,formatJson("internalError","Infeasible vehicle", true, nullptr,-1 ,true));
		}
		ep=e;
		e = ep & s; // max nb_reconfigurations
		if(e==0){
			for (int j = i-1; j >= 0; --j) {
				if(idconfigurationCap[j]==-1)
					idconfigurationCap[j]=getConfigurationId(ep);
				else break;
			}
			e=s;
			nbReconfigurationsCap++;
		}
	}

	for (int j = static_cast<int>(sizeCap())-1; j >= 0; --j) {
		if(idconfigurationCap[j]==-1)
			idconfigurationCap[j]=getConfigurationId(ep);
		else break;
	}

	e=s;
	for (size_t i = 0; i < sizeCap(); ++i) {
		niSol(i)->setIdConfig(idconfigurationCap[i]);
	}
	L.clear();
	r->setNbreconfigurations(nbReconfigurationsCap);  //usefull pour l'affichage
}


void Route::updateVehicleListWithFeasibleVehicles(
		std::vector<Node*> & vnode,
		std::vector<std::pair<double, const VehicleType*> >& vehicles) {
	nodesCap=&vnode;
	std::vector<int> dominantNodes=getDominantNodes();
	for(std::vector<std::pair<double, const VehicleType*>>::iterator itr = vehicles.begin();
			itr != vehicles.end();){
		std::pair<double, const VehicleType*> vehicle =*itr;
		if (isFesibleVehicle(vehicle.second,dominantNodes))
			++itr;
		else
			itr=vehicles.erase(itr);
	}
}


void Route::printLoadProfile(){
	for (size_t i = 0; i < sizeCap(); ++i) {
		std::cout<<niSol(i)->getId()<<"\t"<<niSol(i)->posInRou;
		for (size_t u = 0; u < inst->getNbUserType(); ++u) {
			std::cout<<"\t"<<L[i][u];
		}
		std::cout<<std::endl;
	}
	std::cout<<"-------"<<std::endl;
}

