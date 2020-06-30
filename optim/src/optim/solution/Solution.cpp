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
 
#include "../constant.h"
#include "../lib/lib_tools.h"
#include "../solve/RequestInfo.h"
#include "Solution.h"
#include "../lib/ppk_assert.h"
#include <sstream>
#include <cmath>
#include <fstream>
#include <iostream>

using namespace std;
using json = nlohmann::json;


void Solution::init(){
	penaltyCost=(double)(1000000*cst::multiplier); //useful in getPenalizedObjectiveValue
	totalCost=0;
	totalIrreg=0;
	totalObjVal=0;

	//creates nodes for users
	nodes.resize(inst->getNbUsers()*2);
	size_t i=0;
	for ( ; i < inst->getNbUsers(); ++i){
		nodes[i] = new Node(inst,inst->getUser(i),i,i+inst->getNbUsers(),pickup);
		nodes[i+inst->getNbUsers()] = new Node(inst,inst->getUser(i),i+inst->getNbUsers(),i,delivery);
		nodes[i]->posSymInRou=&nodes[i+inst->getNbUsers()]->posInRou;
		nodes[i+inst->getNbUsers()]->posSymInRou=&nodes[i]->posInRou;
	}

	//create routes
	createRoutes();

	// compute performance of empty routes
	recomputePerfs();

	//set all node movable in the LNS
	activeUsers.resize(inst->getNbUsers());
	for (int i = 0; i < (int)activeUsers.size(); ++i){
		activeUsers[i]=i;
	}

	//set all node to non-inserted
	setNonInserted(activeUsers);
}

void Solution::createRoutes(){
	size_t i=nodes.size();
	int cap= 0;
	try{
		for(auto vehicle : inst->getVehiclesSortedByQuantity())
		{
			// create list of depots of each vehicle type
			std::vector<Depot*> depotList;
			if(vehicle->getNbVehicles()=="unlimited")
				depotList=inst->getDepots();
			else{
				auto depot=inst->getDepotById(vehicle->getDepotId());
				if(depot==nullptr)
					throw std::invalid_argument(messageJson("error","Depot not found for vehicle : " + vehicle->getName()));
				depotList.push_back(depot);
			}

			// create routes
			for(const Depot * dep : depotList) {
				for(auto itI: dep->getItineraries()){
					std::vector<const VehicleType*> list;
					if(vehicle->getNbVehicles()!="unlimited") {
						list={vehicle};
						cap = stoi(vehicle->getNbVehicles());
					}else {
						list=inst->getVehiclesWithUnlimitedQuantity();
						cap= min(inst->getPoint(itI->get_pickup())->getCapaVehi(),(int) inst->getNbUsers());
					}
					for(int j=0; j<cap; j++) {
						Node* depart=new Node(inst, dep, i,i+1,depotOut);
						depotsOut.push_back(depart); // DepotOut c'est pas l'arrivée? non
						Node* arrival=new Node(inst, dep, i+1, i ,depotIn);
						depotsIn.push_back(arrival);
						Route* tour=new Route(inst, depart, arrival, vehicle, list);
						insertRoute(tour);
						depart->posSymInRou=&arrival->posInRou;
						arrival->posSymInRou=&depart->posInRou;
						nodes.push_back(depart);
						nodes.push_back(arrival);
						tour->setCoefObj(coefCost,coefIrreg);
						tour->setAllParametersFromVnodeOrder();
						i+=2;
					}
				}
			}
		}
	}
	catch(const std::exception& error)
	{
		cout<<error.what()<<endl;
	}
}

void Solution::createRoutesUnlimitedVehicles(){
	size_t i=nodes.size();
	auto vehicle=inst->getVehicleType(0);
	for(const Depot * dep : inst->getDepots()){
		for(auto itin: dep->getItineraries()){
			size_t cap= inst->getPoint(itin->get_pickup())->getCapaVehi();
			for (size_t j = 0; j < cap; j++) {
				Node* depart=new Node(inst, dep, i,i+1,depotOut);
				depotsOut.push_back(depart);
				Node* arrival=new Node(inst, dep, i+1, i ,depotIn);
				depotsIn.push_back(arrival);
				std::vector<const VehicleType*> list=inst->getVehiclesWithUnlimitedQuantity();
				Route* tour=new Route(inst, depart, arrival, vehicle,list);
				insertRoute(tour);
				depart->posSymInRou=&arrival->posInRou;
				arrival->posSymInRou=&depart->posInRou;
				nodes.push_back(depart);
				nodes.push_back(arrival);
				tour->setAllParametersFromVnodeOrder();
				i+=2;
			}
		}
	}
}

