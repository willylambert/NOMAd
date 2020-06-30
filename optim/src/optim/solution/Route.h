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
 
#ifndef TOUR_H_
#define TOUR_H_

#include "../instance/Instance.h"
#include "../solve/RequestInfo.h"
#include <sstream>

typedef std::pair<std::vector<size_t>,std::vector<size_t>> ordHash;


/**
 * \class Route
 * \brief This class models a sequence of visited nodes.
 */
class Route {

public:

	/**
	 * empty constructor for duplications
	 */
	Route(){}

	/**
	 * @param ins : instance
	 * @param depart : repository
	 * @param arrive : repository
	 * @param vehicle
	 * @param Te : method for the scheduling
	 * @param Ce : method for the capacity test
	 */
	Route(const Instance* ins, Node* depart ,Node* arrive, const VehicleType* vehicle,
			 std::vector<const VehicleType * >& vehicleList); //= std::vector<const VehicleType *>()

	void reinit();

private :
	/**
	 * initialize parapeters of an empty route with only begin and end depots
	 */
	void initRoute();

	/**
	 * set posSym pointers
	 * O(n^2)...
	 */
	void setPosSym();

public:
	/**
	 * destructor
	 */
	virtual ~Route(){}

	/**********************************************************************************/
	/******************************** Core Methods ************************************/
	/**********************************************************************************/

	/**
	 * The request is removed from the route
	 * the schedule is perform
	 * the cheapest vehicle is found and
	 * the route cost is evaluated
	 */
	bool evalRemoval(RequestInfo& req);

	/**
	 * Performs a feasible insertion based on informations in req
	 * addrequest(req) then call updateFeasibleTourParameters(req.vehicle)
	 * @param req the insertion to do
	 */
	void insertFeasibleRequest(RequestInfo& req);  // converted into boolean to catch the bug

	/**
	 * find the best position req.i and req.j in a route to insert req.p and req.d respectively
	 * call evalInsertion(reqTemp) for all possible positions
	 * @param req the insertion to evaluate, this parameter is modified by the method
	 * @return true if the insertion is feasible
	 */
	bool evalBestInsertion(RequestInfo& req);
	//void reinitTour();
	//void removeSetOfRequestById(std::vector<int>& request);

	/**
	 * update all parameters of the route based on the nodes vector
	 * scheduling feasibility and evaluation
	 * capacity feasibility and evaluation
	 * evaluate the cost of the route
	 * @param vehicle : the vehicle to test, if vehicle = nullptr then the cheapest vehicle is selected (with estimateVehiclesCost procedure)
	 * @return true iff the insertion is feasible, if not its a bug and the solution is not consistent anymore
	 */
	bool updateFeasibleTourParameters(const VehicleType* vehicle=nullptr);

	/**
	 * update position in nodes starting in node i. by default from the beginning till the end
	 */
	void recomputePositions(int i=0);

	/**
	 * Remove request and optimize times and vehicle type
	 * eraseRequest(req) then call updateFeasibleTourParameters(nullptr)
	 * @param req the removal to do
	 * @return true iff the removal is feasible, if not its a bug and the solution is not consistent anymore
	 */
	bool removeRequest(RequestInfo& req);

	/**
	 * find and remove user from route
	 * eraseRequest(req) then call updateFeasibleTourParameters(nullptr)
	 * @param user the user to remove
	 * @return true iff the removal is feasible, if not its a bug and the solution is not consistent anymore
	 */
	bool removeUser(const User * user, bool deleteNode=false);


	/**
	 * recompute all the route based on the vector nodes
	 * times, capacity, vehiclelist and vehicle are also recomputed
	 * @param vehicle : the vehicle to test, if vehicle = nullptr then the cheapest vehicle is selected (with estimateVehiclesCost procedure)
	 * @return true if the route is Feasible else otherwise
	 *
	 */
	bool setAllParametersFromVnodeOrder(const VehicleType* vehicle=nullptr);

	/**
	 * This function returns a unique value to differentiate route
	 * when the order of the nodes and the itineraries are important.
	 * This method is usefull in k-regret
	 */
	ordHash getHashkeyOrdered() const;

