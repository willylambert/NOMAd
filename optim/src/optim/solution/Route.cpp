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
#include "stdlib.h"
#include <sstream>
#include <limits>
#include <algorithm>
#include <iostream>

using namespace std;

struct SortVehicles{
	inline bool operator() (const std::pair<double ,const VehicleType*>& v1, const std::pair<double ,const VehicleType*>& v2) {
		return (v1.first < v2.first);
	}
};

// Constructor
Route::Route(const Instance* ins, Node* depart ,Node* arrive, const VehicleType* vehicle,
		 std::vector<const VehicleType * >& listOfVehicles){
	id=0;
	inst=ins;
	nodes.push_back(depart); //depot nodes
	nodes.push_back(arrive); //depot nodes
	depart->id_round=&this->id;
	arrive->id_round=&this->id;
	vt=vehicle;
	vehicleList=listOfVehicles;
	initRoute();
	reinitVehicleList();
}

void Route::initRoute(){
	duration=0;  // initialize always to 0 ..to avoid bias in the final solution cost
	distance=0;  // initialize always to 0 ..to avoid bias in the final solution cost
	irregularity=0;
	cost=0;
	objVal=0;
	nodes[0]->posInRou=0;
	nodes[1]->posInRou=1;
	nodes[1]->posSymInRou= &nodes[0]->posInRou;
	nodes[0]->posSymInRou=&nodes[1]->posInRou;
	nodes[0]->time=nodes[0]->a();
	nodes[1]->time=nodes[0]->time
			+ nodes[0]->getStime()
			+ inst->getTime(nodes[0]->getPointId(), nodes[1]->getPointId());
	reinitVehicleList();
}

void Route::reinit() {
	if(size()>2){
		for (size_t i = 1; i < size()-1; ++i)
			nodes[i]->reinit();
		nodes[1]=nodes.back();
		nodes.resize(2);
		initRoute();
	}
	idJson=-1;
}

void Route::reinitVehicleList(){
	feasibleVehicles.clear();
	for (const VehicleType* v : vehicleList) {
		feasibleVehicles.push_back(make_pair(v->getFixedCost(),v));
	}
}

bool Route::evalBestInsertion(RequestInfo& cbest){
	RequestInfo ctemp(cbest.p, cbest.d);
	cbest.deltaObj=std::numeric_limits<double>::max();
	//tester toutes les positions possibles pour p et d
	for (int j = 2; j <= (int)nodes.size(); ++j) { 		//position pour d ; le premier et le dernier elements du vecteur sont le véhicule
		for (int i = 1; i < j; ++i) { 				//position pour p
			for (auto itchoice : ctemp.p->available_itineraries){
				ctemp.i=i;
				ctemp.j=j;
				ctemp.itinerary = itchoice;
				ctemp.p->setItinerary(itchoice);  // this solves a bug in the case of multiple itineraries
				ctemp.d->setItinerary(itchoice);  // this solves a bug in the case of multiple itineraries
				if(evalInsertion(ctemp)){   //find best position and vehicle
					PPK_ASSERT(ctemp.isfeasible);
					if(ctemp.deltaObj < cbest.deltaObj){
						cbest=ctemp;
					}
				}
			}
		}
	}
	if(cst::verbosite>2) cout<<"computed insertion:\t"<<cbest<<endl;
	return cbest.isfeasible;
}

// Performs a feasible insertion! the previous return to catch bugs does not make sense. A possible bug is catched avec un assert()
void Route::insertFeasibleRequest(RequestInfo& req){
	double objBefore=objVal;
	double costBefore=cost;
	double irregBefore=irregularity;

	addRequest(req);
	req.isfeasible=updateFeasibleTourParameters(req.vehicle);  // update r.isFeasible is importat for further verifications
	if(!req.isfeasible){ //if it is a bug
		PPK_ASSERT(req.isfeasible,formatJson("error","Inserting a feasible request was not feasible"));
	}

	// Compute delta cost
	req.deltaObj=objVal-objBefore;
	req.cost=cost-costBefore;
	req.irreg=irregularity-irregBefore;

	req.tourid=(int)this->id;
	PPK_ASSERT(req.p->getRouteId()==this->id,"The route id for pickup is wrong");
	PPK_ASSERT(req.d->getRouteId()==this->id,"The route id for delivery is wrong");
	if(cst::verbosite>2) cout<<"feasible insertion done:\t"<<req<<endl;
}

