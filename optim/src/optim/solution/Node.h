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
 
#ifndef NODESOL_H_
#define NODESOL_H_
#include <iostream>
#include "../instance/Instance.h"

/**
 * \class Node
 * \brief This class represents a node of the DARP graph; It can be of different types pickup, delivery or depot.
 */
class Node {
public:

	/**
	 * empty constructor usefull for copying
	 */
	Node(){timePrev=-1;}

	/**
	 * constructors
	 */
	Node(const Instance * _inst,const User* n, size_t _id, size_t _idsym, nodeType type);

	void reinit();

	virtual ~Node(){}

	/**
	 * convert the string in json file to nodeType();
	 */
	static nodeType convertTypeJson2nodeType(std::string stype);

	/**
	 * get the solution in a json format
	 * @return the solution in a json format
	 */
	std::string to_json() const;


	/**
	 * get the copy of the current object
	 * posSym and id_round can not be used with this copy so they are set to nullptr
	 */
	Node * getCopy(){
		Node * req=new Node();
		*req=*this;
		req->posSymInRou=nullptr;
		req->id_round=nullptr;
		return req;
	}

	std::string getTypeStr()const{
		if (type==pickup) return "pickup";
		else if (type==delivery) return "delivery";
		else if (type==depotOut) return "depotOut";
		else if (type==depotIn) return "depotIn";
		else return "";
	}

	static std::string toStringTitle();
	std::string toString();

	size_t getId() const {
		return id;
	}

	const User* getUser() const {
		return user;
	}

	void setTime(long time = 0) {
		this->time = time;
	}

	void setIdConfig(int idConfig) {
		this->idConfig = idConfig;
	}

	long getStime() const{
		if(isOutType())
			return itinerary->get_st_pick();
		return itinerary->get_st_del();
	}

	long a() const{
		if (type==pickup || type== depotOut)
			return itinerary->a_pickup();
		return itinerary->a_delivery();
	}

	long b() const{
		if (type==pickup || type== depotOut)
			return itinerary->b_pickup();
		return itinerary->b_delivery();
	}

	int l(const size_t & userType) const{
		if(isOutType())
			return user->l(userType);
		return -1*user->l(userType);
	}

	size_t getIdItin() const {
		return itinerary->get_id();
	}

	size_t getIdUser() const {
		return user->getId();
	}

	size_t getIdUserJson() const {
		return user->getIdJson();
	}

	long getMaxRT() const{
		return itinerary->getMaxRT();
	}

	bool isOutType() const {
		return (type==pickup || type== depotOut);
	}

	bool isDepotOut() const {
		return (type== depotOut);
	}

	bool isDepotIn() const {
		return (type== depotIn);
	}

	bool isDepot() const {
		return (type==depotIn || type== depotOut);
	}

	bool isPickup() const {
		return (type==pickup);
	}

	bool isDelivery() const {
		return (type==delivery);
	}

	size_t getPointId(){
		return point->getId();
	}

	size_t getRouteId(){
		return *(this->id_round);
	}

	nodeType getType() const {
		return type;
	}

	size_t getIdsym() const {
		return idsym;
	}

	void setItinerary(const size_t idIt) {
		setItinerary(user->it(idIt));
	}
	void setItinerary(const Itinerary * itin) {
		this->itinerary = itin;
		if(isOutType())
			this->point=inst->getPoint(itinerary->get_pickup());
		else
			this->point=inst->getPoint(itinerary->get_delivery());
	}

	double getIrregularity() const {
		return cst::L2D(getBinaryInconsistency(cst::deltaIrreg));
		//return cst::L2D(iregLinear(cst::deltaIrreg))/15;
	}

	long getBinaryInconsistency(const long delta) const {
		if(timePrev<0 || std::abs(timePrev-time)<=delta)
			return 0;
		return 1;
	}

	long iregLinear(const long seuil) const {
		if(timePrev<0 || std::abs(timePrev-time)<=seuil)
			return 0;
		return (std::abs(timePrev-time)-seuil);
	}

	/**
	 * Define a reference time for this node for time consistency
	 */
	void setPreviousTime(long timePrev) {
		this->timePrev = timePrev;
	}

	/**
	 * Create consistent pickup time windows
	 */
	void createTimeWindowPickup(long timePrev);

	/**
	 * Create consistent delivery time windows
	 */
	void createTimeWindowDelivery(long timePrev);


	/**
	 * Define consistent time window as follows
	 * TW = [max{TW_a; timePrev - toleranceIrregularity }, min{TW_b, timePrev + toleranceIrregularity }];
	 */
	void setConsistentTimeWindow(long timePrev);

	/**
	 * Adjust time window as follows
	 * TW= [min{TW_a; lowerBound}, max{TW_b, upperBound}]
	 * This is useful for fixing time window violations of initial solutions
	 */
	void adjustTimeWindow(long lowerBound,long upperBound);

	/**
	 * Redefine max ride time constrain
	 */
	void setMaxRideTime(long newMaxRideTime);

	/**
	 * Redefine time windows from another node
	 */
	void setTimeWindows(Node* node);




	/**
	 * checker
	 */
	void check() const;

	long getTime() const {
		return time;
	}

	long getTimePrev() const {
		return timePrev;
	}

	void setTimePrev(long timePrev) {
		this->timePrev = timePrev;
	}

	const Itinerary* getItinerary() const {
		return itinerary;
	}


	/***************************************************/
	/******************* Attributes ********************/
	/***************************************************/

private:
	//constant information
	const User * user=nullptr;			/**< user served by this object */
	nodeType type=pickup;				/** type of node see nodeType */
	size_t id=-1;						/*< id of the node. Need to position of the node in solution.nodes */
	size_t idsym=-1; 					/**< id of the corresponding Node in solution.nodes*/

public:
	// decision variables
	std::vector<int> load;			/*<cumulated load of the vehicle at departure of the node (size: nb_user_type) */
	long time=0;					/*<time at departure of the node*/
	long tnext=0;					/*<duration of the ar to the next node*/
	size_t posInRou=0;				/*<index of the current node in its route*/
	size_t* posSymInRou=nullptr;
	size_t* id_round=nullptr;				/*<id of the round of the current node*/
	const Itinerary * itinerary=nullptr;	/**< itinerary chosen for the user */
	const Point * point=nullptr;			/**< point corresponding to the itinerary and the type*/
	std::vector<Itinerary *> available_itineraries; //itineraries available for insertion
	int idConfig=0; 				/*< id of the configuration to use */


private:
	const Instance * inst=nullptr;							/**< The full instance */
	long timePrev;

};

#endif /* NODESOL_H_ */

