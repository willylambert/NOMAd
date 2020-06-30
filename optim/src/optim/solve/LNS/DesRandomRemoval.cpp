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
 
#include "DesRandomRemoval.h"
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <algorithm>

using namespace std;

RandomRemoval::RandomRemoval(std::string s, double mini_frac, double maxi_frac )
:ADestroyOperator(s,mini_frac,maxi_frac) {
}

RandomRemoval::~RandomRemoval() {
}


void RandomRemoval::destroySolution(Solution& sol) {
	darpsol = &sol;
	int nbRequest=(int)darpsol->getActiveUsers().size()-(int)darpsol->getNonInserted().size();
	auto nbRequestToDestroy=getNbRemoval(nbRequest);

	vector<size_t> requestToRemove = darpsol->getActiveUsers();
	random_shuffle(requestToRemove.begin(), requestToRemove.end());
	requestToRemove.resize(nbRequestToDestroy);
	if(cst::clusterRemoval)
		darpsol->removeSetOfRequestById(requestToRemove);  // it does the same as the previous for however is slower! (no reasonable explanation)
	else{
		for (int p = 0; p < nbRequestToDestroy; ++p) {
			darpsol->removeRequestById(requestToRemove[p]);
		}
	}
}
