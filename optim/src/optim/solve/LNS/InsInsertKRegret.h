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


#ifndef INSERT_KREGRET_H_
#define INSERT_KREGRET_H_

#include "../../instance/Instance.h"
#include "../../solution/Solution.h"
#include "ARepairOperator.h"
#include "MatrixCostInsertions.h"
#include <vector>

/**
 * \class  Insert_KRegret
 * \brief  corresponds to k-regret operator of (Psinger&Ropke,2016)
 */
class Insert_KRegret: public ARepairOperator
{
public:  // constructor

	Insert_KRegret(std::string s, const int kregret);
	virtual ~Insert_KRegret();

private:  //-> attributs

	const int kregret;
    Solution* darpSol;
    MatrixCostInsertions* insMatrix;
    std::vector< std::pair<long, RequestInfo*> > regret;

public:	//-> methods

	void repairSolution(Solution& sol);
	void updateMatrixTourInfo(size_t tourid);

private:

	RequestInfo* getMaxRegret();

	RequestInfo* getMinCost();

	RequestInfo* Kregret(int k_reg);

	bool insertFeasibleRequest(RequestInfo& req);

	/**
	 * compute insertion of a given user (ligne : posreq) in all routes
	 */
    void evaluateInsertionRequest(size_t posreq);

	/**
	 * This method computes insertion costs for all request
	 */
    bool computeInsertionMatrix();


public:
    int getKregret() const { return kregret;}



};

#endif /* INSERT_KREGRET_H_ */