void Solution::reinit(vector<size_t> _activeUsers){
	activeUsers=_activeUsers;
	setNonInserted(activeUsers);
	for(Route * route : routes){
		route->reinit();
	}
	recomputePerfs();
	reinitErrors();
}


void Solution::setNonInserted(std::vector<size_t> cluster) {
	pickupNonInserted.clear();
	pickupNonInserted.resize(cluster.size());
	for(size_t id = 0; id < cluster.size(); id++) {
		pickupNonInserted[id]=cluster[id];
	}
	activeUsers.resize(cluster.size());
	activeUsers=cluster;
}


Solution::~Solution() {
	for (auto& t: routes) {
		delete t;
	}
}

void Solution::deleteAllNodes(){
	for(auto nod: nodes) delete nod;
}

bool Solution::operator<(Solution& s) {
	if((isFeasible() && s.isFeasible()) || (!isFeasible() && !s.isFeasible())){
		return getObjectiveValue() < s.getObjectiveValue();
	}
	else{
		return isFeasible();
	}
}

void Solution::setActiveUsers(std::vector<size_t> idUsers){
	activeUsers.clear();
	addActiveUsers(idUsers);
}

void Solution::addActiveUsers(std::vector<size_t> idUsers){
	for(size_t & i :idUsers){
		if(std::find(activeUsers.begin(),activeUsers.end(),i)==activeUsers.end())
			activeUsers.push_back(i);
	}
	std::sort(activeUsers.begin(),activeUsers.end());
}

/*************************** copy *********************************/

void Solution::replicateSolution(const Solution* s){
	activeUsers=s->activeUsers;
	this->setCoefObj(s->coefCost,s->coefIrreg);
	for (size_t i=0; i < s->routes.size(); i++) {
		PPK_ASSERT(this->routes[i]->nodes[0]->getIdUser()==s->routes[i]->nodes[0]->getIdUser());
		this->routes[i]->copyNodes(s->routes[i],nodes);		// reconstitue les tournée a partir des Node_In_Sol de nodes
		this->routes[i]->setAllParametersFromVnodeOrder(s->routes[i]->getVehicle());
		PPK_ASSERT(this->routes[i]->getVehicle()==s->routes[i]->getVehicle());
	}
	this->copyTimePrev(s);
	this->pickupNonInserted=s->pickupNonInserted;
	this->recomputePerfs();
	PPK_ASSERT(this->totalObjVal==s->totalObjVal);
	PPK_ASSERT(this->totalCost==s->totalCost);
	PPK_ASSERT(this->totalIrreg==s->totalIrreg);
	PPK_ASSERT(this->RT==s->RT);
}

void Solution::copyTimePrev(const Solution* s){
	for(auto& node: s->getNodes())
		nodes[node->getId()]->setTimePrev(node->getTimePrev());
}


void Solution::deepCopyNodes(Solution& s){
	nodes.resize(s.getNodesSizes());
	for(size_t i=0; i<s.getNodesSizes();++i){
		*this->getNode(i)=*s.getNode(i);
	}
	for (size_t j = 0; j < nodes.size(); ++j){
		nodes[j]->posSymInRou=&nodes[nodes[j]->getIdsym()]->posInRou;
	}
}

void Solution::set_as_inserted(Node * p){
	for(vector<size_t>::iterator it =  pickupNonInserted.begin(); it!=pickupNonInserted.end();it++){
		if(*it == p->getIdUser()){//changed NodeId into id
			it=pickupNonInserted.erase(it);
			break;
		}
	}
}

Solution* Solution::getCopy() const{
	Solution* s=new Solution(name,inst);
	s->replicateSolution(dynamic_cast<const Solution*>(this));
	return dynamic_cast<Solution*>(s);
}

/****************************************** NEW *********************************************************/

int Solution::getNbRoutesUsed(){
	int nbUsedTours=0;
	for(auto& tour: routes){
		if(tour->nodes.size()>2) ++nbUsedTours;
	}
	return nbUsedTours;
}

int Solution::computeNbReconfigurations(size_t* routeRec) const{
	int nbr=0;
	for(auto& t : routes){
		if(t->getNbReconfigurations()>0) ++(*routeRec);
		nbr=std::max(nbr, t->getNbReconfigurations());
	}
	return nbr;
}

