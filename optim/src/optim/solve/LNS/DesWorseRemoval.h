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

#ifndef SRC_DARP_DESTROY_MWORSEREMOVAL_H_
#define SRC_DARP_DESTROY_MWORSEREMOVAL_H_

#include "../../solution/Solution.h"
#include "ADestroyOperator.h"
#include "../RequestInfo.h"
#include <iostream>
#include <vector>

/**
 * \class WorseRemoval
 * \brief Computes the worse removal operator of (Psinger&Ropke,2016)
 */
class WorseRemoval: public ADestroyOperator{

public:
	WorseRemoval(std::string s, double minprobability, double maxprobability );
	virtual ~WorseRemoval();
	void destroySolution(Solution& sol);

	Solution* darpsol;
	std::string name;
	double p=1;

	void generateWorseInsertionList(std::vector<RequestInfo>& list);
	void getWorseReqInTour(Route* tour, RequestInfo& req, std::vector<bool>& taboo);
};



#endif /* SRC_DARP_DESTROY_MWORSEREMOVAL_H_ */
