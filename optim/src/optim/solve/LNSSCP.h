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



#ifndef LNS_SCP_H_
#define LNS_SCP_H_

/*!
 * \class LNS_SCP.
 * \brief This class contains the LNS and the SCP logics.
 *
 * This class contains the logic of the ALNS (Adaptive Large Neighborhood Search).
 * The general idea of the ALNS is to iteratively destroy then repair a solution
 * to improve its quality. Non improving solution may be accepted as the new current
 * solution according to some acceptance criteria.
 * If you are interested about the general functioning of this method please refer to:
 * S. Ropke & D. Pisinger. An Adaptive Large Neighborhood Search Heuristic for Pickup
 * and Delivery Problem with Time Windows. Transportation Science, 40 (2006) 455-472.
 */

#include <cstring>
#include <math.h>
#include <time.h>
#include <set>
#include <vector>
#include <string>

#include "SCP/SetCovering.h"
#include "LNS_Iteration_Status.h"

class Solution;
class LNS_SCP_Parameters;
class OperatorManager;
class ARepairOperator;
class APreRepairOperator;
class ADestroyOperator;
class Statistics;




class LNS_SCP {

private:

	//! The max number of reconfiguraions performed among all routes.
	size_t nbReconfigurations;

	//! Number of routes using reconfigurations.
	size_t nbRoutesRec;

	//! The current number of iterations.
	size_t nbIterations;

	//! Keeps the time when the best solution is found
	double TimeToReachBestSol;

	//! counters sa
//	int count_iter=0;
//	int count_succes=1; // start in 1 to avoid a temperature decrease in 1st iteration

	//! The parameters to be used.
	LNS_SCP_Parameters* param;

	//! Current time
	double time=0.0;

	//! varible for limiting the solving time for the RSCP
	double timeLimitScp=0.0;

	//! initial the number of iterations for executing the RSCP
	size_t baseNbIterScp=0.0;

	//! boolean to verify if the previous resolution of the SCP was solved optimally
	bool prevSolOptimal=0;

	//! solving time limit of the LNSSCP
	double timeLimit=0.0;

	//! difference between newsolution and currentsolution
	double sumDeltaCost=0;

	//! Solution objects.
	Solution* currentSolution;
	Solution* bestsolution;
	Solution* newSolution;

	//PreRepairOperator
	APreRepairOperator* prerepair;

	// Repair operator
	ARepairOperator* repair;

	// Destroy Operator
	ADestroyOperator* destroy;

	// Manager of the set covering problem
	SetCovering* SCP;

	//! Manager of the operators.
	OperatorManager* opManager;

	//! The current number of iterations without improvement.
	size_t nbIterWithoutImprove;

	//! The number of iterations without improvement of the current solution.
	size_t nbIterWithoutImproveCurrent;

	//! The number of times SCP finds new best solutions
	size_t nbNewBestSolSCP;

	//! The number of times SCP finds new current solutions (when its better than the previous one)
	size_t nbNewCurrSolSCP;

	//! The number of times SCP reaches optimality within the time limit
	size_t nbOptSolSCP;

	//! The time the optimization process started.
	clock_t startingTime;

	/**
	 * Acceptance probability in record to recod
	 */
	double acceptanceRecorToRecord;

	//! A set containing the hash keys of the encountred solutions.
	std::set<long long> knownKeys;

	//! An object to compute some statistics about the solving process.
	Statistics* stats;

	//! Name of output file
	std::string name;

	//! instance
	const Instance* instance;

	//! An object representing the status of the last iteration.
	LNS_Iteration_Status status;


public:
	//! Constructor.
	//! @param initialSolution the starting solution that is going to be optimized.
	//! is accepted as the current solution.
	//! @param parameters the set of parameters to be use by the ALNS.
	//! @param opMan an operator manager.
	//! @param statistics object to record statistics.
	//! @param inst instance of the problem
	//! @param SC set covering used during the resolution
	LNS_SCP(Solution* initialSolution,
		 LNS_SCP_Parameters * parameters,
		 OperatorManager * opMan,
		 Statistics * statistics,
		 const Instance* inst,
		 SetCovering* SC);

	//! Destructor.
	virtual ~LNS_SCP();

	//! This method launch the solving process.
	//! @return true if a feasible solution is found,
	//! false otherwise.
	bool solve();

private:
	//! This method seeks if a solution is already known,
	//! if not it is added to the set of known solutions.
	//! @param sol the solution to be checked.
	//! @return true if the solution was unknown, false otherwise.
	bool checkAgainstKnownSolution(Solution& sol);

	//! This method perform one iteration of the ALNS solving
	//! process.
	void performOneIteration();

	//! This method check whether or not the stopping criteria is met.
	bool isStoppingCriterionMet();

	//! Determine whether or not the new solution is better than the
	//! best known solution.
	bool isNewBest(Solution* newSol);

	//! Solve set covering problem
	//void adaptiveLNS();
	void solveSetCoveringProblem();

	//! Determine whether we should update or current known solution.
	//! return true if the criteria is ok
	bool recordToRecord(Solution* newSol);

	//! Determine whether or not the new solution should be accepted
	//! as the current solution.
	bool transitionCurrentSolution(Solution* newSol);

	//compare hash keys of two solution
	bool nonEqual( Solution* curSol, Solution* newSol );

	//!add statistics entry
	void addStatEntry();

public:
	//! @return the number of known solutions.
	size_t getNumberKnownSolutions(){return knownKeys.size();};

	const std::set<long long>& getKnownKeys() const {
		return knownKeys;
	}

	size_t getNbIterations() const {
		return nbIterations;
	}

	size_t getNbNewBestSolScp() const {
		return nbNewBestSolSCP;
	}

	size_t getNbNewCurrSolScp() const {
		return nbNewCurrSolSCP;
	}

	size_t getNbOptSolScp() const {
		return nbOptSolSCP;
	}

	double getTimeLimit() const {
		return timeLimit;
	}

	double getTimeToReachBestSol() const {
		return TimeToReachBestSol;
	}

	size_t getNbReconfigurations() const {
		return nbReconfigurations;
	}

	size_t getNbRoutesRec() const {
		return nbRoutesRec;
	}
};

#endif /* LNS_SCP_H_ */