/******************************** Add *******************************/

int Solution::insertRoute(Route *t){
	t->id=routes.size();
	routes.push_back(t);
	return (int)t->id;
}

void Solution::addRoutes(std::vector<Route*>& newRoutes){
	for(Route* t: newRoutes){
		routes.push_back(t);
	}
}


/********************************* calculs finaux **********************/

void Solution::computeIdConfigParameters(){
	for (auto &r : routes){
		if(!evalMode||r->isCapacityFeasible())
			r->setIdConfigParameters(r);
	}
}

void Solution::recomputePerfs() {
	RT=0;
	totalCost=0;
	totalIrreg=0;
	totalObjVal=0;
	for (auto& route: routes) {
		totalCost+=route->getCost();
		totalIrreg+=route->getIrregularity();
		totalObjVal+=route->getObjVal();
		RT+=route->getSumRT();
	}
}

void Solution::recomputePerfsDeeply() {
	RT=0;
	totalCost=0;
	totalIrreg=0;
	totalObjVal=0;
	for (auto& route: routes) {
		route->updateFeasibleTourParameters();
		totalCost+=route->getCost();
		totalIrreg+=route->getIrregularity();
		RT+=route->getSumRT();
		totalObjVal+=route->getObjVal();
	}
}

/******************************** Remove methods *******************************/


// Remove request with the pickup id
void Solution::removeRequestById(size_t  id_p){
	if (isInserted(id_p)) {
		auto pickup=nodes[id_p];
		int id_sym= (int)pickup->getIdsym();
		auto delivery=nodes[id_sym];
		size_t idTour= *(nodes[id_p]->id_round);
		RequestInfo req(pickup,delivery,(int)idTour);
		req.i= (int)nodes[id_p]->posInRou;
		req.j= (int)nodes[id_sym]->posInRou;
		Route *t=routes[req.tourid];
		req.vehicle=t->getVehicle();
		bool feasible=t->removeRequest(req);
		PPK_ASSERT_WARNING(feasible,t->formatJson("warning","RemoveRequestById results in infeasibility, the user will be reinserted in the solution"));
		if(feasible){
			pickupNonInserted.push_back(id_p);
			recomputePerfs();
		}
	}
}

void Solution::removeSetOfRequestById(vector<size_t>& request){
	vector<vector<bool> > nodeInTourToRem(routes.size());
	for (size_t i = 0; i < routes.size(); ++i) {
		nodeInTourToRem[i].resize(routes[i]->nodes.size(),false);
	}
	for(size_t idP: request){
		if (isInserted(idP)){
			//recupérer le tour et les id des nodes
			size_t idT=*nodes[idP]->id_round;
			size_t posD=*nodes[idP]->posSymInRou;
			size_t posP=nodes[idP]->posInRou;
			nodeInTourToRem[idT][posP]=true;
			nodeInTourToRem[idT][posD]=true;
			pickupNonInserted.push_back(idP);
		}
	}
	for (size_t i = 0; i < routes.size(); ++i) {
		bool toRecompute=false;
		Route * t=routes[i];
		for (int j = (int)t->nodes.size()-1; j >= 0; --j) { // Dont change j to size_t
			if(nodeInTourToRem[i][j]){
				t->nodes.erase(t->nodes.begin()+j);
				toRecompute=true;
			}
		}
		if(toRecompute){
			// remettre en cause le vehicule : nullptr
			bool feasible=t->updateFeasibleTourParameters(nullptr);
			PPK_ASSERT(feasible,"tour infeasible wile removing multiple request at a time!");
		}
	}
	recomputePerfs();
}

/******************************** Autres *******************************/


long long Solution::getHash(){

	return (long long) this->getObjectiveValue() ;
}

bool Solution::isNotInserted(size_t id){
	id=min(id,nodes[id]->getIdsym());
	if(find(pickupNonInserted.begin(),pickupNonInserted.end(),id)!=pickupNonInserted.end())
		return true;
	return false;
	//	for (size_t idn : pickupNonInserted) {
	//		if(idn==id){
	//			return true;
	//		}
	//	}
	//	return false;
}


bool Solution::isInserted(size_t id){
	id=min(id,nodes[id]->getIdsym());
	PPK_ASSERT(find(activeUsers.begin(),activeUsers.end(),id)!=activeUsers.end());
	if(isNotInserted(id))
		return false;
	return true;
}


