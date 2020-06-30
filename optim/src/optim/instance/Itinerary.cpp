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
 
#include "Itinerary.h"
#include <sstream>
#include "../lib/json.hpp"
#include "../constant.h"

using namespace std;
using json = nlohmann::json;

Itinerary::Itinerary(const std::string & str_json,const size_t & _id){
	id=_id;
	json j = json::parse(str_json);
	id_json=j.at("id").get<size_t>();
	pickupPointId = j.at("pickupPointId").get<size_t>();
	deliveryPointId = j.at("deliveryPointId").get<size_t>();
	maxRT = cst::D2L(j.at("maxRT").get<double>());
	s_time_pick= cst::D2L(j.at("stimePickup").get<double>());
	s_time_del= cst::D2L(j.at("stimeDelivery").get<double>());
	std::vector<double> tw = j.at("twPickup").get<std::vector<double>>();
	tw_start_pick= cst::D2L(tw[0]);
	tw_end_pick= cst::D2L(tw[1]);
	tw = j.at("twDelivery").get<std::vector<double>>();
	tw_start_del= cst::D2L(tw[0]);
	tw_end_del= cst::D2L(tw[1]);
	type=j.at("type").get<string>();

	//verif unit
	string unitTime=j.at("unitTime").get<string>();
	PPK_ASSERT(unitTime=="second" || unitTime=="s");

	//GDARP
	if(cst::GDARP_instance){
		cost=cst::D2L(j.at("cost").get<double>());
	}
}

std::string Itinerary::to_json() {
	stringstream ss;
	ss<<"{";
	ss<<"\"id\":"<<id_json<<",";
	ss<<"\"pickupPointId\":"<<pickupPointId<<",";
	ss<<"\"deliveryPointId\":"<<deliveryPointId<<",";
	ss<<"\"maxRT\":"<<cst::L2D(maxRT)<<",";
	ss<<"\"stimePickup\":"<<cst::L2D(s_time_pick)<<",";
	ss<<"\"stimeDelivery\":"<<cst::L2D(s_time_del)<<",";
	ss<<"\"twPickup\":["<< cst::L2D(tw_start_pick) <<","<< cst::L2D(tw_end_pick) <<"],";
	ss<<"\"twDelivery\":["<< cst::L2D(tw_start_del) <<","<< cst::L2D(tw_end_del) <<"],";
	ss<<"\"type\":"<<type<<",";
	ss<<"\"unitTime\":"<<unitTime;
	ss<<"}";
	return ss.str();
}


std::ostream& operator<<(std::ostream& out, const Itinerary& it){
	out<<"\t"<<it.get_pickup();
	out<<"\t"<<it.a_pickup();
	out<<"\t"<<it.b_pickup();
	out<<"\t"<<it.get_st_pick();
	out<<"\t"<<it.get_delivery();
	out<<"\t"<<it.a_delivery();
	out<<"\t"<<it.b_delivery();
	out<<"\t"<<it.get_st_del();
	out<<"\t"<<it.getMaxRT();
	return out;
}