	/**
	 * This function returns a unique value to differentiate route.
	 * when the order of the nodes should not be taken into account.
	 * This method is usefull Pool objects
	 */
	std::vector<size_t> getHashUnordered() const;
	/**
	 * Find the position for a user in the route
	 * Complexity : O(n)
	 */
	std::pair<size_t,size_t> findPosition(const User * user);

private :
	/**
	 * Compute and sort the cost for all vehicles in vehicles
	 * @param dist the distance of the route
	 */
	void estimateVehiclesCost(const long & dist); 

	/**
	 * evaluate the feasibility and teh cost of an insertion
	 * the insertion is first done and the scheduling is tested
	 * the duration is evaluation in same time
	 * the capacity is also tested
	 * for each feasible vehicle the cost is evaluated
	 */
	bool evalInsertion(RequestInfo& req);

	/**
	 * reinit the vehicle list with all the vehicles for the route
	 * the list is not filtred by feasibility (all vehicles are in this list) !
	 */
	void reinitVehicleList();

	/**
	 * the distance is recomputed and returned
	 * distance parameter is not updated
	 * @return computed distance of the route
	 */
	long getComputedDistance() const;

	//void computeNbReconfigurations();

	/**
	 * test necessary condition for an insertion without midifing the route
	 * @param req request to be inserted
	 * @return false if not possible (necessary condition only !)
	 */
	bool testNecessaryConditions(const RequestInfo& req) const;

	/**
	 * add the request in nodes and update positions parameters
	 * other parameters are not changed
	 */
	void addRequest(RequestInfo& req);

	/**
	 * remove nodes in positions i and j in nodes and update positions parameters
	 * with i<j
	 * other parameters are not changed
	 * @param i first position to remove
	 * @param j second position to remove (i<j)
	 */
	void eraseRequest(size_t i, size_t j, bool deleteNode=false);

	/**
	 * compute and set the parameter cost based on parameters distance and duration
	 * distance and duration are not recomputed
	 */
	double computeCost();

	/**
	 * compute distance given an insertion in O(1) without changing the route
	 * computation is based on parameter distance
	 * @param req insertion request
	 * @return distance given insertion req
	 */
	//long getDistanceIncremental(RequestInfo& req) const;

	/**
	 * compute the irregularity besed on getComputedIrregularity in Node
	 */
	double computeIrregularity() const;
	double computeIrregularity_T(long delta=0);


public:
	/**
	 * compute the objective value
	 */
	double computeObjVal() const;

	/**********************************************************************************/
	/*************************** print/import/export Methods **************************/
	/**********************************************************************************/

public:
	/**
	 * convert the route to a string with many informations (ids, times, loads, etc.)
	 * usefull to display the Route
	 */
	std::string str_tour() const;

	/**
	 * operator <<
	 */
	friend std::ostream& operator<<(std::ostream&, const Route&); //permet d'utiliser cout

	/**
	 * get the route in a json format
	 * @return a string representing the route in a json format
	 */
	std::string to_json() const;

	/**
	 * returns string with the consistency statistics of the route
	 */
	std::string getConsistencyStats() const;



	/**********************************************************************************/
	/************************************ copy ****************************************/
	/**********************************************************************************/

	/**
	 * copy Route t (param) in this object
	 * update nodes based on the route t (param)
	 * other parameters than nodes are not updated
	 * nodes is not filed with object from Route t (param) but with object (NodeSol) from all_nodes (param)
	 * @param t route to copy in this object
	 * @param all_nodes list of NodeSol the will be used to fill this->nodes
	 */
	void copyNodes(const Route * t, const std::vector<Node*> &all_nodes);

	/**
	 * get a copy of the current object
	 * include the copy of the Nodes
	 * id_round can not be used with this copy
	 */
	Route * getCopy();


	/**********************************************************************************/
	/************************************ scheduling **********************************/
	/**********************************************************************************/

	/**
	 * Schedule a route with the earliest possible start knowing minimal duration
	 * @ true if feasible
	 */
	bool schedule() ;
	void scheduleMinIrregularity() ;

	/**
	 * This method computes the minimum route duration from the scratch.
	 * It was developed for evaluation purposes
	 */
	long computeMinRouteDuration() const ;

	/**
	 * Set the service times in each node according to a vector precomputed T
	 */
	void updateParameters();

	const std::vector<long>& getT() const {
		return T;
	}

	long getDurationT() const{
		PPK_ASSERT(T.size()==nodes.size());
		return T.back() - T.front();
	}