/******************************** Afficher *******************************/

std::ostream& operator<<(std::ostream& out, Solution& f) {
	int nbRec=0;
	for (size_t i = 0; i < f.getNbRoutes(); ++i) {
		if(f.getRoute_const(i)->nodes.size()>2){
			out << *f.getRoute_const(i) << "\n";
			nbRec=max(nbRec,f.getRoute_const(i)->getNbReconfigurations());
		}
	}
	out << "Nb Reconfigurations:\t" <<nbRec<< "\n";
	out << "Total cost:\t" << f.getObjectiveValue()<< "\n";

	//Calcul du ride time total

	out << "Cumulated ride time:\t" << f.getRT() << "\n";
	return out;
}


string Solution::to_json(bool write_file, std::string path_f) const{
	std::stringstream ss;
	ss <<"{";
	ss <<"\"name\":"<<"\""<<this->getName()<<"\"";
	ss <<",\"nbUsers\":"<<"\""<<this->getActiveUsers().size()<<"\"";
	ss <<",\"objectiveValue\":"<<this->getObjectiveValue();
	ss <<",\"irregularity\":"<<this->getTotalIrreg();
	ss <<",\"cost\":"<<this->getTotalCost();
	if(isFeasible() && noError())
		ss <<",\"feasible\":true";
	else{
		ss <<",\"feasible\":false";
		ss << ",\n\"errors\":" << errors_to_json()<<"\n";
	}
	if(isNoStructureError()){
		ss <<",\"multiplier\":"<<cst::multiplier;
		ss <<",\"nbIteration\":"<<execNbIteration;
		ss <<",\"execTime\":"<<execTime;

		auto sep = ""; // initially the separator is empty
		//	if(cst::pool){
		//		ss <<",\"pool\": [";
		//		for (auto& route: poolReserve) {
		//			ss<<sep<<route.second->to_json();
		//			sep = ","; // make the separator a comma after first item
		//		}
		//		ss <<"]";
		//	}

		ss <<",\n\"nonInsertedUsers\": [";
		sep = ""; 		// initially the separator is empty
		for (size_t nonInsertedUser: pickupNonInserted) {
			ss << sep << "\n" << nonInsertedUser;
			sep = ","; // make the separator a comma after first item
		}
		ss <<"],\n\"activeUsers\": [";
		sep = ""; 		// initially the separator is empty
		for (size_t activeUser: activeUsers) {
			ss << sep << "\n" << activeUser;
			sep = ","; // make the separator a comma after first item
		}
		ss <<"],\n\"routes\": [";
		// initially the separator is empty
		sep = "";
		for (size_t i = 0 ; i < routes.size(); ++i) {
			if(routes[i]->nodes.size()>2){
				ss<<sep<<"\n"<<routes[i]->to_json();
				sep = ","; // make the separator a comma after first item
			}
		}
		ss <<"]";
	}
	ss <<"}";

	string s=json::parse(ss).dump(2);
	if(write_file){
		ofstream myfile;
		myfile.open(path_f);
		myfile<<s;
		myfile.close();
	}
	return s;
}
/**
 * This method loads a complete feasible solution from a json file.
 */
