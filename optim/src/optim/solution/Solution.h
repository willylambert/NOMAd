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
 
#ifndef Solution_H_
#define Solution_H_

#include "../instance/Instance.h"
#include "../lib/json.hpp"
#include "Route.h"

#include <vector>

using json = nlohmann::json;

/**
 * \class Solution
 * \bref solution of the DARP
 */
class Solution{
public:

	/****************************************************/
	/************ Constructors/Destructors **************/
	/****************************************************/

	/**
	 * load a well formated json
	 * (see "./instance/unitTest/X_sol.json" for the format of the json)
	 *
	 */
	Solution(const Instance * _inst, std::ifstream & strm_json){
		inst=_inst;
		init();
		nlohmann::json jSol=nlohmann::json::parse(strm_json);
		from_json(jSol);
	}
	Solution(const Instance * _inst, std::string & str_json){
		inst=_inst;
		init();
		nlohmann::json jSol=nlohmann::json::parse(str_json);
		from_json(jSol);
	}
	Solution(const Instance * _inst, nlohmann::json & jSol){
		inst=_inst;
		init();
		from_json(jSol);
	}

	/**
	 * init the solution and create all available routes
	 * @param _name
	 * @param _inst
	 */
	Solution(std::string _name, const Instance * _inst){
		name = _name;
		inst = _inst;
		init();
	}

	//! Destructor.
	virtual ~Solution();
	void deleteAllNodes();


	/**
	 * restore initial solution
	 */
	//void clear();

	/****************************************************/
	/*********************** Divers *********************/
	/****************************************************/


	/**
	 * enable the display of the solution with cout<<
	 */
	friend std::ostream& operator<<(std::ostream&, Solution&);

	/**
	 * initialize the values of the object
	 */
	void init();

	/**
	 * reinitialize the solution
	 */
	void reinit(std::vector<size_t> _activeUsers= std::vector<size_t>());

	/**
	 * set the name and the noninserted nodes
	 * called in init() and setCovering object
	 */
	void setNonInserted(std::vector<size_t> cluster);

	/**
	 * set a node as inserted
	 * called in some operators
	 */
	void set_as_inserted(Node * p);

	/**
	 * set active users
	 * remove duplicates and ordered the vector
	 */
	void setActiveUsers(std::vector<size_t> idUsers);
	void addActiveUsers(std::vector<size_t> idUsers);

	/**
	 * Create routes : old method
	 */
	void createRoutesUnlimitedVehicles();

	/**
	 * Create routes considering limited and unlimited quantity of vehicles depending on the type
	 */
	void createRoutes();


	/****************************************************/
	/*********************** Copy ***********************/
	/****************************************************/

	//! This method create a copy of the solution.
	Solution* getCopy() const;

	//Solution* deepcopy();
	//void update(Solution& s);

	/**
	 * fait l'update depuis s vers this*
	 * attention les id des tours sont indépendants !!!
	 * @param s
	 */
	void replicateSolution(const Solution* s);

	/**
	 * Deep Copy nodes
	 * parameters of nodes are copied
	 */
	void deepCopyNodes(Solution& s); //sauve la trace de s vers this

	/**
	 * Copy TimePrev from s into *this : this solves a bug for the MPDARP
	 */
	void copyTimePrev(const Solution* s);

	/****************************************************/
	/*********************** Add ************************/
	/****************************************************/

	/**
	 * Add a route
	 * @param t pointeur vers le tour à ajouter
	 */
	int insertRoute(Route *t);

	/**
	 * Add a set of routes to the solution
	 */
	void addRoutes(std::vector<Route*>& newRoutes);

	/**
	 * Compute the cost/RT/ireg/ without recomputing route performances
	 */
	void recomputePerfs();

	/**
	 * Compute the cost/RT/irreg/ from the scratch (recomputing route performances)
	 */
	void recomputePerfsDeeply();

	/**
	 * recompute IdConfigParameters
	 */
	void computeIdConfigParameters();


	/****************************************************/
	/*********************** Remove *********************/
	/****************************************************/

	/**
	 * Remove a request
	 * The route is optimised after the removal
	 * including scheduling, vehicle selection and cost
	 * @param idpickup id of the pickup node to remove
	 */
	void removeRequestById(size_t idpickup);

