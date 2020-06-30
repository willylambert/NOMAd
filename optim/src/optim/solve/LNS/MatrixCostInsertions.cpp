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

#include "MatrixCostInsertions.h"
#include <vector>
#include <algorithm>
#include <limits>


MatrixCostInsertions::MatrixCostInsertions() {
}

MatrixCostInsertions::~MatrixCostInsertions() {
	for (size_t i = 0; i < icost.size(); ++i) {
		for (size_t j = 0; j < icost[i].size(); ++j) {
			delete icost[i][j];
		}
	}
}

int MatrixCostInsertions::findTourPosition(size_t tourid){
	for (size_t i = 0; i < icost[0].size(); ++i) {
		if (icost[0][i]->tourid==(int)tourid) {
			return (int)i;
		}
	}
	return -1; //if the node it isn't there
}

int MatrixCostInsertions::findRequestPosition(size_t id){
	for (size_t i = 0; i < icost.size(); ++i) {
		if (icost[i].back()->p->getId()==id) {
			return (int)i;
		}
	}
	return -1;
}

bool MatrixCostInsertions::setRequestAsInserted(size_t p_id){
	int posreq=findRequestPosition(p_id);
	for(auto request: icost[posreq] ){
		delete request;
	}
	icost.erase(icost.begin()+posreq);
	return true;
}

int MatrixCostInsertions::createNewTourInfo(size_t tourid){
	int pos=(int)icost[0].size()-1;
	for (size_t i = 0; i < icost.size(); ++i) {
		icost[i].insert(icost[i].begin()+pos,new RequestInfo(icost[i][0]->p,icost[i][0]->d, (int) tourid));
	}
	return pos;
}


bool MatrixCostInsertions::isThereAnyFeasibleRequest(){
	for(auto row : icost)
		for(auto req : row)
			if (req->isfeasible)
				return true;
	return false;
}


/*
 * The only thing does not reinit are the pickup and delivery pointers
 */
void MatrixCostInsertions::reinitInforRequest(RequestInfo& req){
	req.deltaObj=-1;
	req.isfeasible=false;
	req.i=-1;
	req.j=-1;
	req.vehicle=nullptr;
}


std::ostream& operator<< (std::ostream& out, const MatrixCostInsertions& MC){
	out<<"Insertion relative costs \n";
	for (size_t i = 0; i < MC.icost.size() ; ++i) {
		for (size_t j = 0; j < MC.icost[i].size(); ++j) {
			out<<MC.icost[i][j]<<"\t";
		}
			out<<"\n";
	}
	return out;
}


