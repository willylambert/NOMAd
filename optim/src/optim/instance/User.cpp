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
 
#include "User.h"

#include <sstream>
#include "../lib/json.hpp"
#include "../constant.h"

using namespace std;
using json = nlohmann::json;


User::User(const std::string& str_json, const size_t & _id) {
	from_json(str_json,_id);
}

void User::from_json(const std::string& str_json,const size_t & _id) {
	id=_id;
	json j = json::parse(str_json);
	id_json=j.at("id").get<size_t>();
	name=j.at("name").get<string>();
	size_t id_itin=0;
	for (auto& jit : j.at("itineraries").get< vector<json> >()){
		Itinerary * it = new Itinerary(jit.dump(),id_itin++);
		itineraries.push_back(it);
	}
	PPK_ASSERT(id_itin>0,"there is no itinerary for user/depot '%s' (id: %i, id_json: %i)",name.c_str(),(int)id, (int)id_json);
	load=j.at("load").get<vector<int>>();
	for(auto lo : load) PPK_ASSERT(lo>=0,"the load is not positive for user/depot '%s' (id: %i, id_json: %i)",name.c_str(),(int)id, (int)id_json);
	demands=j.at("demands").get<vector<int>>();
}

std::string User::to_json() {
	stringstream ss;
	ss<<"{";
	ss<<"\"id\":"<<id_json<<",";
	ss<<"\"name\":"<<name<<",";
	ss<<"\"itineraries\":[";
	string sep="";
	for(auto * itin : itineraries){
		ss<<sep<<itin->to_json();
		sep=",";
	}
	ss<<"],";
	sep="";
	for(auto l : load){
		ss<<sep<<l;
		sep=",";
	}
	ss<<"]";
	ss<<"}";
	return ss.str();
}

User::~User() {
	for (auto * it : itineraries){
		delete it;
	}
}

std::ostream& operator<<(std::ostream& out, const User& use){
	out<<"\t"<<use.getId();
	out<<"\t"<<use.name;
	for(auto * itin : use.itineraries){
		out<<"\t"<< *itin;
	}
	return out;
}