bool Route::evalRemoval(RequestInfo& req){
	req.vehicle=vt;
	req.deltaObj=objVal;
	req.isfeasible=true;
	if (this->nodes.size()>4) {
		req.isfeasible=removeRequest(req); 	// remove only if possible (feasible)
		if(req.isfeasible){ 				// this condition is important to avoid inserting twice the same request
			insertFeasibleRequest(req); 	// computes delta cost inside
			return true;
		}
		return false;
	}
	return true;
}

void Route::estimateVehiclesCost(const long & dist){
	for (auto vehicle:feasibleVehicles) {
		vehicle.first=vehicle.second->getFixedCost()+vehicle.second->getDistanceCost()*cst::L2D(dist);
	}
	std::sort(feasibleVehicles.begin(), feasibleVehicles.end(), SortVehicles());
}

bool Route::evalInsertion(RequestInfo& req){
	if (testNecessaryConditions(req)) // constant time necessary conditions
	{
		addRequest(req);
		bool timeFeasible=schedule();

		if(timeFeasible) // time feasiblity test is ok
		{
			long newDist=getComputedDistance();  //getDistanceIncremental(req);
			estimateVehiclesCost(newDist); // optimized version
			req.vehicle=performCapacityTest(nodes, feasibleVehicles,newDist);
			if(req.vehicle != nullptr) // capacity testing
			{
				req.isfeasible=true;
				double newObj=0;
				double newCost=0;
				double newIrreg=0;
				if(cst::GDARP_instance){
					newObj=inst->getAlpha()*cst::L2D(getSumRT_T())
							+ (1-inst->getAlpha())*cst::L2D(getDurationT());
				}else{
					newObj=req.vehicle->getFixedCost()
										+ req.vehicle->getDistanceCost()*cst::L2D(newDist)
										+ req.vehicle->getTimeCost()*cst::L2D(getDurationT());
					//cout<<"cirr "<<coefIrreg<<" irr "<<computeIrregularity()<<" "<<__FILE__<<__LINE__<<endl;
					newCost=newObj;
					newIrreg=computeIrregularity();
					newObj = coefCost*newObj + coefIrreg*newIrreg;
				}
				if(cst::verbosite>3){
					cout<<"feasible route:";
					for(auto nod :nodes)
						cout<<" "<<nod->getId();
					cout<<"\n with points:";
					for(auto nod :nodes)
						cout<<" "<<nod->getPointId();
					cout<<"\n with obj:"<< newObj;
					cout<<"\n with oldCost:"<< objVal;
					cout<<"\n with RT:"<< getSumRT_T();
					cout<<"\n with dura:"<< getDurationT();
					cout<<endl;
				}
				req.deltaObj=newObj-objVal;
				req.cost=newCost-cost;
				req.irreg=newIrreg-irregularity;

				req.tourid=(int)this->id;
				PPK_ASSERT(*req.p->posSymInRou == req.d->posInRou && *req.d->posSymInRou== req.p->posInRou,formatJson("internalError", "values about the possition in the route of symetric nodes are not consistent"));
				eraseRequest(req.i,req.j);

				return true;
			}
		}
		eraseRequest(req.i,req.j);  // time infeasible, positions are recomputed inside this method
	}
	req.isfeasible=false;  //compulsory
	return false;
}


bool Route::removeRequest(RequestInfo& r){
	eraseRequest(r.i,r.j);
	r.isfeasible=updateFeasibleTourParameters(nullptr);
	PPK_ASSERT_WARNING(r.isfeasible,formatJson("warning","removing a request was not feasible (most probably due the violation of the triangular inequality in time)"));
	if(r.isfeasible){
		return true;
	}else{
		insertFeasibleRequest(r); // this step garantees avoids a possible error of having unfeasible routes inside solutions
		PPK_ASSERT(r.isfeasible,formatJson("error","Inserting a previously feasible request is infeasible!"));
		return false;
	}
}

bool Route::removeUser(const User * user, bool deleteNode){
	bool feasible=false;
	std::pair<size_t, size_t> p=findPosition(user);
	eraseRequest(p.first,p.second, deleteNode);
	feasible=updateFeasibleTourParameters(nullptr);
	PPK_ASSERT_WARNING(feasible,formatJson("warning","removing one user cause route infeasibility (most probably due the violation of the triangular inequality in time)"));
	if(!feasible){
		return false;
	}
	return true;
}