	/**
	 * remove a set of request and recompute the solution
	 * at the end of the removal including scheduling,
	 * vehicle selection and cost
	 * @param request the set of request to remove
	 */
	void removeSetOfRequestById(std::vector<size_t>& request);

	/**
	 * Remove a route (based on its id)
	 * usefull in setCovering
	 */
	void erraseRoute(const size_t & id) {
		routes.erase(routes.begin()+id);
	};


	/****************************************************/
	/*********************** Others *********************/
	/****************************************************/

	/**
	 * read a complete feasible solution from a well formulated json string
	 */
	bool from_json(const std::string & jSol){
		nlohmann::json s = nlohmann::json::parse(jSol);
		return from_json(s);
	}

	bool from_json(nlohmann::json& jSol, bool partialSol=false, bool repairSolution=false);

	/**
	 * get node in nodes vector based on json id
	 */
	Node * get_node_from_json(nlohmann::json & jObj,int idJsonRout=-1);

	/**
	 * read entry "nodes" in json object
	 * @param jObj list of "nodes" in routes json
	 */
	std::vector<Node *>get_nodes_from_json(nlohmann::json & jObj, int idJsonRout=-1, bool partialSol=false);

	/**
	 * get the solution in a json format
	 * @return the solution in a json format
	 */
	std::string to_json(bool write_file=false, std::string path_f="") const;


	/**
	 * compute the solution based on json of partial solution (list of routes)
	 * @return the json string of the solution evaluated
	 */
	std::string eval(std::string str_json_route);
	std::string eval(nlohmann::json & json_route);


	/**
	 * @return
	 */
	std::vector<int> getInsertedUsers();

	/**
	 * assign reference times for regularity purposes
	 * @param prevSol reference solutions
	 */
	void setPreviousSolution(Solution * prevSol);


	/**
	 * Create time windows  [t_prevSol - delta, t_prevSol + delta  ] to assure regular solutions
	 * @param prevSol reference solution
	 */
	void createTimeWindodws(Solution* prevSol);

	/**
	 * @return string of a table with service times and reference times for each user
	 */
	std::string getTimesVsPreviousTimeForNodes() const;

	/**
	 * @return string of a table with the consistency value for each user
	 */
	std::string getConsistencyStats() const;


private:
	/**
	 * Find and return an empty route starting from the depot ginven in parameter
	 * useJsonId = true  the idDepot is a json id
	 * If idVehicle<0 or not specified, the algorithm look for one vehicle from the list of vehicles one route
	 * @return nullptr if the route is not feasible
	 */
	Route * getEmptyRouteWithIdenticalDepots(const Node * depotOut, const Node * depotIn, int idVehicle=-1) const ;
	Route * getEmptyRouteWithIdenticalHash(const Route* route_base) const ;
	/****************************************************/
	/*********************** Getters ********************/
	/****************************************************/

public:

	/**
	 * Warmup start solution from a partial solution (sequence of users)
	 */
	bool warmStartRoutes(json& sol);


	const Instance * getInstance() const {
		return inst;
	};

	const Route* getRoute_const(const size_t & id) const {
		PPK_ASSERT(id<routes.size());
		return routes[id];
	};

	Route* getRoute(const size_t & id) const{
		PPK_ASSERT(id<routes.size());
		return routes[id];
	};

	const std::vector<Route*>& getRoutes() const {
		return routes;
	}

	const std::vector<Route*> getRoutesUsed() const {
		std::vector<Route*> routesUsed;
		for(auto route: routes)
			if(route->nodes.size()>2)
				routesUsed.push_back(route);
		return routesUsed;
	}

	std::vector<Route*>& getRoutes() {
		return routes;
	}

	std::vector<size_t>& getNonInserted(){
		return pickupNonInserted;
	};

	Node* getNode(const size_t & pos){
		PPK_ASSERT(pos<nodes.size());
		return nodes[pos];
	};

	const std::vector<Node*>& getNodes() const{
		return nodes;
	};

	size_t getNodesSizes(){return nodes.size();}

	/**
	 * Compute and return the number of used Routes
	 * routes with only depots node are not taken into account
	 */
	int getNbRoutesUsed();

