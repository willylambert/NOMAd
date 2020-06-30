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

#include "RequestInfo.h"
#include <limits.h>
#include <iomanip>

RequestInfo::RequestInfo(Node* pickup, Node* delivery, int idtour){
	deltaObj=INT_MAX;
	cost=INT_MAX;
	irreg=INT_MAX;
	tourid= idtour;
	p=pickup;
	i=-1;
	d=delivery;
	j=-1;
	vehicle=nullptr;
	isfeasible=false;
	itinerary=pickup->itinerary;

}

/*
 * Destructor..
 */
RequestInfo::~RequestInfo() {}

/*
 * Overloading operator for sorting
 */
bool operator<(const RequestInfo &s1, const RequestInfo &s2){
    if(s1.deltaObj < s2.deltaObj)
        return true;
    else
        return false;
}

double RequestInfo::getIrregularity(const std::vector<nodeType> consistency){
	double irreg=0;
	auto res = std::find(consistency.begin(),consistency.end(), p->getType());
	if(res != consistency.end())
		irreg+=	p->getIrregularity();
	res = std::find(consistency.begin(),consistency.end(), d->getType());
	if(res != consistency.end())
		irreg+=	d->getIrregularity();
	return irreg;
}

/*
 * overloading print
 */

std::ostream& operator<< (std::ostream& out, const RequestInfo& req){
	out<<"(F:"<<req.isfeasible<<", CT " << std::setprecision(10) << req.deltaObj<<", Tid"<<req.tourid <<", Pid "<<req.p->getId()<<", Did "<<req.d->getId()<<", P_i "<<req.i<<" "<<", p_j "<<req.j<<")";
	return out;
}

bool operator==(const RequestInfo& lhs, const RequestInfo& rhs){
	return (lhs.d==rhs.d && lhs.p==rhs.p && lhs.tourid==rhs.tourid &&
			lhs.deltaObj==rhs.deltaObj &&
			lhs.i==rhs.i && lhs.j==rhs.j &&
			lhs.vehicle==rhs.vehicle && lhs.isfeasible==rhs.isfeasible &&
			lhs.itinerary==rhs.itinerary);
}
