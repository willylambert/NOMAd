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
#include "../lib/ppk_assert.h"

using namespace std;


void Route::data_pos_id_test()  const {
	size_t j=0;
	for (auto nj : nodes) {
		PPK_ASSERT(*(nj->id_round)==id, formatJson("error","invalid id value in node"+to_string(j),true,nj,j)); //tout les nodesInSol ont le bon tour associe
		PPK_ASSERT(nj->posInRou==j, formatJson("error","invalid position value in node",true,nj,j)); //tout les nodesInSol ont le bon tour associe
		PPK_ASSERT(*nodes[*nodes[j]->posSymInRou]->posSymInRou== j, formatJson("error","invalid posym value in node",true,nj,j)); //tout les nodesInSol ont le bon tour associe
		j++;
	}
}

void Route::timeTest()  const {
	Node *nj,*njp;
	if (nodes.size()>2)
	{
		//le dernier
		nj=nodes[(int)nodes.size()-1];

		PPK_ASSERT(nj->time <= nj->b(), formatJson("error","the begin of service of the node violates its time window upper value",true,nj,(int)nodes.size()-1));
		PPK_ASSERT(nj->time >= nj->a(), formatJson("error","he begin of service of node violates its time window lower value",true,nj,(int)nodes.size()-1));

		//les autres
		for (size_t j = 0; j < nodes.size()-1; ++j) {
			nj=nodes[j];
			njp=nodes[j+1];

			PPK_ASSERT(nj->time <= nj->b(), formatJson("error","the begin of service of the node violates the time window upper value",true,nj,(int)nodes.size()-1));
			PPK_ASSERT(nj->time >= nj->a(), formatJson("error","the begin of service of the node violates the time window lower value",true,nj,(int)nodes.size()-1));
			PPK_ASSERT(nj->time + inst->getTime(nj->getPointId(),njp->getPointId()) +nj->getStime() <= njp->time,formatJson("error","invalid value of service time in node",true,njp,(int)j+1));
		}

		//duration
		long _duration=0;

		//long distance=0;
		_duration=nodes[nodes.size()-1]->time - nodes[0]->time;
		PPK_ASSERT(_duration == duration, formatJson("internalError","parameter duration of route is incorrect"));
		//PPK_ASSERT(_duration == duration, "Route %i: invalid duration parameter",(int)id);

		//maximum riding time constraint
		for (size_t j = 0; j < nodes.size(); ++j) {
			nj=nodes[j];
			if (nj->isPickup()) {
				int posym=-1;
				for (size_t k = 0; k < nodes.size(); ++k) {
					if (nodes[k]->getId()==nj->getIdsym()) {
						posym=(int)k;
					}
				}
				long maxrt=nodes[posym]->time - nj->time  -nj->getStime();
				PPK_ASSERT(maxrt <= nj->getMaxRT(), formatJson("error","The maximum ride time constraint is violated",true,nj,j));
			}
		}

		// route duration
		auto routeDuration=getDuration();
		auto minDuration=computeMinRouteDuration();
		PPK_ASSERT(routeDuration==minDuration,formatJson("internalError","the duration computed by the toolbox is different from the duration parameter",true));
	}
}

// do not remove this method please
void Route::timeTest_T()  const {
	Node *nj,*next;
	auto j=(int)nodes.size()-1;
	nj=nodes[j];
	PPK_ASSERT(T[j] <= nj->b(), formatJson("error","the begin of service of the node violates its time window upper value",true,nj,(int)nodes.size()-1));
	PPK_ASSERT(T[j] >= nj->a(), formatJson("error","he begin of service of node violates its time window lower value",true,nj,(int)nodes.size()-1));
	//les autres
	for (size_t j = 0; j < nodes.size()-1; ++j) {
		nj=nodes[j];
		next=nodes[j+1];
		PPK_ASSERT(T[j]<= nj->b(), formatJson("error","the begin of service of the node violates the time window upper value",true,nj,(int)nodes.size()-1));
		PPK_ASSERT(T[j] >= nj->a(), formatJson("error","the begin of service of the node violates the time window lower value",true,nj,(int)nodes.size()-1));
		PPK_ASSERT(T[j] + inst->getTime(nj->getPointId(),next->getPointId()) +nj->getStime() <= T[j+1],formatJson("error","invalid value of service time in node",true,next,(int)j+1));
	}

	//maximum riding time constraint
	for (size_t j = 0; j < nodes.size(); ++j) {
		nj=nodes[j];
		if (nj->isPickup()) {
			int posym=-1;
			for (size_t k = 0; k < nodes.size(); ++k) {
				if (nodes[k]->getId()==nj->getIdsym()) {
					posym=(int)k;
				}
			}
			long maxrt=T[posym]- T[j] -nj->getStime();
			PPK_ASSERT(maxrt <= nj->getMaxRT(), formatJson("error","The maximum ride time constraint is violated",true,nj,j));
		}
	}

	// route duration
	auto routeDuration=getDurationT();
	auto minDuration=computeMinRouteDuration();
	PPK_ASSERT(routeDuration==minDuration,formatJson("internalError","the duration computed by the toolbox is different from the duration parameter",true));
}

