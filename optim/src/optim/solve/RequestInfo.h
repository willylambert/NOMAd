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


#ifndef SRC_DARP_STRUCTURE_REQUESTINFO_H_
#define SRC_DARP_STRUCTURE_REQUESTINFO_H_
#include <cstdlib>

#include "../solution/Node.h"
#include "../instance/VehicleType.h"

/**
 * \class RequestInfo
 * This class specified an elementary action in the solution
 * the action can be a removal or an insertion
 * the action si elementary because only one user is removed/inserted
 */

class RequestInfo {

public:

	/**
	 * minimun constructor.
	 * @param pickup pointer
	 * @param delivery pointer
	 * @param idtour route id, by default is set to -1
	 */
	RequestInfo(Node* pickup, Node* delivery, int idtour=-1);

	virtual ~RequestInfo();

	double getIrregularity(const std::vector<nodeType> consistency);

	//parameters
	double deltaObj;
	double cost;
	double irreg;
	int tourid;
	Node* p;
	int i;
	Node* d;
	int j;
	const VehicleType* vehicle;
	bool isfeasible;
	const Itinerary * itinerary;
};


bool operator<(const RequestInfo &s1,const RequestInfo &s2);

std::ostream& operator<< (std::ostream& out, const RequestInfo& req);

bool operator==(const RequestInfo& lhs, const RequestInfo& rhs);

#endif /* SRC_DARP_STRUCTURE_REQUESTINFO_H_ */