	/*
	 * Computes an estimation of the route variable cost.
	 * This method is useful to calculate the cost of miniroutes in neightbourhood class
	 */
	double computeCostEstimation(double timeUnitCost=3, double distanceUnitCost=1);


	void printT();

	size_t getShiftMax() const {
		return shiftMax;
	}

	/**
	 * Computes the sum of wait times of the current route
	 * @return sum of wait times = \f$\sum_{i \in N} T_{i+1}-(T_{i}+t_{i,i+1}+s_{i})\f$
	 */
	long computeSumWaitingTimes_T() const;
	long computeSumWaitingTimes() const;

	/**
	 * compute and return the sum of ride times based on vector T
	 * This result is correct if T was compute beforehand
	 */
	long getSumRT_T() const;

	/**
	 * Evaluation mode for evaluating routes independently
	 */
	void setEvalMode(bool evalMode = false) {
		this->evalMode = evalMode;
	}

	/**
	 * tells if this route dispose of unlimited vehicles or not
	 */
	bool isLimitedFleet() const {
		if (vehicleList[0]->getNbVehicles()!="unlimited")
			return true;
		else
			return false;
	}

	/**
	 * tells if the given vehicle id is part of the vehicle list of this route
	 */
	bool isInTheVehicleList(int vehicleId) const {
		PPK_ASSERT(vehicleId>=0);
		for(auto vehicle : vehicleList){
			if ((int)vehicle->getIdJson()==vehicleId)
				return true;
		}
		return false;
	}


private:
	/**
	 * set the begining of service at the earliest start in the vector of time T (not in the nodes)
	 * only time window constraints are considered
	 * @pos
	 */
	void setBeginningOfService(int pos=1);

	/**
	 * true if pickup of depot out
	 */
	bool isOutType(const size_t pos) const{
		return nodes[pos]->isOutType();
	}

	bool isInType(const size_t pos) const{
		return ! isOutType(pos);
	}

	int idN(const size_t & i) const{
		return (int) nodes[i]->getId();
	}

	long s(const size_t & i) const{
		return nodes[i]->getStime();
	}

	int l(const int & i,const int & u) const{
		return nodes[i]->getUser()->l(u);
	}

	long a(const size_t & i) const{
		return nodes[i]->a();
	}

	long b(const size_t & i) const{
		return nodes[i]->b();
	}

	long maxRT(const size_t & i) const{
		return nodes[i]->getMaxRT();
	}

	size_t posSym(const size_t & i) const{
		return  *nodes[i]->posSymInRou;
	}

	void setPos(size_t i) const{
		nodes[i]->posInRou=i;
	}

	const long & Tnext(const size_t & i) const{
		return inst->getTime(nodes[i]->point->getId(),nodes[i+1]->point->getId());
	}

	const long & Dnext(const size_t & i) const{
		return inst->getDist(nodes[i]->point->getId(),nodes[i+1]->point->getId());
	}

	long & ti(const size_t & i) const{
		return nodes[i]->time;
	}


	//**********************Parameters
	std::vector< long > T;  // Passing time
	std::vector< long > FTS;  // Forward time Slack

	int dim=0;
	long shiftMax=0;
	//int cont=0;
	int verbosite=1;


	/**********************************************************************************/
	/************************************ capacity eval *******************************/
	/**********************************************************************************/

public:
	/**
	 *
	 * @param vnode the list of visited nodes in the route
	 * @param lvehicles the list of vehicle candidate
	 * @param dist the total distance of the route (to compute the total cost of the route)
	 * @return the cheapest feasible vehicle or NULL
	 */
	const VehicleType* performCapacityTest(const std::vector<Node*> & vnode,
			std::vector<std::pair<double ,const VehicleType*> > lvehicles,
			long dist) ;

	/**
	 * update the load in loadInSol of the route
	 */
	void updateLoadParameters();

	/**
	 * set the id of a feasible configuration (minimizing changes) for all Nodes of the route
	 * @param r	route to process
	 */
	void setIdConfigParameters(Route* r);

	/**
	 * constitute the list of fesible vehicle
	 * @param vnode list of visited nodes
	 * @param vehicles list of vehicle to test and filter
	 */
	void updateVehicleListWithFeasibleVehicles(std::vector<Node*> & vnode, std::vector<std::pair<double ,const VehicleType*> >& vehicles) ;

