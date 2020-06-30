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
 
#include "../solution/Route.h"
#include "../solve/RequestInfo.h"
#include "Neighborhood.h"
#include <iostream>
#include <limits>

Neighborhood::Neighborhood(const Instance * _inst) {
	inst= _inst;
}

Neighborhood::~Neighborhood() {
}

void Neighborhood::init(){
	computeRequestDistances();
	createNeighborMatrix();
}

void Neighborhood::computeRequestDistances() {
	vv_distance.resize(inst->getNbUsers());
	for (size_t i = 0; i < inst->getNbUsers(); ++i) {
		vv_distance[i].resize(inst->getNbUsers());
		for (size_t j = i+1; j < inst->getNbUsers(); ++j) {
			vv_distance[i][j]=distanceFunction(i,j);
		}
	}
	for (size_t i = 0; i < inst->getNbUsers(); ++i) {
		for (size_t j = 0; j < i; ++j) {
			vv_distance[i][j]=vv_distance[j][i];
		}
	}
	for (size_t j = 0; j < inst->getNbUsers(); ++j) {
		vv_distance[j][j]=0;
	}
}

void Neighborhood::createNeighborMatrix() {
	std::vector<bool> visited;
	vv_neighborhood.resize(inst->getNbUsers());
	size_t min_id;
	long min_dist;
	for (size_t i = 0; i < inst->getNbUsers(); ++i) {
		vv_neighborhood[i].resize(inst->getNbUsers());
		visited.clear();
		visited.resize(inst->getNbUsers(),false);
		for (size_t j = 0; j < inst->getNbUsers(); ++j) {
			min_dist=std::numeric_limits<long>::max();
			for (size_t k = 0; k < inst->getNbUsers(); ++k) {
				if(vv_distance[i][k]<min_dist && !visited[k]){
					min_dist=vv_distance[i][k];
					min_id=k;
				}
			}
			visited[min_id]=true;
			vv_neighborhood[i][j] = min_id;
		}
	}
}

void Neighborhood::setTriangularInequality() {
	for (size_t k = 0; k < inst->getNbUsers(); ++k) {
		for (size_t i = 0; i < inst->getNbUsers(); ++i) {
			for (size_t j = 0; j < inst->getNbUsers(); ++j) {
				if(vv_distance[i][j]>vv_distance[i][k]+vv_distance[k][j]){
					vv_distance[i][j]=vv_distance[i][k]+vv_distance[k][j];
				}
			}
		}
	}
}

void Neighborhood::display() {
	//distance
	std::cout<<"*********DISTANCE*********"<<std::endl;
	for (size_t i = 0; i < inst->getNbUsers(); ++i){
		std::cout<<"\t"<<i;
	}
	std::cout<<std::endl;
	for (size_t i = 0; i < inst->getNbUsers(); ++i) {
		std::cout<<i;
		for (size_t j = 0; j < inst->getNbUsers(); ++j) {
			std::cout<<"\t"<<vv_distance[i][j];
		}
		std::cout<<std::endl;
	}
	//neighborhood
	std::cout<<"*********NEIGHBORHOOD*********"<<std::endl;
	for (size_t i = 0; i < inst->getNbUsers(); ++i){
		std::cout<<"\t"<<i;
	}
	std::cout<<std::endl;
	for (size_t i = 0; i < inst->getNbUsers(); ++i) {
		std::cout<<i;
		for (size_t j = 0; j < inst->getNbUsers(); ++j) {
			std::cout<<"\t"<<vv_neighborhood[i][j];
		}
		std::cout<<std::endl;
	}
}

void Neighborhood::printRoute(std::vector<Node*>& route){
	for(auto& n: route) std::cout<<"\t"<<n->getId();
	std::cout<<std::endl;

}
