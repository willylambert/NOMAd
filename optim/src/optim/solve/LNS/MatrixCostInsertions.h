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

#ifndef SRC_DARP_STRUCTURE_MATRIXCOSTINSERTIONS_H_
#define SRC_DARP_STRUCTURE_MATRIXCOSTINSERTIONS_H_

#include "../RequestInfo.h"
#include <cstdlib>
#include <iostream>
#include <limits>
#include <vector>

/**
 * \class MatrixCostInsertions
 * This class is currently used by the K-regret operator (InsKRegret.h)
 * the purpose is to stock and manipulate stats about request insertions
 * rows : request
 * columns : routes
 * data (i,j) : information about the best insertion of request i in route j
 */
class MatrixCostInsertions {
public:
	MatrixCostInsertions();

	virtual ~MatrixCostInsertions();

	std::vector<std::vector<RequestInfo*> > icost;

	int findRequestPosition(size_t id);

	int findTourPosition(size_t tourid);

	bool setRequestAsInserted(size_t p_id);

	int createNewTourInfo(size_t tourid);

	void reinitInforRequest(RequestInfo& req);

	bool isThereAnyFeasibleRequest();

};
std::ostream& operator<< (std::ostream& out, const MatrixCostInsertions& MC);

#endif /* SRC_DARP_STRUCTURE_MATRIXCOSTINSERTIONS_H_ */
