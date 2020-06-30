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
 
#include "../lib/ppk_assert.h"
#include "../lib/lib_tools.h"
#include <sstream>

#include "../lib/json.hpp"
#include "Node.h"

using namespace std;
using json = nlohmann::json;


Node::Node(const Instance * _inst, const User * n, size_t _id, size_t _idsym, nodeType _type) {
	inst = _inst;
	id=_id;
	idsym=_idsym;
	user=n;
	type=_type;
	timePrev=-1;
	// DEBUG
	PPK_ASSERT((type==pickup && n->getId()==id) || (type==delivery && n->getId()==idsym)
			|| (type == depotOut) || (type == depotIn));
	// END
	load.resize(inst->getNbUserType());
	id_round=nullptr;
	//typeDepot=0;
	setItinerary((size_t)0);
	available_itineraries=user->getItineraries();
}

void Node::reinit(){
	for(int & l : load) l=0;
	id_round=nullptr;
	setItinerary((size_t)0);
	available_itineraries=user->getItineraries();
}

std::string Node::to_json() const {
	std::stringstream ss;
	ss <<"{";
	ss <<"\"idUser\":"<<user->getIdJson();
	ss <<",\"type\":\""<<getTypeStr()<<"\"";
	ss <<",\"idItinerary\":"<<itinerary->getIdJson();
	ss <<",\"irregularity\":"<<this->getIrregularity();
	ss <<",\"idPoint\":"<<point->getIdJson();
	ss <<",\"time\":"<<time;
	if(cst::MPDARP) ss <<",\"timePrev\":"<<timePrev;
	ss <<",\"debug\":"<<"\""<<"id:"<<getId()<<", user:"<<user->getId()<<", itin:"<<itinerary->get_id()<<", point:"<<point->getId()<<"\"";
	ss <<"}";
	return ss.str();
}

void Node::check() const{
	bool test=false;
	for (const Itinerary * itin: user->getItineraries())	{
		if (itin==itinerary){
			//verify existence of itinerary
			test=true;
			//verify the point
			const Point * p;
			if(isOutType())
				p=inst->getPoint(itinerary->get_pickup());
			else
				p=inst->getPoint(itinerary->get_delivery());
			PPK_ASSERT(point==p);
			break;
		}
	}
	PPK_ASSERT(test, "Node %i has a wrong itinerary that does not exists for corresponding user !",(int)id);
}

nodeType Node::convertTypeJson2nodeType(string stype) {
	if(stype=="pickup" || stype=="0" || stype=="p"){
		return pickup;
	}
	else if(stype=="delivery" || stype=="1" || stype=="d"){
		return delivery;
	}
	else if(stype=="depotOut" || stype=="2" || stype=="+"){
		return depotOut;
	}
	else if(stype=="depotIn" || stype=="3" || stype=="-"){
		return depotIn;
	}
	PPK_ASSERT(false, "type not found");
	return pickup; //useless
}

void Node::createTimeWindowPickup(long timePrev) {
	for(auto it : available_itineraries){
		it->set_tw_start_pick(std::max(it->a_pickup(), timePrev - cst::deltaIrreg));
		it->set_tw_end_pick(std::min(it->b_pickup(), timePrev + cst::deltaIrreg));
	}
	this->timePrev = timePrev;
}
void Node::createTimeWindowDelivery(long timePrev) {
	for(auto it : available_itineraries){
		it->set_tw_start_del(std::max(it->a_delivery(), timePrev - cst::deltaIrreg));
		it->set_tw_end_del(std::min(it->b_delivery(), timePrev + cst::deltaIrreg));
	}
	this->timePrev = timePrev;
}

void Node::setConsistentTimeWindow(long timePrev){
	for(auto it : available_itineraries){
		if(this->getType()==pickup){
			it->set_tw_start_pick(std::max(it->a_pickup(), timePrev - cst::deltaIrreg));
			it->set_tw_end_pick(std::min(it->b_pickup(), timePrev + cst::deltaIrreg));
		}if(this->getType()==delivery){
			it->set_tw_start_del(std::max(it->a_delivery(), timePrev - cst::deltaIrreg));
			it->set_tw_end_del(std::min(it->b_delivery(), timePrev + cst::deltaIrreg));
		}
	}
}

void Node::adjustTimeWindow(long lowerBound,long upperBound){
	for(auto it : available_itineraries){
		if(this->getType()==pickup){
			it->set_tw_start_pick(std::min(it->a_pickup(), lowerBound));
			it->set_tw_end_pick(std::max(it->b_pickup(), upperBound));
		}if(this->getType()==delivery){
			it->set_tw_start_del(std::min(it->a_delivery(), lowerBound));
			it->set_tw_end_del(std::max(it->b_delivery(), upperBound));
		}
	}
}


void Node::setMaxRideTime(long newMaxRideTime){
	for(auto it : available_itineraries){
		it->set_maxRT(newMaxRideTime);
	}
}

void Node::setTimeWindows(Node* node){
	PPK_ASSERT((node->available_itineraries.size()==this->available_itineraries.size()),messageJson("internalError", "impossible copy of time windows due to different size of itineraries"));
	auto newIt = node->available_itineraries.begin();
	for(auto it : available_itineraries){
			it->set_tw_start_pick((*newIt)->a_pickup());
			it->set_tw_end_pick((*newIt)->b_pickup());
			it->set_tw_start_del((*newIt)->a_delivery());
			it->set_tw_end_del((*newIt)->b_delivery());
		newIt++;
	}
}



std::string Node::toString() {
	stringstream ss;
	ss<<id<<"\t"<<itinerary->get_id()<<"\t"<<type<<"\t"<<user->getId()<<"\t"<<timePrev<<"\t"<<time;
	return ss.str();
}

std::string Node::toStringTitle(){
	return "Id\tItin\ttype\tuser\tT.Prev\ttime";
}