void Route::eraseRequest(size_t i, size_t j, bool deleteNode){
	if(deleteNode){
		delete nodes[j];
		delete nodes[i];
	}
	nodes.erase(nodes.begin()+j);
	nodes.erase(nodes.begin()+i);
	recomputePositions();
}

void Route::addRequest(RequestInfo& req){
	nodes.insert(nodes.begin()+req.i,req.p);
	nodes.insert(nodes.begin()+req.j,req.d);
	req.p->id_round = &this->id;
	req.d->id_round = &this->id;
	PPK_ASSERT(req.p->getRouteId()==this->id,"The route id for pickup is wrong");
	PPK_ASSERT(req.d->getRouteId()==this->id,"The route id for delivery is wrong");
	recomputePositions();

	req.p->setItinerary(req.itinerary);
	req.d->setItinerary(req.itinerary);

	//debug
	if(cst::checkAll){
		req.p->check();
		req.d->check();
	}
}

bool Route::setAllParametersFromVnodeOrder(const VehicleType* vehicle){
	bool isFeasible=false;
	recomputePositions();
	for(auto node : nodes){
		node->id_round=&this->id;
	}
	isFeasible=updateFeasibleTourParameters(vehicle);
	if(cst::checkAll && !evalMode) this->check();
	return isFeasible;
}

void Route::recomputePositions(int i){
	for (size_t k = i; k <nodes.size(); ++k)
		nodes[k]->posInRou=k;
}

// the name of this method misleads the programer, it is not only for feasible cases. It is called in removal methods where feasibility is not guranteed
bool Route::updateFeasibleTourParameters(const VehicleType* newVt){
	bool timeFeasible=true;
	timeFeasible=schedule();
	if(timeFeasible || evalMode  ){
		updateParameters();
		distance=getComputedDistance();
		duration=getDurationT();
		if(newVt==nullptr){
			reinitVehicleList();
			updateVehicleListWithFeasibleVehicles(nodes, feasibleVehicles);
			estimateVehiclesCost(distance);
			vt=performCapacityTest(nodes, feasibleVehicles, distance);
			nbReconfigurations=getNbReconfigurationsCap();
			if(evalMode){if(vt==nullptr) setNoVehicleCapable();}
			else PPK_ASSERT(vt!=nullptr);
		}else{
			vt=newVt;
			reinitVehicleList();
			updateVehicleListWithFeasibleVehicles(nodes, feasibleVehicles);
			if(evalMode){
				bool found=false;
				for(auto it : feasibleVehicles){
					if(it.second==vt){
						found=true;
						break;
					}
				}
				if(!found){
					isFesibleVehicleEvalMode(vt);
					if(feasibleVehicles.empty())
						setNoVehicleCapable();
				}
			}
		}
		updateLoadParameters();
		cumRT=getSumRT_T();
		cost=computeCost();
		irregularity=computeIrregularity();
		objVal=computeObjVal();
	}
	return timeFeasible;
}

std::string Route::getConsistencyStats() const{
	stringstream ss;
	ss<<Node::toStringTitle()<<" Irreg"<<endl;
	double irreg=0;
	int cont=0;
	if(nodes.size()>2){
	for(Node * node : nodes){
			auto res = find(inst->getConsistencyType().begin(),inst->getConsistencyType().end(), node->getType());
			if(res != inst->getConsistencyType().end()){
				ss<<node->toString()<<"\t"<<node->getIrregularity()<<endl;
				irreg+=node->getIrregularity();
				cont++;
			}
	}
	}
	if(cont > 0)
		ss<<"\nIrregularity\t"<<irreg <<"/"<<cont<<" = " <<irreg*100.0/(double)cont<<"%"<<endl;
	ss<<"Avg_Irregularity\t"<<irreg/(double)cont<<endl;
	return ss.str();
}

