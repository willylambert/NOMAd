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
 
#ifndef SRC_DARP_INSTANCEMANAGER_NEIGHBOURSHAW_H_
#define SRC_DARP_INSTANCEMANAGER_NEIGHBOURSHAW_H_
#include "Neighborhood.h"

/**
 * distance between request based on (Shaw, 1998)
 * Shaw, P., 1998. Using constraint programming and local search methods to solve vehicle routing
problems. In: International Conference on Principles and Practice of Constraint Programming.
Springer, pp. 417–431
 */

class NeighbourShaw : public Neighborhood {
public:
	NeighbourShaw(const Instance* ins);
	virtual ~NeighbourShaw();
	long distanceFunction(size_t a, size_t b);
};

#endif /* SRC_DARP_INSTANCEMANAGER_NEIGHBOURSHAW_H_ */