bool Solution::from_json(json& jSol, bool partialSol, bool repairSolution){
	vector<size_t> newActiveUsers;
	if(partialSol) newActiveUsers=activeUsers;
	else reinit(newActiveUsers);
	vector<size_t> infeasibleRoutes;

	if (jSol.find("name")!=jSol.end())
		name=jSol.at("name").get<string>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	//all routes
	for (json & jRoute : jSol.at("routes").get< vector<json> >()){ // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

		//read the route id from json object for eval mode
		int idJsonRoute=-1;
		if (jRoute.find("id")!=jRoute.end()){
			idJsonRoute=jRoute.at("id").get<int>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		}

		//create vector of nodes from json file
		vector<Node *> nods=get_nodes_from_json(jRoute,idJsonRoute,partialSol);

		//get the corresponding empty route
		auto idVehicle=-1;
		if (jRoute.find("idVehicle")!=jRoute.end())
			idVehicle=jRoute.at("idVehicle").get<int>();
		Route * route = getEmptyRouteWithIdenticalDepots(nods.front(),nods.back(), idVehicle);

		if(evalMode) { //the route should to exists !
			if(route==nullptr) {
				setCapacityDepotError(idJsonRoute);
				return false;
			}
		}
		else
			PPK_ASSERT(route!=nullptr,"capacity error at deposits (ids: %i and %i) the route can not be created",(int)route->nodes.front()->getIdUser(),(int)route->nodes.back()->getIdUser());

		//filling tJsonRoutehe route with nodes
		route->nodes.resize(nods.size());
		route->nodes.back()=route->nodes[1];
		for (int i = 1; i < (int)nods.size()-1; ++i){

			//check the structure of the route depot and order of nodes
			if(evalMode){
				if(nods[i]->isDepot())
					setPositionNodeError(idJsonRoute,i);
			}
			else
				PPK_ASSERT(!nods[i]->isDepot());

			//verify order of nodes
			bool deliveryFounded=false, pickupFounded=false;
			for (int j = 0; j < i; ++j) {
				//look for corresponding pickup before position i
				if(nods[i]->getIdUser()==nods[j]->getIdUser() && nods[j]->isPickup())
					pickupFounded=true;
				//look for corresponding delivery before position i
				if(nods[i]->getIdUser()==nods[j]->getIdUser() && nods[j]->isDelivery()){
					deliveryFounded=true;
					break;
				}
			}
			if( deliveryFounded || (nods[i]->isPickup() && pickupFounded )
					|| (nods[i]->isDelivery() && !pickupFounded) ){
				if(evalMode) setPositionNodeError(idJsonRoute,(int)i);
				else PPK_ASSERT(false,"error in order of json nodes");
			}

			//check that the node is not already inserted into another route
			if(nods[i]->id_round!=nullptr){
				if(evalMode){
					setPositionNodeError(idJsonRoute,(int)i);
					int idJsonOtherRoute=routes[(int)*nods[i]->id_round]->idJson;
					setPositionNodeError(idJsonOtherRoute,(int)nods[i]->posInRou);
				} else PPK_ASSERT(false,"node at position %i already inserted in route %i", (int)nods[i]->getIdUserJson(), nods[i]->id_round);
			}

			// add the node into the route
			route->nodes[i]=nods[i];
			if(nods[i]->isPickup())
				newActiveUsers.push_back(nods[i]->getIdUser());
		}

		//check that delivery nodes are placed after the corresponding pickup
		for (size_t i = 0; i < route->size(); ++i) {
			Node * nod=route->nodes[i];
			if(nod->isPickup()){
				bool deliveryFounded=false;
				for (size_t j = i+1; j < route->size(); ++j) {
					if(route->nodes[j]->getIdUser()==nod->getIdUser() && route->nodes[j]->isDelivery()){
						deliveryFounded=true;
						break;
					}
				}
				if(!deliveryFounded){
					if(evalMode) setPositionNodeError(idJsonRoute,(int)i);
					else PPK_ASSERT(false,"node at position %i in route %i does not have his symmetric in the same route", (int)nods[i]->getIdUserJson(), route->id);
				}
			}
		}

		//read the vehicle
		const VehicleType * vt = nullptr;
		if (jRoute.find("idVehicle")!=jRoute.end()){
			size_t idVehicle=jRoute.at("idVehicle").get<size_t>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
			vt=inst->getVehicleTypeJson(idVehicle);
			if(evalMode){ if(vt==nullptr) setVehicleTypeError(idJsonRoute);}
			else PPK_ASSERT(vt!=nullptr, "vehicle id %i from json not found for route %i", (int)idVehicle, idJsonRoute);
		}

		//stop if there are structural errors
		if(!isNoStructureError()) return false;

		//  evaluation of routes
		route->setEvalMode(true);
		route->setAllParametersFromVnodeOrder(vt);
		if(!route->isFeasible()){
			if(cst::verbosite>0) cout<<"The given route is infeasible: idJson"<<route->idJson<<endl;
			infeasibleRoutes.push_back(route->id);

			// Repair infeasible route
			if((cst::MPDARP || repairSolution) && !evalMode)
			{
				// Fix ride time violations
				if(route->getRideTimeErrors().size()>0){
					if(cst::verbosite>1) cout<<"Ride times are adjusted to attain feasibility"<<endl;
					for(auto position : route->getRideTimeErrors()){
						auto newRideTime=route->getNodeRT(route->nodes[position]);
						route->nodes[position]->setMaxRideTime(newRideTime);
						messageJson("modifications", "Ride times for " + route->nodes[position]->getUser()->getName()+ " are adjusted to achieve feasibility");
					}
				}

				// Fix time window violations
				if(route->getTimeWindowErrors().size()>0){
					if(cst::verbosite>1) cout<<"Time windows are adjusted to attain feasibility"<<endl;
					for(auto position : route->getTimeWindowErrors()){
						auto newTime=route->nodes[position]->getTime();
						route->nodes[position]->adjustTimeWindow(newTime,newTime);
						messageJson("modifications", "Time windows for " + route->nodes[position]->getUser()->getName()+ " are adjusted to achieve feasibility");
					}
				}

				// verify the route is now feasible
				route->setEvalMode(false);
				route->setAllParametersFromVnodeOrder(vt);
				PPK_ASSERT(route->isFeasible(),"The route is still infeasible after repairing step");
				if(cst::verbosite>1) cout<<"Route repaired!!!"<<endl;
				route->setEvalMode(evalMode);

				// route->reinitErrors();

			}
		}
		route->setEvalMode(evalMode);


		if(cst::verbosite>1)
			cout<<"[Sol] new route completed:"<<endl<<*route;
	}

	setActiveUsers(newActiveUsers);
	recomputePerfs();
	computeIdConfigParameters();

	if(cst::checkAll && !evalMode) check();
	return true;
}