bool Route::testNecessaryConditions(const RequestInfo& e) const{
	auto nodeBeforeI=nodes[e.i-1];
	auto nodeAfterI=nodes[e.i];

	//necessary condition b_2 >= a_ins
	if(nodeAfterI->b() < e.itinerary->a_pickup()){
		return false;
	}

	//necessary condition b_ins>=a_1
	if(nodeBeforeI->a() > e.itinerary->b_pickup()){
		return false;
	}

	auto nodeAfterJ=nodes[e.j-1];
	auto nodeBeforeJ=nodes[e.j-2];

	//necessary condition b_2 >= a_ins
	if(nodeAfterJ->b() < e.itinerary->a_delivery()){
		return false;
	}

	//necessary condition a_1 <= b_ins
	if(nodeBeforeJ->a() > e.itinerary->b_delivery()){
		return false;
	}

	// necessary condition 1: load
	for(size_t u=0;u < inst->getNbUserType(); ++u){
		auto newLoad= nodeBeforeI->load[u]+e.p->getUser()->l(u);
		if(newLoad > inst->getMaxcap()[u]) {
			return false;
		}
	}

	// necessary condition 2 pickup: Tp_a
	auto time_arrive = nodeBeforeI->a() + (long)inst->getTime(nodeBeforeI->getPointId(), e.p->getPointId()) + nodeBeforeI->getStime();
	if( time_arrive > (long)e.itinerary->b_pickup()) {
		return false;
	}

	// necessary condition 2 pickup: Tp_b
	auto time_arrive2= max(time_arrive,(long)e.itinerary->a_pickup())
					+ (long)inst->getTime(e.p->getPointId(),nodeAfterI->getPointId()) + e.itinerary->get_st_pick();
	if( time_arrive2 > (long)nodeAfterI->b()) {
		return false;
	}

	// necessary condition 3 delivery: Td_a
	time_arrive = nodeBeforeJ->a() + (long)inst->getTime(nodeBeforeJ->getPointId(),e.d->getPointId()) + nodeBeforeJ->getStime();
	if( time_arrive > (long)e.itinerary->b_delivery()) {
		return false;
	}

	// necessary condition 4 delivery: Ta_b
	time_arrive2= time_arrive + (long)inst->getTime(e.d->getPointId(),nodeAfterJ->getPointId()) + e.itinerary->get_st_del();
	if( time_arrive2 > (long)nodeAfterJ->b()) {
		return false;
	}

	return true;
}

long Route::getComputedDistance() const{
	long dist=0;
	auto nodeBefore=nodes.begin();
	for(auto node= (++nodes.begin()); node != nodes.end(); ++node){
		dist += inst->getDist((*nodeBefore)->getPointId(),(*node)->getPointId());
		++nodeBefore;
	}
	return dist;
}

double Route::computeCost() {
	double _cost=0;
	if(cst::GDARP_instance)
		_cost = (1-inst->getAlpha()) * cst::L2D(duration)
				+ inst->getAlpha()  * cst::L2D(cumRT);
	else{
		if(size()>2){
			_cost = vt->getFixedCost()
					+ vt->getDistanceCost()*cst::L2D(distance)
					+ vt->getTimeCost()*cst::L2D(duration);
		}else{
			_cost=0;
		}
	}
	return _cost;
}


double Route::computeIrregularity() const {
	double irreg=0;
	for(Node * node : nodes){
		auto res = find(inst->getConsistencyType().begin(),inst->getConsistencyType().end(), node->getType());
		if(res != inst->getConsistencyType().end())
			irreg+=node->getIrregularity();
	}
	return irreg;
}

double Route::computeIrregularity_T(long delta) {
	double irreg=0;
	int i=0;
	for(Node * node : nodes){
		auto res = find(inst->getConsistencyType().begin(),inst->getConsistencyType().end(), node->getType());
		if(res != inst->getConsistencyType().end()){
			auto timeOrigin=node->getTime();
			node->setTime(T[i]+delta);
			irreg+=node->getIrregularity();
			node->setTime(timeOrigin);
		}
		i++;
	}
	return irreg;
}


double Route::computeObjVal()const {
	auto objVal=coefCost*cost+coefIrreg*irregularity;
	return objVal;
}

/******************************* Copy object methods************************/



