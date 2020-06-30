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
 
#ifndef ITINERARY_
#define ITINERARY_

#include <vector>
#include <ostream>
#include <climits>


/**
 * \class Intinerary
 * \brief This class represents an itinerary which is composed by a pickup and delivery nodes
 */
class Itinerary{

public:

	Itinerary(const std::string & str_json, const size_t & id);
	virtual ~Itinerary(){}

	std::string to_json();

private:

	size_t id; /*used to get hash on routes*/
	size_t id_json; /*used in json file*/
	size_t pickupPointId;
	size_t deliveryPointId;
	long maxRT=LONG_MAX;
	long s_time_pick=0;
	long s_time_del=0;
	long tw_start_pick=-1;					/**< lower bound time windows */
	long tw_start_del=-1;
	long tw_end_pick=-1;						/**< upper bound time window  */
	long tw_end_del=-1;
	std::string type="";
	std::string unitTime="second";

	//GDARP
	long cost=0;

public:

	size_t get_id() const{
		return id;
	}

	size_t getIdJson() const {
		return id_json;
	}

	size_t get_pickup() const{
		return pickupPointId;
	}

	size_t get_delivery() const{
		return deliveryPointId;
	}

	long getMaxRT() const{
		return maxRT;
	}

	void set_maxRT(long rt) {
		maxRT=rt;
	}

	long get_st_pick() const{
		return s_time_pick;
	}

	long get_st_del() const{
		return s_time_del;
	}

	long a_pickup() const{
		return tw_start_pick;
	}

	long a_delivery() const{
		return tw_start_del;
	}

	long b_pickup() const{
		return tw_end_pick;
	}

	long b_delivery() const{
		return tw_end_del;
	}

	void set_tw_start_pick(long t){
		tw_start_pick=t;
	}

	void set_tw_start_del(long t){
		tw_start_del=t;
	}

	void set_tw_end_pick(long t){
		tw_end_pick=t;
	}

	void set_tw_end_del(long t){
		tw_end_del=t;
	}

	long getCost() const {
		return cost;
	}
};

/**
* affichage avec cout <<
*/
std::ostream& operator<<(std::ostream&, const Itinerary&); //permet d'utiliser cout

#endif