	/**
	 * test the feasibility of a vehicle on the route
	 * @param vt the vehicle type to test
	 * @param dominantNodes the set of dominant nodes (usefull only in bitSet mode)
	 * @param write evalMode
	 * @return true if the vehicle is feasible
	 */
	bool isFesibleVehicle(const VehicleType * vt, const std::vector<int>& dominantNodes);
	bool isFesibleVehicleEvalMode(const VehicleType * vt) ;
	/**
	 * Constant method for the checker
	 */
	bool isFesibleVehicleChecker(const VehicleType * vt) const ;

	/**
	 * get the list of dominant nodes
	 * @return the list of dominant nodes
	 */
	const std::vector<int> getDominantNodes();

	/**
	 * Prints in console the current load profile L
	 */
	void printLoadProfile();

	const std::vector<std::pair<double ,const VehicleType*> >& getVehiclesCap() const { return vehiclesCap;}


	Node * niSol(size_t i) const{
		return (* nodesCap)[i];
	}

	size_t sizeCap() const {
		return (* nodesCap).size();
	}

	void setNodesCap(std::vector<Node*>& nodesCap) {
		this->nodesCap = &nodesCap;
	}

	int getNbReconfigurationsCap() const {
		return nbReconfigurationsCap;
	}

private:
	bool singleVehicleCapacityTest(const VehicleType* vehicle);

	/**
	 * test the fesibility of a given vehicle
	 * @param vehicle
	 * @param dominantNodes
	 * @return true if vehicle is feasible
	 */
	bool singleVehicleCapacityBitSet(const VehicleType* vehicle, std::vector<int>& dominantNodes);

	//void computeDistance();
	int computeNbReconfigurations(std::vector<std::bitset<64> >& cload);

	int getConfigurationId(std::bitset<64> b);

	//Parameters
	long distanceCap=0;
	int nbReconfigurationsCap=0;

	//auto nbUserType=0;
	const std::vector<Node*> * nodesCap=nullptr;
	std::vector<std::pair<double ,const VehicleType*> > vehiclesCap;

	//route profile using ints
	std::vector< std::vector<int> > L;  // Load
	std::vector<int> lCap;  // vector needed to initialize L each iteration.
	std::vector<int> idconfigurationCap;
	std::vector<std::bitset<64> > setConfigurationsCap; //idconfigurations


	/**********************************************************************************/
	/************************************ checker *************************************/
	/**********************************************************************************/

public:

	/**
	 * check all
	 */
	void check(bool checkIdConfigParameters=false){
		nodesTest();
		data_pos_id_test();
		checkItineraries();
		timeTest();
		loadTest();
		vehicleTest(checkIdConfigParameters);
		vehiclesLoadTest();
		distanceTest();
		performanceTest();
	}

private:

	void data_pos_id_test() const;

	/**
	 * check time constraint and calculation besed on nodes order
	 */
	void timeTest() const;
	void timeTest_T() const;

	/**
	 * This method test vehicle capacity as well as max number of reconfiguraions constraints
	 * this test is importat as it's independent to de CapacityEvaluation class
	 */
	void vehicleTest(bool checkIdConfigParameters=false) const;

	void vehiclesLoadTest() const;

	void loadTest() const;

	/**
	 * check the distance calculation based on nodes order
	 */
	void distanceTest() const;

	/**
	 * check the cost calculation based on other datas (distance, vt and time)
	 */
	void performanceTest() const;

	/**
	 * call check for all nodes in nodess
	 */
	void nodesTest() const{for (auto req:nodes) req->check();}

	/**
	 * check that the same itinerary is affected to pickup and delivery
	 */
	void checkItineraries();


	/**********************************************************************************/
	/***********************  simple getters and setters  *****************************/
	/**********************************************************************************/

public:

	double getCost() const {
		PPK_ASSERT(cost>=0);
		return cost;
	}

	long getSumRT() const;
	long getNodeRT(Node* n) const;

	long getDistance() const {
		return distance;}

	long getDuration() const {
		return duration;}

	const VehicleType* getVehicle() const{
		return vt;}

	bool isInFeasibleVehiclesList(const VehicleType* vehicle) const{
		for(auto fvehicle : feasibleVehicles)
			if(fvehicle.second->getId()==vehicle->getId())
				return true;
		return false;
	}

	size_t size()const {
		return nodes.size();}

	const std::vector<std::pair<double, const VehicleType*> >& getVehicles() const {
		return feasibleVehicles;}