void Route::copyNodes(const Route * t, const std::vector<Node*>& all_nodes){
	nodes.clear();
	nodes.resize(0);

	for (size_t i=0; i < t->nodes.size(); i++) {
		auto copy=all_nodes[t->nodes[i]->getId()];
		copy->setItinerary(t->nodes[i]->getItinerary()); // i think this is needed
		copy->setPreviousTime(t->nodes[i]->getTimePrev());
		nodes.push_back(copy);
	}

	//remet tout les id_roud des nodes à l'ID du tour courant
	for (size_t i=0; i< t->nodes.size(); i++) {// importat
		nodes[i]->id_round=&this->id;
	}

	nodes[0]->posSymInRou=&nodes.back()->posInRou;//importat..b/o in depots idSym may point to itself
	nodes.back()->posSymInRou=&nodes[0]->posInRou;
}


std::ostream& operator<<(std::ostream& out, const Route& f)
{
	out<<"************* Tournée "<<f.id<<" ***************\n";
	out << f.str_tour();
	return out;
}


/*******************************Printing methods****************************************/

string Route::str_tour() const{
	stringstream s;
	size_t totalwait=0;
	s<<"\n";
	s<<"Route: "<<id;
	s<<"\n"<<"idNode\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<nodes[j]->getId();
	}
	s<<"\n"<<"idUser\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<nodes[j]->getUser()->getId();
	}
	s<<"\n"<<"idPoint\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<nodes[j]->getPointId();
	}
	if(nodes[0]->posSymInRou!=nullptr){
		s<<"\n"<<"idSym\t";
		for (size_t j = 0; j < nodes.size(); ++j) {
			s<<"\t"<<nodes[*nodes[j]->posSymInRou]->getId();
		}
	}
	s<<"\n"<<"times\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<cst::L2D(nodes[j]->time);
	}
	if(cst::MPDARP){
		s<<"\n"<<"timePrev\t";
		for (size_t j = 0; j < nodes.size(); ++j) {
			s<<"\t"<<cst::L2D(nodes[j]->getTimePrev());
		}
	}
	s<<"\n"<<"t(i,i+1)\t";
	for (size_t j = 0; j < nodes.size()-1; ++j) {
		s<<"\t"<<cst::L2D(inst->getTime(nodes[j]->getPointId(),nodes[j+1]->getPointId()));
	}
	s<<"\n"<<"wait\t";
	for (size_t j =0 ; j < nodes.size()-1; ++j) {
		long wait=nodes[j+1]->time - nodes[j]->time - nodes[j]->getStime()-inst->getTime(nodes[j]->getPointId(),nodes[j+1]->getPointId());
		s<<"\t"<<cst::L2D(wait);
		totalwait+=wait;
	}
	s<<"\n"<<"tw_a\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<cst::L2D(nodes[j]->a());
	}
	s<<"\n"<<"tw_b\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<cst::L2D(nodes[j]->b());
	}
	s<<"\n"<<"MaxRT\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<cst::L2D(nodes[j]->getMaxRT());
	}
	if(nodes[0]->posSymInRou!=nullptr){
		s<<"\n"<<"RideTime\t";
		double rt;
		for (size_t j = 0; j < nodes.size(); ++j) {
			if (nodes[j]->isOutType()){
				rt=cst::L2D(nodes[*nodes[j]->posSymInRou]->time - (nodes[j]->time + nodes[j]->getStime()));
			}
			else{
				rt=cst::L2D(nodes[j]->time - (nodes[*nodes[j]->posSymInRou]->time + nodes[*nodes[j]->posSymInRou]->getStime()));
			}
			s<<"\t"<<rt;
		}
	}


	s<<"\n"<<"stime\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<cst::L2D(nodes[j]->getStime());
	}
	s<<"\n"<<"typeNode\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<nodes[j]->getType();
	}
	s<<"\n"<<"Time\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<(long)cst::L2D(nodes[j]->time);
	}
	for(size_t u =0;u<inst->getNbUserType();++u){
		s<<"\n"<<"Load_u="<<u<<"\t";
		for (size_t j = 0; j < nodes.size(); ++j) {
			s<<"\t"<<nodes[j]->load[u];
		}
	}
	s<<"\n"<<"idConfiguration\t";
	for (size_t j = 0; j < nodes.size(); ++j) {
		s<<"\t"<<nodes[j]->idConfig;
	}

	if(vt!=nullptr)
	{
		s<<"\n"<< *getVehicle()<<"\n";
		//	out<<"NbReconf\t"<<f.getNbReconfigurations()<<"("<<f.getInst()->getMaxNbReconfigurations()<<")"<<"\n"; pas mis à jour

		s<<"SumDistances\t"<<cst::L2D(distance)<<"\n";
		s<<"RouteDuration\t"<<cst::L2D(duration)<<"\n";
		s<<"RouteCost\t"<<cost<<"\n";
		s<<"RouteIrregularity\t"<<irregularity<<"\n";
		s<<"RouteObj\t"<<objVal<<"\n";
	}
	s<<"\n";
	return s.str();
}