void Route::vehiclesLoadTest() const  {
	Node *nj;
	bool testConfiguration=false,testVehicle=false;
	//un vehicule doit etre affecte
	PPK_ASSERT(nodes[0]!=nullptr,formatJson("internalError","There is not departure depot in route"));
	PPK_ASSERT(nodes[nodes.size()-1]!=nullptr,formatJson("internalError","There is not arrival depot in route"));

	//le vehicule doit etre capable de supporter la charge
	for (size_t j = 0; j < nodes.size(); ++j) {
		nj=nodes[j];
		testVehicle=false;
		for (size_t k = 0; k < vt->getNbConfigurations(); ++k) {
			testConfiguration=true;
			for (size_t l = 0; l < inst->getNbUserType(); ++l) {
				if(vt->getConfiguration(k)->getCapacity()[l] < nj->load[l]){
					testConfiguration=false;
				}
			}
			if(testConfiguration){
				testVehicle=true;
			}
		}
		PPK_ASSERT(testVehicle,formatJson("internalError","The assigned vehicle is not able to handle the load of node in position "+ to_string(j),true, nj, j, true));
	}
}

void Route::vehicleTest(bool checkIdConfigParameters)  const {
	PPK_ASSERT(vt != nullptr,formatJson("internalError","There is not assigned vehicle in the route",true,nullptr,-1,true));
	PPK_ASSERT(feasibleVehicles.size()>0,formatJson("internalError","The list of feasible vehicles is empty",true,nullptr,-1,true));
	bool isIn=false;
	std::vector<const VehicleType*> unfeasibleVehicles;
	for(auto vehicle : vehicleList){
		//verifier que vehicle est dans vehicles
		if(vehicle->getId()==vt->getId()){
			isIn=true;
		}

		if(!isFesibleVehicleChecker(vehicle))
			unfeasibleVehicles.push_back(vehicle);
	}
	PPK_ASSERT(isIn,formatJson("internalError","The chosen vehicle is not in the vehicles list",true ,nullptr,-1,true));

	//verifier parametre idConfig pour chaque node
	if(checkIdConfigParameters){
		int idx=0;
		for(auto& node: nodes){
			int idc =node->idConfig;
			for(size_t u=0; u< node->load.size();++u){
				PPK_ASSERT( node->load[u] <= vt->getConfiguration(idc)->getCapacity()[u],formatJson("internalError","invalid parameter idConfig of node", true, node, idx, true));
			}
			idx++;
		}
	}
}

void Route::loadTest()  const {
	Node *nj;
	for (size_t j = 1; j < nodes.size()-1; ++j) {
		nj=nodes[j];
		for (size_t k = 0; k < inst->getNbUserType(); ++k) {
			PPK_ASSERT(nj->load[k]== (nodes[j-1]->load[k]+nj->l(k)), formatJson("internalError","The load value in node is invalid", true, nj, j, true));
		}
	}
	nj=nodes[nodes.size()-2];
	for (size_t k = 0; k < inst->getNbUserType(); ++k) {
		PPK_ASSERT(nj->load[k]==0,formatJson("internalError","non zero load for the 2 last nodes",true));
	}
}

void Route::distanceTest() const  {
	long dist=0;
	for (size_t j = 0; j < nodes.size()-1; ++j) {
		dist+=inst->getDist(nodes[j]->getPointId(),nodes[j+1]->getPointId());
	}
	PPK_ASSERT(distance==dist,formatJson("internalError","Invalid distance parameter in route",true));
}

void Route::performanceTest() const  {
	double _cost=0;
	double _irregularity=0;
	double _objValue=0;
	if (nodes.size()>2) {
		_cost+=vt->getFixedCost();
		_cost+=vt->getTimeCost()*cst::L2D(duration);
		_cost+=vt->getDistanceCost()*cst::L2D(distance);
		_irregularity+=computeIrregularity();
		_objValue+=computeObjVal();
	}
	if(cst::GDARP_instance)
		_cost=inst->getAlpha()*double(cumRT) + (1-inst->getAlpha())*double(duration);
	if(_cost!=0){
		PPK_ASSERT(abs((this->getCost()-_cost)/_cost) < 0.00001, formatJson("internalError","invalid route cost calculation",true));
	} else {
		PPK_ASSERT(abs(this->getCost()-_cost) < 0.00001, formatJson("internalError","invalid route cost calculation",true));
	}
	PPK_ASSERT(abs((this->cost-_cost)) < 0.0001, formatJson("internalError","invalid route cost",true));
	PPK_ASSERT(abs((this->irregularity-_irregularity)) < 0.0001, formatJson("internalError","invalid route irregularity ",true));
	PPK_ASSERT(abs((this->objVal-_objValue)) < 0.0001, formatJson("internalError","invalid route objetive value ",true));
}

void Route::checkItineraries() {
	for (auto nod :nodes){
		auto nodSym=nodes[*nod->posSymInRou];
		PPK_ASSERT(nod->itinerary!=nullptr,formatJson("internalError","null pointer for Node object",true, nod));
		PPK_ASSERT(nod->itinerary==nodSym->itinerary,formatJsonU("internalError","pickup itineray id " + to_string(nod->itinerary->get_id())+ " and delivery itinerary id "+ to_string(nodSym->itinerary->get_id()) + " are not the same",true, nod->getUser()));
		PPK_ASSERT(nod->getIdUser()==nodSym->getIdUser(),formatJsonU("internalError","pickup user " + to_string(nod->getUser()->getId()) +  " and delivery user " + to_string(nodSym->getUser()->getId()) + " are not the same",true, nod->getUser()));
	}
}