Node * Solution::get_node_from_json(nlohmann::json & jObj,int idJsonRout){
	int idUser=jObj.at("idUser").get<int>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	std::string stype=jObj.at("type").get<std::string>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	int idItinerary;
	if (jObj.find("idItinerary")!=jObj.end())
		idItinerary=jObj.at("idItinerary").get<int>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
	else
		idItinerary=0;
	for(Node * n : nodes){
		if(idUser==(int)n->getIdUserJson() && Node::convertTypeJson2nodeType(stype)==n->getType()){
			n->setItinerary(idItinerary);
			return n;
		}
	}
	if(evalMode) setUserNotFoundError(idJsonRout,idUser);
	else PPK_ASSERT(false,"user not found "); // make true?
	return nullptr;
}

std::vector<Node *>Solution::get_nodes_from_json(nlohmann::json & jObj,int idJsonRoute, bool partialSol){
	std::vector<Node *> routeNodes;
	vector<json> jNodes=jObj.at("nodes").get< vector<json> >(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

	routeNodes.push_back(get_node_from_json(jNodes[0])); //departure depot
	for (size_t i = 1; i < jNodes.size()-1; ++i) {
		if(evalMode){
			routeNodes.push_back(get_node_from_json(jNodes[i]));
		}else{
			int idUser=jNodes[i].at("idUser").get<int>();
			if(partialSol){
				if(find(activeUsers.begin(),activeUsers.end(),idUser)!=activeUsers.end())
					routeNodes.push_back(get_node_from_json(jNodes[i]));
			}else{
				routeNodes.push_back(get_node_from_json(jNodes[i]));
			}
		}
	}
	routeNodes.push_back(get_node_from_json(jNodes[jNodes.size()-1])); //arrival depot

	if(evalMode){
		if(routeNodes.front()->getType()!=depotOut) setPositionNodeError(idJsonRoute, 0);
		if(routeNodes.back()->getType()!=depotIn) setPositionNodeError(idJsonRoute, (int)routeNodes.size()-1);
	}else{
		PPK_ASSERT(routeNodes.front()->getType()==depotOut, "starting node is not an out depot");
		PPK_ASSERT(routeNodes.back()->getType()==depotIn, "ending node is not an in depot");
	}
	return routeNodes;
}

std::string Solution::eval(std::string str_json_route){
	json jsol = json::parse(str_json_route);
	return eval(jsol);
}

string Solution::eval(json & s) {
	setEvalMode(true);
	from_json(s);
	setEvalMode(false);
	return this->to_json();
}

Route * Solution::getEmptyRouteWithIdenticalDepots(const Node * nodDepotOut, const Node * nodDepotIn, int idVehicle) const{
	for(auto& r: routes){
		if((int)r->nodes.size()==2){
			bool availableVehicle = (idVehicle<0);
			if(idVehicle>=0)
				availableVehicle=r->isInTheVehicleList(idVehicle);
			if(availableVehicle){
				if(r->nodes.front()->getIdUser() == nodDepotOut->getIdUser() && r->nodes.back()->getIdUser() == nodDepotIn->getIdUser()){
					return r;
				}
			}
		}
	}
	return nullptr;
}

Route * Solution::getEmptyRouteWithIdenticalHash(const Route* rbase) const{
	FormatString fs;
	auto hashCompleteRoute =rbase->getHashUnordered();
	std::vector<size_t> hashEmptyRoute(&hashCompleteRoute[0], &hashCompleteRoute[2]);
	for(auto& r: routes){
		if((int)r->nodes.size()==2){
			if(r->getHashUnordered()==hashEmptyRoute){
				return r;
			}
		}
	}
	return nullptr;
}



/**
 * This method loads a partial solution from a json file.
 */
bool Solution::warmStartRoutes(json& jSol) {
	reinit(activeUsers);

	//forall routes
	for (json & jRoute : jSol.at("routes").get< vector<json> >()){ // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")

		//read the id from json
		int idJsonRoute=-1;
		if (jRoute.find("id")!=jRoute.end()){
			idJsonRoute=jRoute.at("id").get<int>(); // @suppress("Invalid arguments") // @suppress("Symbol is not resolved")
		}

		//read the nodes and the id
		vector<Node *> nodes=get_nodes_from_json(jRoute,idJsonRoute,true);

		//get the corresponding empty route
		auto idVehicle=idJsonRoute=jRoute.at("idVehicle").get<int>();
		Route * route = getEmptyRouteWithIdenticalDepots(nodes.front(),nodes.back(),idVehicle);

		PPK_ASSERT(route!=nullptr,"capacity error at deposits (ids: %i and %i) the route can not be created",(int)route->nodes.front()->getIdUser(),(int)route->nodes.back()->getIdUser());

		//fill the route
		route->nodes.resize(nodes.size());
		route->nodes.back()=route->nodes[1];
		for (int i = 1; i < (int)nodes.size()-1; ++i)
		{
			//verifies if delivery node is after pikup node
			bool deliveryFounded=false, pickupFounded=false;
			for (int j = 0; j < i; ++j) {
				//look for corresponding pickup before position i
				if(nodes[i]->getIdUser()==nodes[j]->getIdUser() && nodes[j]->isPickup())
					pickupFounded=true;
				//look for corresponding delivery before position i
				if(nodes[i]->getIdUser()==nodes[j]->getIdUser() && nodes[j]->isDelivery()){
					deliveryFounded=true;
					break;
				}
			}
			if( deliveryFounded || (nodes[i]->isPickup() && pickupFounded )
					|| (nodes[i]->isDelivery() && !pickupFounded) ){
				PPK_ASSERT(false,"error in order of json nodes");
			}

			//check that the node is not already inserted in another route
			if(nodes[i]->id_round!=nullptr){
				PPK_ASSERT(false,"node at position %i already inserted in route %i", (int)nodes[i]->getIdUserJson(), route->idJson);
			}

			// add the node
			route->nodes[i]=nodes[i];
			set_as_inserted(nodes[i]);
			//newActiveUsers.push_back(nodes[i]->getIdUser());
		}

		//check if all pickup has its delivery node after it
		for (size_t i = 0; i < route->size(); ++i) {
			Node * nod=route->nodes[i];
			if(nod->isPickup()){
				bool delivFounded=false;
				for (size_t j = i+1; j < route->size(); ++j) {
					if(route->nodes[j]->getIdUser()==nod->getIdUser() && route->nodes[j]->isDelivery()){
						delivFounded=true;
						break;
					}
				}
				if(!delivFounded){
					if(evalMode) setPositionNodeError(idJsonRoute,(int)i);
					else PPK_ASSERT(false,"node at position %i in route %i does not have his symmetric in the same route", (int)nodes[i]->getIdUserJson(), route->idJson);
				}
			}
		}

		//stop if there are structural errors
		if(!isNoStructureError()) return false;

		//recompute all the well structured route
		route->setAllParametersFromVnodeOrder();

		if(cst::verbosite>1)
			cout<<"[Sol] new route filled:"<<endl<<*route;
	}
	//	setActiveUsers(newActiveUsers);
	recomputePerfs();
	computeIdConfigParameters();

	if(cst::checkAll && !evalMode)
		check();
	return true;
}



std::vector<int> Solution::getInsertedUsers() {
	vector<int> inserted;
	inserted.reserve(activeUsers.size());
	for(Route * route : routes){
		for(auto node : route->nodes){
			if(node->isPickup()){
				inserted.push_back((int)node->getIdUser());
			}
		}
	}
	sort(inserted.begin(),inserted.end());
	return inserted;
}

void Solution::setPreviousSolution(Solution* prevSol) {
	for (size_t i = 0; i < nodes.size(); ++i) {
		Node * node0=prevSol->getNode(i);
		Node * node1=getNode(i);
		if( !node0->isDepot() && prevSol->isActive(node0)){
			node1->setPreviousTime(node0->getTime());
		} else {
			node1->setPreviousTime(-1);
		}
	}
}


void Solution::createTimeWindodws(Solution* prevSol) {

	for (size_t i = 0; i < nodes.size(); ++i) {
		Node * node0=prevSol->getNode(i);
		Node * node1=getNode(i);
		if(!node0->isDepot() && prevSol->isActive(node0)){
			// set reference time
			node1->setPreviousTime(node0->getTime());
			// update max ride time constrains
			node1->setMaxRideTime(node0->getMaxRT()); // this is useful when timing constraints of prevSol were adjusted

			// update time window constrains
			auto res = std::find(inst->getConsistencyType().begin(),inst->getConsistencyType().end(), node1->getType());
			if(res != inst->getConsistencyType().end()){

				node1->setConsistentTimeWindow(node0->getTime());
//				if(node1->getType()==nodeType::pickup)
//					node1->createTimeWindowPickup(node0->getTime());
//				if(node1->getType()==nodeType::delivery)
//					node1->createTimeWindowDelivery(node0->getTime());
			}
		}else{
			node1->setPreviousTime(-1);
		}
	}
}

std::string Solution::getTimesVsPreviousTimeForNodes()const {
	stringstream ss;
	ss<<Node::toStringTitle()<<" Irreg"<<endl;
	double irreg=0;
	for(Node * node : nodes){
		if(isActive(node) && !node->isDepot()){
			ss<<node->toString()<<"\t"<<node->getIrregularity()<<endl;
			irreg+=node->getIrregularity();
		}
	}
	ss<<"SumIrregularity\t"<<irreg<<endl;
	ss<<"AvgIrregularity\t"<<irreg/(double)inst->getNbUsers()<<endl;
	return ss.str();
}

std::string Solution::getConsistencyStats() const{
	stringstream ss;
	ss<<Node::toStringTitle()<<" Irreg"<<endl;
	double irreg=0;
	int cont=0;
	for(Node * node : nodes){
		if(isActive(node)){
			auto res = find(inst->getConsistencyType().begin(),inst->getConsistencyType().end(), node->getType());
			if(res != inst->getConsistencyType().end()){
				ss<<node->toString()<<"\t"<<node->getIrregularity()<<endl;
				irreg+=node->getIrregularity();
				cont++;
			}
		}
	}
	if(cont>0)
		ss<<"\nIrregularity\t"<<irreg <<"/"<<cont<<" = " <<irreg*100.0/(double)cont<<"%"<<endl;
	return ss.str();
}

std::string Solution::errors_to_json() const {
	json j;
	j["vehicleTypeError"]=vehicleTypeError;
	j["userNotFoundError"]=userNotFoundError;
	j["positionNodeError"]=positionNodeError;
	j["capacityDepotError"]=capacityDepotError;
	string s=j.dump();
	return s;
}

double Solution::computeTotalWait() const {
	double totalWait=0;
	for(Route * route : routes)
		if(route->nodes.size()>2)
			totalWait+=(double)route->computeSumWaitingTimes();
	return totalWait;
}

std::string Solution::toString(bool write_file, std::string path_f) const{
	stringstream s;
	s<<"\n";
	s<<"T_Objective\t"<<this->getObjectiveValue()<<"\n";
	s<<"T_Cost\t"<<this->getTotalCost()<<"\n";
	s<<"T_Inconsistency\t"<<this->getTotalIrreg()<<"\n";
	s<<"T_Wait\t"<<this->getTotalIrreg()<<"\n";
	s<<"nbUsers\t"<<this->getActiveUsers().size()<<"\n";
	for(auto route : this->routes){
		if(route->nodes.size()>2)
			s<<route->str_tour();
	}
	if(write_file){
		ofstream myfile;
		myfile.open(path_f);
		myfile<<s.str();
		myfile.close();
	}

	return s.str();
}