	/**
	 * Return the number of Routes including
	 * routes with only depots nodes
	 */
	size_t getNbRoutes() const{
		return routes.size();
	};

	/**
	 * compute and return the total number of reconfiguration in the solution
	 * this is only usefull for statistics
	 */
	int computeNbReconfigurations(size_t* routeRec) const;

	//! A getter for the feasibility of the current solution.
	//! \return true if the solution is feasible, false otherwise.
	bool isFeasible() const{
		return pickupNonInserted.empty();
	}

	//! A comparator.
	//! \return true if this solution is "better" than the solution it is compared to.
	bool operator<(Solution&);

	//! Compute a hash key of the solution.
	long long getHash();

	//! returns true if a given node id is active and not inserted in the solution
	bool isNotInserted(size_t id);

	//! returns true if a given node id is active and inserted in the solution
	bool isInserted(size_t id);

	//! get the size of the request bank (nb request non inserted in the solution)
	size_t getSizeRequestBank(){
		return pickupNonInserted.size();;
	}

	/*
	 * returns cumulated ride time
	 */
	long getRT(){
		return RT;
	}

	/**
	 * It return the objective cost even if the solution is infeasible.
	 * \return the value of the objective function of this solution.
	 */
	double getObjectiveValue() const{
		return totalObjVal;
	}

	/**
	 * It returns the objective value penalized if a request is not in the solution
	 * it is not the real value of the solution. for that use getObjectiveValue()
	 */
	double getPenalizedObjectiveValue() {
		return (totalObjVal + (penaltyCost*(double)pickupNonInserted.size()));
	}

	const std::vector<size_t>& getActiveUsers() const {
		return activeUsers;
	}

	const std::string getName() const {
		return name;
	}

	void setPickNonInserted(const std::vector<size_t>& pickNonInserted) {
		this->pickupNonInserted = pickNonInserted;
	}

	int getNbDepots() const {
		return (int)depotsOut.size();
	}

	const std::vector<Node*>& getDepotArrive() const {
		return depotsIn;
	}

	const std::vector<Node*>& getDepotDepart() const {
		return depotsOut;
	}

	void setName(const std::string& name) {
		this->name = name;
	}

	bool isActive(const Node * node) const{
		return find(activeUsers.begin(), activeUsers.end(), node->getIdUser()) !=activeUsers.end();
	}

	void setCoefObj(double _coefCost,double _coefIreg){
		for(auto * route : routes) {
			route->setCoefObj(_coefCost, _coefIreg);
			route->setObjVal(route->computeObjVal());
		}
		coefCost=_coefCost;
		coefIrreg=_coefIreg;
	}



	/****************************************************/
	/*********************** Checker ********************/
	/****************************************************/

	/**
	 * Checker of the solution
	 * execute a list of necessary condition
	 * @param verifCompleteness: whether of not the completeness is verified
	 * @param checkIdConfigParameters: check the IdConfig parameters in nodes
	 */
	void check(bool verifCompleteness=true, bool checkIdConfigParameters=false) const;

	void setExecNbIteration(int execNbIteration = 0) {
		this->execNbIteration = execNbIteration;
	}

	void setExecTime(double execTime = 0) {
		this->execTime = execTime;
	}

	int getExecTime() const {
		return (int)execTime;
	}

	double getTotalCost() const {
		return totalCost;
	}

	double getTotalIrreg() const {
		return totalIrreg;
	}

	double computeTotalWait() const;

	double getCoefCost() const {
		return coefCost;
	}

	double getCoefIrreg() const {
		return coefIrreg;
	}

	std::string toString(bool write_file=false, std::string path_f="") const;

private:

	/**
	 * check if all users are inserted one and only one times
	 */
	void solutionCompletnessTest() const;


	/**
	 * returns true if user with id idUser is active, false otherwise
	 */
	bool isActiveUser(size_t idUser) const;

	/**
	 * Verifies if an inserted user is active or not
	 */
	void checkActiveUsers()  const ;

	/**
	 * check the cost/ irregularity/ obj value of the solution based on cost of the routes
	 */
	void checkSolutionPerformance() const;