	int getNbReconfigurations() const {
		return nbReconfigurations;}

	void setNbreconfigurations(int k) {
		nbReconfigurations=k;
	}

	size_t getUserId(const size_t & pos) const {
		return nodes[pos]->getUser()->getId();
	}

	void setCoefObj(double _coefCost,double _coefIreg){
		coefCost=_coefCost;
		coefIrreg=_coefIreg;
	}

	double getIrregularity() const {
		PPK_ASSERT(irregularity>=0);
		return irregularity;
	}

	double getObjVal() const {
		PPK_ASSERT(objVal>=0);
		return objVal;
	}

	void setCost(double cost = 0) {
		PPK_ASSERT(cost>=0);
		this->cost = cost;
	}


/*************************************
 ************* ERRORS ****************
 *************************************/

	/**
	 * reinit errors
	 */
	void reinitErrors();
	void reinitTimeErrors();



	/**
	 * set errors
	 */
	void addTimeWindowsError(const int & i);
	void addRideTimeError(const int & i);
	void setNoVehicleCapable();
	void setReconfigurationErrors(const int & i);
	void setVehicleCapacityErrors(const int & i);

	/**
	 * test if there are errors
	 */
	bool isTimeFeasible() const;
	bool isCapacityFeasible() const;
	bool isFeasible() const;

	/**
	 * get json errors
	 */
	std::string errors_to_json() const;


	/**
	 * This method formats the @message into Json valid string with aditionnal information about location and type of problem
	 */
	const char * formatJson(std::string type, std::string message, bool infoRoute=false, Node* _node=nullptr, size_t position=-1, bool infoVehicle=false) const;
	const char * formatJsonU(std::string type, std::string message, bool infoRoute=false,const User* _user=nullptr, int idItinerary=-1) const;


	double getCoefCost() const {
		return coefCost;
	}

	double getCoefIrreg() const {
		return coefIrreg;
	}

	void setObjVal(double objVal = 0) {
		PPK_ASSERT(objVal>=0);
		this->objVal = objVal;
	}

	const std::vector<int>& getNbReconfigurationErrors() const {
		return nbReconfigurationErrors;
	}

	const std::vector<int>& getRideTimeErrors() const {
		return rideTimeErrors;
	}

	const std::vector<int>& getTimeWindowErrors() const {
		return timeWindowErrors;
	}

	const std::vector<int>& getVehicleCapacityErrors() const {
		return vehicleCapacityErrors;
	}

	/**
	 * parameters
	 */
	bool evalMode=false;
	std::vector<int> timeWindowErrors; /**<error with time windows*/
	std::vector<int> rideTimeErrors; /**<error with ride times*/
	std::vector<int> nbReconfigurationErrors; /**<error with the maximal number of reconfiguration*/
	std::vector<int> vehicleCapacityErrors; /**<error with the capacity of the vehicle*/
	bool noVehicleCapable=false;


/*************************************
 ************* ATTRIBUTES ************
 *************************************/

public :

	/**
	 *  the list of visited Node v_node
	 */
	std::vector<Node*> nodes;

	/**
	 * id the route
	 */
	size_t id=-1;
	int idJson=-1;

private:

	/**
	 * Number of reconfigurations performed during the route
	 */
	int nbReconfigurations=0;

	/**
	 * Cost (performance) of the route
	 */
	double objVal=0;
	double cost=0;
	double coefCost=1;
	double coefIrreg=0;
	double irregularity=0;

	/**
	 * cost of the solution where this route exists
	 */
	//double solutionCost=-1;

	/*
	 * Cumulated ride time
	 */
	long cumRT=0;

	/**
	 * Distance of the route
	 */
	long distance=0;

	/**
	 * Duration of the route
	 */
	long duration=0;

	/**
	 * The vehicle used to perform the route
	 */
	const VehicleType* vt=nullptr;

	/**
	 * List of all vehicleType able (capacity considerations) to perform the route
	 * in the Pair, the first element is the cost associated to the second element which is the vehicleType
	 */
	std::vector<std::pair<double ,const VehicleType * > > feasibleVehicles; // List of feasible vehicles

	/**
	 * List of all posible vehicles for this routes
	 */
	std::vector<const  VehicleType * > vehicleList; //= std::vector<VehicleType *>();

	/**
	 * The instance related to the route
	 */
	const Instance * inst=nullptr;

};

#endif /* TOUR_H_ */
