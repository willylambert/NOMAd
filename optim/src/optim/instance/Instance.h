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
#ifndef INSTANCE_H_
#define INSTANCE_H_

#include "../constant.h"
#include "User.h"
#include "Point.h"
#include "Depot.h"
#include "VehicleType.h"
#include "../lib/json.hpp"

#include <fstream>
#include <string>
#include <vector>


enum nodeType{pickup,delivery,depotOut,depotIn};



/**
 * \class Instance
 * \brief The instance of the FSM-DARP-RC problem
 */
class Instance {

public:

	//Instance(){};

	/**
	 * load a well formated json
	 * see unitTests/XX.json for description of the input format
	 */
	Instance(std::ifstream & strm_json){
		nlohmann::json jSol=nlohmann::json::parse(strm_json);
		from_json(jSol);
		instanceJson=jSol.dump(3);
	}
	Instance(const std::string & str_json){
		PPK_ASSERT(str_json.size()>0);
		nlohmann::json jInst=nlohmann::json::parse(str_json);
		from_json(jInst);
		instanceJson=str_json;
	}
	Instance(nlohmann::json & jObj){
		from_json(jObj);
		instanceJson=jObj.dump(3);
	}

	/**
	 * initialize the instance after the constructor
	 */
	void init();

	//Destructor
	~Instance();

	/**
	 * << operator
	 */
	friend std::ostream& operator<<(std::ostream&, const Instance&);

	/**
	 * read json instance
	 */
	void from_json(nlohmann::json& jObj);

	/**
	 * return instance string in json format and write into pathFile
	 */
	std::string to_json(std::string pathFile="") const;


	/**
	 * Pretty print of instance file
	 * @param loop_limite limite d'affichage pour les boucles
	 * @param display_matrix if true display the time and distance matrix
	 * @return a string presnetinf the instance
	 */
	std::string serialize(size_t  loop_limite=1000, bool display_matrix=false) const;


	/**
	 * Computes the maximum capacity of all vehicles and configurations:  max value of each user type
	 */
	void computeMaxVehicleCapacity();


	/**
	 * set the triangular inequality on time
	 * the distance matrix is also updated to respect the new path
	 */
	void forceTriangularInequality();


	/**
	 * get vehicle with json id
	 */
	const VehicleType * getVehicleTypeJson(const size_t & idVtJson) const;


private :


	// calculate the maximum time, useful in time removal operator
	void calcMaxTime();

	//given a depot, computes :
	//	if type is pickup (0,2), the earliest time of pickup possible
	//	if type is delivery (1,3), the latest time of delivery possible
	long arrival_time_from_depot(const Itinerary *it, size_t dep, size_t type);



	/**
	 * Add the fixed service time of the point $j$ on the arc $i,j$ for all points $i$
	 */
	void addStimeFixeToTimeMatrix();

	/**
	 * transform the nodeType into string {"pickup","delivery","depotIn","depotOut"}
	 */
	nodeType strToNodeType(std::string str);

	std::string nodeTypeToStr(nodeType node);

	/************************* Checker **************************/

public:
	/**
	 * Check the consistency of the instance data
	 */
	void check() const ;

private:

	/**
	 * Check the consistency of the instance data
	 */
	void checkAttributesConsistency() const ;

	/**
	 * check the tringular intequality of distance and time matrices
	 */
	void checkTriangularInequality() const ;
	void fixTriangularIneguality();

	/**
	 * check fesibility of all requests
	 * @return true if all time windows are feasible
	 */
	void checkPickupAndDeliveryTimeWindows() const ;

	/**
	 * check if it is possible to respect the max ride time
	 * @return true if all ride times are feasible
	 */
	void checkRideTimeConstraints() const ;


	/**
	 * This method formats the @message into Json valid string with aditionnal information about location and type of problem
	 * users is a vector in case there are multiple users experimenting the same problem
	 * @type  "error" or "warning"
	 */
	const char * formatJson(std::string type,  std::string message, const std::vector<User*> users=std::vector<User*>(), const std::vector<std::string> msgs=std::vector<std::string>()) const;

	/***************************** getters & setters *******************************/
public :

	// getters and setters
	size_t getNbNodes() const{
		return time_ij.size();
	}

	const VehicleType * getVehicleType(const size_t & id) const {
		return vehicleTypes[id];
	}

