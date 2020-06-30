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

#ifndef SRC_DARP_DARP_H_
#define SRC_DARP_DARP_H_


#include <vector>
#include <string>

class Solution;
class LNS_SCP;
class LNS_SCP_Parameters;
class Instance;
class Route;
class Node;
class Statistics;

namespace darp {


/**
 * \class Dial a Ride Problem DARP
 * \brief class to manage and solve the
 */
class Darp {
public:

	/**
	 * constructor
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * @param instJson Instance
	 * @param paramJson Parameters
	 */
	Darp(const std::string & instJson, const std::string & paramJson);

	/**
	 * constructor
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * @param instJson Instance
	 * @param LNS_SCP_Parameters object with matheuristic parameters
	 * @param paramJson string with parameters in json format (this is needed to update global parameters)
	 */
	Darp(const Instance * inst, LNS_SCP_Parameters * param, const std::string& paramJson);

	/**
	 * destructor
	 */
	virtual ~Darp();

	/**
	 * load an initial solution
	 * useful for warm start
	 * @param solJson well formated json solution
	 */
	void loadSolutionJson(const std::string & solJson);

	/**
	 * Solve a well formulated Dial a ride problem and return the solution formated as a json string
	 * (see "./instance/unitTest/X_sol.json" for the output format)
	 * @return string json of the solution
	 */
	std::string solve();
	Solution * solveSol();

	/**
	 * set the coeficient for the multi objective evaluation
	 */
	void setCoefObj(double coefCost,double coefIreg);

	/**
	 * set coef, solve and return solution
	 */
	Solution * solveWeigthedDARP(double coefCost,double coefIreg);

	/**
	 * display the problem
	 * @param out if false the string is not printed in console
	 * @return string serializing the problem
	 */
	std::string displayProblem(bool out=true) const;

	/**
	 * display the solution
	 * @param out if false the string is not printed in console
	 * @return string serializing the problem
	 */
	std::string displaySolution(bool out=true) const;

	/**
	 * to_string()
	 */
	std::string to_string() const;

	/**
	 * compute_route
	 * the route is given as a json (see to_json in Route)
	 */
	std::string eval(std::string str_json_route);

	/**
	 * operator <<
	 */
	friend std::ostream& operator<<(std::ostream&, const Darp&); //permet d'utiliser cout

	Solution*& getSol() {
		return sol;
	}

//	Pareto* getPareto() const {
//		return pareto;
//	}

	const std::string& getName() const {
		return name;
	}

	LNS_SCP_Parameters* getAlnsParam() const {
		return alnsParam;
	}


private:

	/**
	 * This method load a problem in JSON format.
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * initialize an empty solution
	 * @param instJson Instance
	 * @param paramJson Parameters
	 */
	void loadProblemJson(const Instance * _instance, LNS_SCP_Parameters * _alnsParam);

	/**
	 * return the position of the node with id=idn.
	 * This method is called by computeScheduling(...)
	 * @param nodes sequence of route with the nodes of a route.
	 * @param idn the id the the method will looked for in the sequence nodes
	 * @return the position of the node with id=idn
	 */
	int getNodePosition(std::vector<Node*>& nodes, size_t idn);


private:
	const Instance* instance=nullptr;         /**< instance of the DARP */
	LNS_SCP_Parameters* alnsParam=nullptr; /**< parameters for the resolution */
	Solution* sol=nullptr;          /**< solution of the DARP */
	std::string name;					/**< name of the DARP */
	LNS_SCP * lnsscp=nullptr;
	Statistics * stats=nullptr;

	/**
	 * delete instance and alnsPAram at the end
	 */
	bool deleteAll=false;
};

}  // namespace darp

#endif /* SRC_DARP_DARP_H_ */
