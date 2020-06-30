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
 
#include <iostream>
#include <limits.h>
#include <math.h>
#include <stdlib.h>

#include "../../solution/Route.h"
#include "../RequestInfo.h"
#include "InsInsertKRegret.h"
#include "../../lib/ppk_assert.h"

using namespace std;

Insert_KRegret::Insert_KRegret(std::string s, const int Kregret): ARepairOperator(s),kregret(Kregret){
	insMatrix=nullptr;
	darpSol=nullptr;
}

Insert_KRegret::~Insert_KRegret() {
}

/**
 * rebuild the solution by adding couple of node one by one
 * @param sol solution a modifier
 */
void Insert_KRegret::repairSolution(Solution& sol){
	try{
		darpSol = &sol;
		insMatrix= new MatrixCostInsertions();

		bool isFeasible =computeInsertionMatrix();

		RequestInfo* request=nullptr;
		size_t nonInsted=0;
		while (nonInsted<darpSol->getNonInserted().size() && isFeasible){
			request=Kregret(kregret);
			if (regret.size()>0){
				PPK_ASSERT(insertFeasibleRequest(*request));
				//update the matrix
				insMatrix->setRequestAsInserted(request->p->getId()); //delete all request associated to the inserted pickup ("request" included)
				updateMatrixTourInfo(request->tourid);

			}else{
				nonInsted++;
			}
		}
		delete insMatrix;

	}catch(const exception& msg){
		delete insMatrix;
		PPK_ASSERT(false,msg.what());
	}
}

void Insert_KRegret::updateMatrixTourInfo(size_t tourid){
	if (insMatrix->icost.size() > 0 ){
		Route* tour=darpSol->getRoute(tourid);
		for (size_t r = 0; r < insMatrix->icost.size(); ++r){
			if (insMatrix->icost[r][tourid]->isfeasible){	//-> assumption: a new request insertion  wont make a previous infeasible insertion likely to be feasible after.
				insMatrix->reinitInforRequest(*insMatrix->icost[r][tourid]);
				tour->evalBestInsertion(*insMatrix->icost[r][tourid]);
			}
		}
	}
}


RequestInfo* Insert_KRegret::getMinCost(){
	long minCostRegret=LONG_MAX;
	RequestInfo* minRequest=nullptr;
	for (auto& req: regret) {
		if (req.first < minCostRegret
				|| ((req.first == minCostRegret) && (req.second->cost < minRequest->cost))
				|| ((req.first == minCostRegret) && (req.second->irreg < minRequest->irreg))
		) {
				minCostRegret=req.first;
				minRequest=req.second;

		}
	}
	return minRequest;
}

RequestInfo* Insert_KRegret::getMaxRegret(){
	long maxCostRegret=regret[0].first;
	RequestInfo* maxRequest=regret[0].second;
	for (size_t i = 1; i < regret.size(); ++i) {
		if (regret[i].first> maxCostRegret) {
			maxRequest=regret[i].second;
			maxCostRegret=regret[i].first;
		}else if (regret[i].first == maxCostRegret) { // breaking ties
			if((regret[i].second->cost < maxRequest->cost)
			|| (regret[i].second->irreg < maxRequest->irreg)){
				maxRequest=regret[i].second;
				maxCostRegret=regret[i].first;
			}
		}
	}
	return maxRequest;
}

RequestInfo* Insert_KRegret::Kregret(int k_reg){
	regret.clear();regret.resize(0);
	double infinit= std::numeric_limits<double>::max();
	RequestInfo* request;
	// for every request
	for (int r = 0; r < (int)insMatrix->icost.size(); ++r)
	{
		std::vector<int> bestReq(k_reg,-1);
		std::vector<int> bestTour(k_reg,-1);
		std::vector<double> bestCost(k_reg,infinit);
		// For every route
		for (int t = 0; t < (int)insMatrix->icost[r].size(); ++t)
		{
			request =insMatrix->icost[r][t];
			bool notRanked=true;

			for (int k= 0; k< k_reg; ++k)
			{
				if (request->deltaObj < bestCost[k] && request->isfeasible && notRanked)
				{
					for (int w = k_reg-1; w > k; --w)
					{
						bestReq[w]=bestReq[w-1];
						bestTour[w]=bestTour[w-1];
						bestCost[w]=bestCost[w-1];
					}
					bestReq[k]=r;
					bestTour[k]=t;
					bestCost[k]=request->deltaObj;
					notRanked=false;
				}
			}
		}
		if(bestCost[0] < infinit ){ // there is a feasible insertion
			double sum_difference=0;
			PPK_ASSERT(insMatrix->icost[bestReq[0]][bestTour[0]]->isfeasible);
			if (k_reg==1) {
				sum_difference+=bestCost[0];
			} else {
				for(int k=k_reg-1; k>=0;--k){
					sum_difference+=bestCost[k]-bestCost[0];
				}
			}
			regret.push_back(std::make_pair(sum_difference,insMatrix->icost[bestReq[0]][bestTour[0]]));
		}
	}
	if(k_reg==1)  request=getMinCost();
	else request=getMaxRegret();
	return request;
}


/**
 * Inserts a  FEASIBLE request in the current solution
 * req  holds the information required to perform the insertion.
 */
bool Insert_KRegret::insertFeasibleRequest(RequestInfo& req){
	darpSol->getRoute(req.tourid)->insertFeasibleRequest(req);
	darpSol->recomputePerfs();
	darpSol->set_as_inserted(req.p);
	return true;
}

bool Insert_KRegret::computeInsertionMatrix() {
	Node *p, *d;
	insMatrix->icost.resize(darpSol->getNonInserted().size());
	for (size_t r = 0; r < darpSol->getNonInserted().size(); ++r){
		p=darpSol->getNode(darpSol->getNonInserted()[r]);
		d=darpSol->getNode(p->getIdsym());
		PPK_ASSERT(p->getId() < d->getId());
		size_t ntours=darpSol->getNbRoutes();
		insMatrix->icost[r].resize(ntours); // +1 b/o last item will be the cost of new tour
		for (size_t i = 0; i < insMatrix->icost[r].size(); ++i) {
			insMatrix->icost[r][i]= new RequestInfo(p,d);
		}
		evaluateInsertionRequest(r);
	}
	return insMatrix->isThereAnyFeasibleRequest();
}

void Insert_KRegret::evaluateInsertionRequest(size_t posreq) {
	ordHash hash;
	for (size_t t=0; t<darpSol->getNbRoutes(); ++t){  // calculate minimum insertion cost per tour
		RequestInfo* request=insMatrix->icost[posreq][t];
		request->tourid=(int)t;
		ordHash new_hash=darpSol->getRoute(t)->getHashkeyOrdered();
		//on regarde si deux routes successives ont le même hash
		//cela sert à ne pas tester l'insertion dans deux route vides identiques
		if(hash!=new_hash) {// if it is not another empty route with same departure and arrival nodes
			hash=new_hash;
			darpSol->getRoute(t)->evalBestInsertion(*request);
		}else{
			//deux routes succesives ont le même hash donc on copie la requestInfo de la precedente route
			*request=*insMatrix->icost[posreq][t-1];   // never delete * b/o is a deep copy
			request->tourid=(int)t; //key
		}
	}
}