// pair <[id(n_1),id(n_2),...,id(n_N)], [id(it(n_1)),id(it(n_2)),...,id(vehicle)]>
ordHash Route::getHashkeyOrdered() const{
	auto n=nodes.begin();
	std::vector<size_t> hash1;
	std::vector<size_t> hash2;
	hash1.push_back((*n)->getUser()->getId());
	hash2.push_back((*n)->getIdItin());
	++n;
	for( ; n< (--nodes.end()); ++n){
		hash1.push_back((*n)->getUser()->getId());
		hash2.push_back((*n)->getIdItin());
	}
	hash1.push_back((nodes.back())->getUser()->getId());
	hash2.push_back((*n)->getIdItin());
	if(isLimitedFleet())
		hash2.push_back(vehicleList[0]->getId());
	return std::make_pair(hash1,hash2);
}

// [id(vehicle), id(p_1),id(p_2),... ]
std::vector<size_t> Route::getHashUnordered() const{
	vector<size_t> hashkey;
	if(isLimitedFleet()) hashkey.push_back(vehicleList[0]->getId());
	else hashkey.push_back(inst->getNbUsers());
	hashkey.push_back(nodes[0]->getIdUser());
	for(auto& node : nodes){
		if (node->isPickup()) {
			hashkey.push_back(node->getIdUser());
		}
	}
	sort(hashkey.begin()+1,hashkey.end());
	return hashkey;
}

Route* Route::getCopy() {
	vector<Node*> new_nodes(size());
	for (size_t j = 0; j < size(); ++j){
		new_nodes[j]=nodes[j]->getCopy();
	}
	//set posSym
	for (size_t j = 0; j < size(); ++j){
		size_t j_sym=*nodes[j]->posSymInRou;
		new_nodes[j]->posSymInRou=&(new_nodes[j_sym]->posInRou);
	}
	Route * rout=new Route();
	*rout=*this;
	rout->nodes=new_nodes;
	return rout;
}

std::pair<size_t, size_t> Route::findPosition(const User* user) {
	pair<size_t,size_t> p;
	for (size_t pos = 1; pos < size()-1; ++pos) {
		if(user->getId()==nodes[pos]->getIdUser()){
			if(nodes[pos]->isPickup())
				p.first=pos;
			else
				p.second=pos;
		}
	}
	return p;
}

std::string Route::to_json() const {
	stringstream ss;
	ss <<"{";
	ss <<"\"id\":"<<id;
	if(isFeasible())
		ss <<",\"feasible\":true";
	else{
		ss <<",\"feasible\":false";
		ss << ",\n\"errors\":" << errors_to_json()<<"\n";
	}
	ss <<",\"cost\":"<<cost;
	ss <<",\"irregularity\":"<<irregularity;
	ss <<",\"objVal\":"<<objVal;
	ss <<",\"distance\":"<<distance;
	ss <<",\"duration\":"<<duration;
	ss <<",\"nbReconfigurations\":"<<nbReconfigurations;
	ss <<",\"idVehicle\":"<<vt->getIdJson();
	ss <<",\"feasibleVehicles\": [";
	auto sep = "";
	for (auto& v:feasibleVehicles) {
		ss<<sep<<v.second->getIdJson();
		sep = ","; // make the separator a comma after first item
	}
	ss <<"]";
	ss <<",\"nodes\": [";
	sep = "";
	for (auto& n:nodes) {
		ss<<sep<<n->to_json();
		sep = ","; // make the separator a comma after first item
	}
	ss <<"]";
	ss <<"}";

	return ss.str();
}

void Route::setPosSym() {
	for (size_t i = 0; i < size(); ++i) {
		Node *ni=nodes[i];
		for (size_t j = i+1; j < size(); ++j) {
			Node * nj=nodes[j];
			if(ni->getIdUser()==nj->getIdUser()){
				ni->posSymInRou=&nj->posInRou;
				nj->posSymInRou=&ni->posInRou;
				break;
			}
		}
	}
}

