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
 
#include "DesHistoryReqRemoval.h"

#include <limits.h>
#include <cmath>
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

HistoryReqRemoval::HistoryReqRemoval(std::string s, double minprobability, double maxprobability,int nb_nodes):ADestroyOperator(s,minprobability,maxprobability) {
	p=6;
	/* Initialize the array with the students*/
	nbnodes=nb_nodes;
	scores = new double*[nb_nodes];
	for (int i = 0; i < nb_nodes; i++) {
		scores[i]= new double[nb_nodes];
	}
	for (int i = 0; i < nb_nodes; ++i) {
		for (int j = 0; j < nb_nodes; ++j) {
			scores[i][j]=INT_MAX;
		}
	}
}

HistoryReqRemoval::~HistoryReqRemoval() {
	/* Delete the array of scores*/
	for (int i = 0; i < nbnodes; i++){
		delete[] scores[i];
	}
	delete [] scores;
}

struct SortRequests{
	inline bool operator() (const std::pair<double, int>& l, const std::pair<double, int>& r) {
		return (l.first>r.first);
	}
};

void HistoryReqRemoval::destroySolution(Solution& sol) {
	Solution* darpsol= &sol;
	int nbRequest= (int)(darpsol->getActiveUsers().size()-darpsol->getNonInserted().size());
	int nb_destroy=getNbRemoval(nbRequest);
	update(sol);

	//sort weights by score
	sort(weights.rbegin(),weights.rend(),SortRequests());

	//init vector of node to remove
	vector<size_t> requesToRemove;
	requesToRemove.reserve(nb_destroy);

	for (int i = 0; i < nb_destroy; ++i) {
		size_t id= size_t(std::pow((double(rand()))/double(RAND_MAX),p)*double(weights.size()));
		requesToRemove.push_back(weights[id].second);
		weights.erase(weights.begin()+id);
	}
	if(cst::clusterRemoval)
		darpsol->removeSetOfRequestById(requesToRemove);  // it does the same as the previous for however is slower! (no reasonable explanation)
	else{
		for (auto& it : requesToRemove) {
			darpsol->removeRequestById(it);
		}
	}
}

void HistoryReqRemoval::update(Solution& sol){
	Solution* darpsol= &sol;
	weights.clear();
	//weights.resize(0);
	weights.reserve(darpsol->getActiveUsers().size()*2+darpsol->getNbDepots()*2);
	double score=darpsol->getPenalizedObjectiveValue();
	for (size_t idT = 0; idT < darpsol->getNbRoutes(); ++idT) {
		const Route * tour = darpsol->getRoute(idT);
		for (auto node=(++tour->nodes.begin()), end=(--tour->nodes.end()); node!=end; ++node ) {
			auto previous=node;
			--previous;
			size_t i=(*previous)->getId();
			size_t j=(*node)->getId();
			double old_score=scores[i][j];
			scores[i][j]= min(old_score, score);
			if ((*node)->isOutType() && darpsol->isActive(*node)) { // if pickup
				weights.push_back(make_pair(scores[i][j],j));
			}
		}
	}
}
