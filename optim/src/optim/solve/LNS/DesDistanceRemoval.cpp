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
 
#include "DesDistanceRemoval.h"
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <cmath>
#include <algorithm>


using namespace std;

DistanceRemoval::DistanceRemoval(std::string s, double mini_percent, double maxi_percent, Neighborhood * _neigh): ADestroyOperator(s,mini_percent,maxi_percent) {
	neigh=_neigh;
	p=6;
}

DistanceRemoval::~DistanceRemoval() {
	delete neigh;
}

void DistanceRemoval::destroySolution(Solution& sol) {

	darpsol = &sol;
	int nbRequest= (int)(darpsol->getActiveUsers().size()-darpsol->getNonInserted().size());
	int nb_destroy=getNbRemoval(nbRequest);
	PPK_ASSERT(nb_destroy <= (int)darpsol->getActiveUsers().size());
	size_t centerRequest=0;
	if (nbRequest>0){

		vector<size_t> insertedUsers;
		for(auto id : darpsol->getActiveUsers()){
			if(!darpsol->isNotInserted(id))
				insertedUsers.push_back(id);
		}

		centerRequest=darpsol->getActiveUsers()[rand()%nbRequest];
		vector<size_t> requestSorted;
		for (int i=0 ; i < (int)neigh->getNeighborhood()[centerRequest].size() ;++i){
			size_t id=neigh->getNeighborhood()[centerRequest][i];
			if(find(insertedUsers.begin(),insertedUsers.end(),id)!=insertedUsers.end())
				requestSorted.push_back(id);
		}

		PPK_ASSERT(requestSorted.size()==(darpsol->getActiveUsers().size()-darpsol->getNonInserted().size()));

		vector<size_t> requestToRemove;

		// roulette wheel
		for (int i = 0; i < nb_destroy; ++i) {
			size_t id= size_t(std::pow((double(rand()))/double(RAND_MAX),p)*double(requestSorted.size()));
			requestToRemove.push_back(requestSorted[id]);
			requestSorted.erase(requestSorted.begin()+id);
		}

		if(cst::clusterRemoval)
			darpsol->removeSetOfRequestById(requestToRemove);  // it does the same as the previous for however is slower! (no reasonable explanation)
		else{
			for (auto& it : requestToRemove) {
				darpsol->removeRequestById(it);
			}
		}

	}
}