	const std::vector<int>& getMaxcap() const {
		return maxcap;
	}

	size_t getNbDepots() const {
		return nb_depots;
	}

	size_t getNbUsers() const {
		return nb_users;
	}

	size_t getNbUserType() const {
		return nb_user_type;
	}::

	size_t getNbVehicleTypes() const {
		return nb_vehicle_types;
	}

	const long & getTime(const size_t & i,const size_t & j) const {
		return time_ij[i][j];
	}

	const long & getDist(const size_t & i,const size_t & j) const {
		return distance_ij[i][j];
	}

	int getMaxNbReconfigurations() const {
		return maxNbReconfigurations;
	}

	const std::string& getName() const {
		return name;
	}

	const User* getUser(const size_t & id) const {
		return users[id];
	}

	const User* getUserJson(const size_t & idJson) const {
		for(User * user : users){
			if(user->getIdJson()==idJson)
				return user;
		}
		return nullptr;
	}

	const std::vector<User*>& getUsers() const {
		return users;
	}

	const Point* getPoint(const size_t & pos) const {
		return points[pos];
	}

	const std::vector<Point*>& getPoints() const {
		return points;
	}

	long getMaxtime() const {
		return maxtime;
	}

	const Depot* getDepot(const size_t & pos) const {
		return depots[pos];
	}

	const std::vector<Depot*>& getDepots() const {
		return depots;
	}

	Depot* getDepotById(int idDepot) const {
		for(auto depot : depots)
			if((int)depot->getId()==idDepot)
				return depot;
		return nullptr;
	}


	size_t getNbPoints() const {
		return nb_points;
	}

	/**
	 * get the list of vehicle types sorted by the quantity of each type
	 */
	std::vector<const VehicleType*> getVehiclesSortedByQuantity() const;
	/**
	 * get the list of vehicle types with unlimited quantity
	 */
	std::vector<const VehicleType*> getVehiclesWithUnlimitedQuantity() const;

	//start for GDARP
	double getAlpha() const {
		return alpha;
	}

	const std::vector<std::string>& getPeriods() const {
		return periods;
	}

	size_t getNbPeriods() const {
		return nbPeriods;
	}

	const std::vector<VehicleType*>& getVehicleTypes() const {
		return vehicleTypes;
	}

	const std::vector<nodeType>& getConsistencyType() const {
		return consistency;
	}

	void setName(const std::string &name) {
		this->name = name;
	}

	//end for GDARP




	/****************************Attributs************************************/
private:
	std::string name; /*< name of the problem*/
	std::string instanceJson; /*< instance in json format*/

	/**
	 * list of all users
	 */
	std::vector<User *> users;
	size_t nb_users;  						/*<  the total number of request of the problem*/

	/**
	 * list of all points
	 */
	std::vector<Point *> points;
	size_t nb_points;  						/*<  the total number of geographical points of the problem*/

	/**
	 * list of all depots
	 */
	std::vector<Depot *> depots;
	size_t nb_depots;  							/*<  number of different depots */

	/**
	 * list of all vehicle types
	 */
	std::vector<VehicleType*> vehicleTypes;


	size_t nb_vehicle_types;  					/*<  number of different vehicle types */

	//parameters
	size_t nb_user_type;						/*<  total number of user nodes*/

	std::vector<nodeType> consistency; 					/*<  defines how time consistency will be measure i.e. pickup  implies that only the pickup consistency is considered*/

	long maxtime;								/*<  the lenght of the plannig horizon,  corresponds to the latest possible driving time for a vehicle */
	int maxNbReconfigurations=0;     				/*<  max number of en-reconfigurations allowed in a route*/

	std::vector<int> maxcap;       				/*<  capacity of a virtual vehicle with the highest vehicle capacity in al dimensions  maxcap[u] = max_{i \in V}  \{ vehicles[i].capacity[u] \}*/
	std::vector<std::vector<long> > time_ij;   	/*< time_ij[i][j] :  transport time between a node with id=i and any other node with id=j */
	std::vector<std::vector<long> > distance_ij; /*< distance_ij[i][j] :  transport distance between a node with id=i and any other node with id=j */

	//start for GDARP
	double alpha=0;
	//end for GDARP

	std::vector<std::string> periods;
	size_t nbPeriods;
};



#endif /* INSTANCE_H_ */
