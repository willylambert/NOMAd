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
 
#ifndef DARP_INSTANCEMANAGER_NEIGHBORHOOD_H_
#define DARP_INSTANCEMANAGER_NEIGHBORHOOD_H_

#include "../instance/Instance.h"
#include "../solution/Node.h"
#include <vector>

/**
 * virtual class to define distance matrix between a pair of requests
 */

class Neighborhood {
public:
	Neighborhood(const Instance* _inst);
	virtual ~Neighborhood();

	/**
	 * distance between the point a and the point b
	 * Based on the possibility to create a tour with both points and return the optimized cost associated to this association
	 * @param a		id of dial a
	 * @param b		id of dial b
	 * @return distance
	 */
	virtual long distanceFunction(size_t a, size_t b)=0;


	const std::vector<std::vector<long> >& getVvDist() const {
		return vv_distance;
	}

	const std::vector<std::vector<size_t> >& getNeighborhood() const {
		return vv_neighborhood;
	}

	/**
	 * display distance and neighborhood
	 */
	void display();
	/**
	 * print route id's
	 */
	void printRoute(std::vector<Node*>& route);
	/**
	 * Initialized the neightbour matrix and compute distances amomng request
	 */
	void init();

protected:
	/**
	 * matrix of distance
	 */
	void computeRequestDistances();

	/**
	 * matrix of neighborhood
	 */
	void createNeighborMatrix();

	/**
	 * triangular inequality
	 */
	void setTriangularInequality();

	/**
	 * *********************************************
	 */

	/**
	 * matrix of distance
	 */
	std::vector< std::vector< long > > vv_distance;


	/**
	 * matrix of neighborhood
	 */
	std::vector< std::vector< size_t > > vv_neighborhood;

	/**
	 * penality when the association in a tour is not feasible
	 */
	double penality=10000;

	/**
	 * instance
	 */
	const Instance *inst;

};

#endif /* DARP_INSTANCEMANAGER_NEIGHBORHOOD_H_ */
