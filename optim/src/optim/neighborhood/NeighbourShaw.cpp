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
 
#include "NeighbourShaw.h"
#include <limits>

NeighbourShaw::NeighbourShaw(const Instance* ins): Neighborhood(ins) {}

NeighbourShaw::~NeighbourShaw() {
}

long NeighbourShaw::distanceFunction(size_t i, size_t j){
	const User * ui = inst->getUser(i);
	const User * uj = inst->getUser(j);
	long dist_min= std::numeric_limits<long>::max();
	for(auto * itinI : ui->getItineraries()){
		for(auto * itinJ : uj->getItineraries()){
			size_t pi=itinI->get_pickup();
			size_t di=itinI->get_delivery();
			size_t pj=itinJ->get_pickup();
			size_t dj=itinJ->get_delivery();
			dist_min=std::min(dist_min,
						 inst->getDist(pi,pj)+inst->getDist(di,pj)
						 	 +inst->getDist(pi,dj)+inst->getDist(di,dj)
					);
		}
	}
	return dist_min;
}

/**/
