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
 
#include "DesWorseRemoval.h"

#include <limits.h>
#include <cmath>
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Worse Removal operator (Ropke & Psinger, 2006)
*/
WorseRemoval::WorseRemoval(std::string s, double minprobability, double maxprobability )
:ADestroyOperator(s,minprobability,maxprobability) {
	p=6;
	darpsol=nullptr;
}

WorseRemoval::~WorseRemoval() {
}

struct SortRequestsW{
	inline bool operator() (const RequestInfo& i, const RequestInfo& j) {
		if(i.deltaObj>j.deltaObj) 	return true;
		else if ((i.deltaObj==j.deltaObj)&& (i.cost>j.cost||i.irreg>j.irreg) ) return true;
		else return false;
	}
};

void WorseRemoval::destroySolution(Solution& sol) {
	darpsol= &sol;
	int nbRequest= (int)(darpsol->getActiveUsers().size()-darpsol->getNonInserted().size());
	int nb_destroy=getNbRemoval(nbRequest);

	vector<RequestInfo> request;
	generateWorseInsertionList(request);
	sort(request.begin(), request.end(), SortRequestsW());  //-> sort from highest to smallest delta cost giving priority to the more expensive request

	vector<size_t> requesToRemove;
	requesToRemove.reserve(nb_destroy);
	for (int i = 0; i < nb_destroy; ++i) {
		size_t id= size_t(std::pow((double(rand()))/double(RAND_MAX),p)*double(request.size()));
		requesToRemove.push_back(request[id].p->getId());
		request.erase(request.begin()+id);
	}

	if(cst::clusterRemoval) {
		darpsol->removeSetOfRequestById(requesToRemove);  // it does the same as the previous for however is slower! (no reasonable explanation)
	}else{
		for (auto& it : requesToRemove) {
			darpsol->removeRequestById(it);
		}
	}
}

void WorseRemoval::generateWorseInsertionList(std::vector<RequestInfo>& liste){
	size_t posNodeSym=0;
	for (auto t: darpsol->getRoutes()) {
		for (size_t i=1;i < t->nodes.size()-1;++i)
		{ //excluding depots
			if (t->nodes[i]->isPickup()){
				posNodeSym= *t->nodes[i]->posSymInRou;
				RequestInfo temp(t->nodes[i], t->nodes[posNodeSym]);
				temp.i=(int)i;temp.j=(int)posNodeSym;temp.tourid=(int)t->id;
				temp.deltaObj=t->getObjVal();
				if (t->evalRemoval(temp)) {
					liste.push_back(temp);
				}
			}
		}
	}
}