	/**
	 * check if 2 routes have the same id
	 */
	void route_id_duplicateTest() const;

	/**
	 * test the capacity on points
	 */
	void capaPointsTest() const;

	/**
	 * check the position of the node in nodes with respect to the id
	 */
	void nodeIdTest() const;

	/**
	 * Format error messages into json strings
	 */
	const char * formatJson(std::string type, std::string message, Route* route=nullptr,
			const std::vector<const User*>& users=std::vector<const User*>(), int positionInRoute=-1,
			const std::vector< std::pair<int, const VehicleType*> >& vehicles=std::vector< std::pair<int, const VehicleType*> >()) const;
	/**
	 * Check that the quantity of vehicles in each category is not surpassed.
	 */
	void checkVehiculeFleet() const;

	/****************************************************/
	/*********************** Errors *********************/
	/****************************************************/


	void setEvalMode(bool evalMode = false) {
		this->evalMode = evalMode;
		for(Route *rout : routes) rout->setEvalMode(evalMode);}

	/**
	 * reinit errors
	 */
	void reinitErrors(){
		capacityDepotError.clear();
		userNotFoundError.clear();
		positionNodeError.clear();
		vehicleTypeError.clear();
		for(auto r : routes) r->reinitErrors();}


	void setCapacityDepotError(int id){ capacityDepotError.push_back(id); }
	void setUserNotFoundError(int idRout, int posNode){ userNotFoundError.push_back(std::make_pair(idRout,posNode)); }
	void setPositionNodeError(int idRout, int posNode)  { positionNodeError.push_back(std::make_pair(idRout,posNode)); }
	void setVehicleTypeError(int id)  { vehicleTypeError.push_back(id);   }

	bool isNoStructureError() const{
		return userNotFoundError.empty() && positionNodeError.empty() && vehicleTypeError.empty();}

	bool isNoFeasibilityError() const{
		bool feasible=capacityDepotError.empty();
		for(Route * route: routes) feasible=feasible && route->isFeasible();
		return feasible;}

	bool noError() const {
		return isNoStructureError() && isNoFeasibilityError(); }

	std::string errors_to_json() const;

	/**
	 * parameters
	 */
	bool evalMode=false;
	std::vector<int> capacityDepotError;
	std::vector<int> vehicleTypeError;
	std::vector<std::pair<int,int>> userNotFoundError;
	std::vector<std::pair<int,int>> positionNodeError;


	/****************************************************/
	/*********************** Attributes *****************/
	/****************************************************/

	/**
	 * name of the solution
	 */
	std::string name;

	/**
	 * instance related to the solution
	 */
	const Instance *inst=nullptr;

	/**
	 * list of routes describing the solution
	 */
	std::vector<Route*> routes;

	/**
	 * list of pickup non inserted in the solution
	 * if the list is empty the solution is feasible
	 */
	std::vector<size_t> pickupNonInserted;

	/**
	 * cost of the solution
	 */
	double totalCost;
	double totalIrreg;
	double totalObjVal;

	/*
	 * cumulated ride time of silution
	 */
	long RT;

	/**
	 * penalty cost
	 * usefull in getPenalizedObjectiveValue when the
	 * solution is not feasible
	 */
	double penaltyCost;

	/**
	 * vector with all pickup and delivery nodeSol
	 * the depots are in the list
	 * this data structure enable to fin the route of a given node
	 * in constant time
	 */
	std::vector<Node *> nodes;

	/**
	 *  vectors with departure depots (Node)
	 */
	std::vector<Node* > depotsOut;
	/**
	 *  vectors with arrival depots (Node)
	 */
	std::vector<Node* > depotsIn;

	/**
	 * Set of active users, only this set of users will be insert in the solution thus considered in method 'solve'
	 */
	std::vector<size_t> activeUsers;

	/**
	 * number of iteration after the execution
	 */
	int execNbIteration=0;

	/**
	 * duration for the execution in seconds
	 */
	double execTime=0;

	/**
	 * MPDARP
	 * Weighted coeficient  of cost objectve
	 */
	double coefCost=1;
	/**
	 * MPDARP
	 * Weighted coeficient  of consistency objectve
	 */
	double coefIrreg=0;
};





#endif /* Solution_H_ */

