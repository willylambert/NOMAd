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
#include <list>
#include <iomanip>
#include "Route.h"

using namespace std;

void Route::updateParameters(){
	PPK_ASSERT(T.size()==nodes.size());
	for (size_t i=0; i <nodes.size()-1; ++i) {
		nodes[i]->setTime(T[i]);
	}
	size_t n=(nodes.size()>0?nodes.size()-1:0);
	nodes[n]->setTime(T[n]);
	//T.clear();
}


bool Route::schedule() {
	dim=(int)nodes.size();
	T.clear();T.resize(dim,0);  // Departure time
	FTS.clear();FTS.resize(dim,0);  // Forward Time Slack
	reinitTimeErrors();

	shiftMax=0;

	long F=0;
	long delta=0, pos=0;
	long W=0; // waiting time used in Forward time slack
	setPos(0);
	T[0]=a(0);
	F= b(0) -T[0];
	FTS[0]= b(0) -T[0];

	//earliest start
	for (int i = 1; i < dim; ++i)
	{

		T[i] = max(T[i-1]+Tnext(i-1) + s(i-1), a(i));
		if(T[i] > b(i)){
			if(evalMode) addTimeWindowsError(i);
			else return false;
			//printT();
		}
		W = W + max((long)0, a(i) -(T[i-1]+Tnext(i-1)+s(i-1)));

		F= min(F, W + max((long)0,b(i) - T[i])); //FTS[0]= min(FTS[0], W + max((long)0,b(i) - T[i]));

		FTS[0]= min(FTS[0], W + max((long)0,(i==dim-1?T[i]:b(i)) - T[i]));

		setPos(i);  //used neighbourhood class
	}

	shiftMax=F-FTS[0];

	// optimize route duration
	T[0]=a(0)+FTS[0];  // earliest start
	setBeginningOfService();

	if((T[dim-1]-T[0])>maxRT(0)){
		if(evalMode) addRideTimeError(0);
		else return false;  // route duration feasibility
	}

	// Second pass: Fix Max Ride time violations  (Tang et all)
	for (int i = dim-2; i > 0; --i)
	{
		if (isOutType(i))
		{
			pos=posSym(i);

			delta=T[pos] -(T[i] +s(i)) - maxRT(i);

			if(delta>0){

				T[i]=T[i]+delta;

				if (T[i] > b(i)){
					if(evalMode) addRideTimeError(i);
					else return false;
				}

				for (int k = i+1; k < dim; ++k) {

					auto Tnew=T[k-1]+Tnext(k-1)+s(k-1);
					T[k] = max(T[k],Tnew);

					if(T[k] > b(k)){
						if(evalMode) addRideTimeError(i);
						else return false;
					}
				}
				if((T[pos]- (T[i]+s(i)) - maxRT(i)) > 0){
					if(evalMode) addRideTimeError(i);
					else return false;
				}

			}
		}
	}
	if(evalMode) return isTimeFeasible();
	if(cst::MPDARP)	scheduleMinIrregularity();
	return true;
}

void Route::scheduleMinIrregularity() {
	auto minIrreg=std::numeric_limits<double>::max();
	long bestDelta=0;

	for(long delta=0; delta<=shiftMax ; ++delta){
		auto newIrreg= computeIrregularity_T(delta);
		//std::cout<<delta<<"\t"<<newIrreg<<std::endl;
		if(newIrreg < minIrreg){
			minIrreg=newIrreg;
			bestDelta=delta;
		}
		if(minIrreg==0)
			break;
	}
	//std::cout<<"__"<<std::endl;
	//apply the best route shift
	if(bestDelta > 0 ){
		shiftMax=shiftMax-bestDelta;
		for (int i = 0; i < (int) T.size(); ++i)
			T[i]=T[i]+bestDelta;
		timeTest_T();
	}
}

double Route::computeCostEstimation(double timeUnitCost,double distanceUnitCost){
	long t_time= (T[dim-1]-T[0]);
	long t_dist=0;
	for(size_t i =0;i< T.size()-1;++i){
		t_dist+=Dnext(i);
	}
	return timeUnitCost*(double)t_time+ distanceUnitCost*(double)t_dist;
}

long Route::computeSumWaitingTimes_T() const{
	long Wait=0;
	for (size_t i = 0; i < T.size()-1; ++i) {
		Wait+=T[i+1]-(T[i]+Tnext(i)+s(i));
	}
	return Wait;
}

long Route::computeSumWaitingTimes() const{
	long Wait=0;
	for (size_t i = 0; i < nodes.size()-1; ++i) {
		Wait+=ti(i+1)-(ti(i)+Tnext(i)+s(i));
	}
	return Wait;
}

long Route::computeMinRouteDuration() const{
	auto dim=(int)nodes.size();
	std::vector< long > T(dim,0);  // Departure time
	std::vector< long > FTS(dim,0);  // Forward Time Slack
	long F=0;
	long W=0; // waiting time used in Forward time slack
	T[0]=a(0);
	F= b(0) -T[0];
	FTS[0]= b(0) -T[0];

	//earliest start
	for (int i = 1; i < dim; ++i)	{
		T[i] = max(T[i-1]+Tnext(i-1) + s(i-1), a(i));
		PPK_ASSERT(T[i] <= b(i),"violation of time windows" );
		W = W + max((long)0, a(i) -(T[i-1]+Tnext(i-1)+s(i-1)));
		F= min(F, W + max((long)0,b(i) - T[i])); //FTS[0]= min(FTS[0], W + max((long)0,b(i) - T[i]));
	}

	// optimize route duration
	T[0]=a(0)+F;  // earliest start
	for (int i = 1 ; i < (int) T.size(); ++i)
		T[i] = max(T[i-1]+Tnext(i-1) + s(i-1), a(i));

	PPK_ASSERT((T.back() - T.front())>0, "The route duration is negative!");
	return (T.back() - T.front());
}

long Route::getSumRT_T() const{
	long RT=0;
	for (auto req : nodes)
		if (req->isPickup()){
			long userRT=T[*(req->posSymInRou)] - (T[req->posInRou] + req->getStime());
			PPK_ASSERT(userRT>=0);
			RT += userRT;
			if(cst::GDARP_instance)
				RT += req->itinerary->getCost();
		}
	return RT;
}

long Route::getSumRT()const{
	long RT=0;
	for (auto n : nodes)
		if (n->isPickup()){
			long userRT=  nodes[*n->posSymInRou]->getTime() - (n->getTime() + n->getStime());
			PPK_ASSERT(userRT>=0);
			RT += userRT;
			if(cst::GDARP_instance)
				RT += n->itinerary->getCost();
		}
	return RT;
}

long Route::getNodeRT(Node* n) const{
	long userRT=  nodes[*n->posSymInRou]->getTime() - (n->getTime() + n->getStime());
	return userRT;
}


void Route::setBeginningOfService( int pos)
{
	for (int i = pos ; i < (int) T.size(); ++i) {
		T[i] = max(T[i-1]+Tnext(i-1) + s(i-1), a(i));
	}
}

void Route::printT(){
	cout<<"ROUTE: Duration "<< cst::L2D(T[dim-1]-T[0])<<endl;
	cout<<"  N:"<<std::fixed;
	for (size_t i = 0; i < T.size(); ++i) {
		cout<<(i<10?"      ":(i<99?"     ":"    "))<<i;
	}
	cout<<endl;

	cout<<"  idU:"<<std::fixed;
	for (size_t j = 0; j < T.size(); ++j) {
		auto i=nodes[j]->getIdUser();
		cout<<(i<10?"      ":(i<99?"     ":"    "))<<i;
	}
	cout<<endl;

	cout<<"  idI:"<<std::fixed;
	for (size_t j = 0; j < T.size(); ++j) {
		auto i=nodes[j]->getIdItin();
		cout<<(i<10?"      ":(i<99?"     ":"    "))<<i;
	}
	cout<<endl;

	cout<<"  idN:"<<std::fixed;
	for (size_t j = 0; j < T.size(); ++j) {
		auto i=nodes[j]->getId();
		cout<<(i<10?"      ":(i<99?"     ":"    "))<<i;
	}
	cout<<endl;

	cout<<"  idP:"<<std::fixed;
	for (size_t j = 0; j < T.size(); ++j) {
		auto i=nodes[j]->getPointId();
		cout<<(i<10?"      ":(i<99?"     ":"    "))<<i;
	}
	cout<<endl;

	cout<<" id: "<<std::setprecision(1)<<std::fixed;
	cout<<"    VO";
	for (size_t i = 1; i < T.size()-1; ++i) {

		if(isOutType(i) ){
			cout<<(idN(i)<10?"     ":(idN(i)<99?"    ":"   "))<<"P"<<idN(i);
		}else{
			int idn=idN(i)-(int)inst->getNbUsers();
			cout<<(idn<10?"     ":(idn<99?"    ":"   "))<<"D"<<idn;
		}
	}
	cout<<"    VO";
	cout<<endl;

	cout<<"  A:"<<std::setprecision(1)<<std::fixed;
	for (size_t i = 0; i < T.size(); ++i) {
		cout<<(cst::L2D(a(i))<10?"     ":(cst::L2D(a(i))<99?"   ":"  "))<<cst::L2D(a(i));
	}
	cout<<endl;

	cout<<"  B:"<<std::setprecision(1)<<std::fixed;
	for (size_t i = 0; i < T.size(); ++i) {
		cout<<(cst::L2D(b(i))<10?"     ":(cst::L2D(b(i))<99?"   ":"  "))<<cst::L2D(b(i));
	}
	cout<<endl;

	cout<<"  T:"<<std::setprecision(1)<<std::fixed;
	for (size_t i = 0; i < T.size(); ++i) {
		cout<<(cst::L2D(T[i])<10?"     ":(cst::L2D(T[i])<99?"   ":"  "))<<cst::L2D(T[i]);
	}
	cout<<endl;

	cout<<"tij:"<<std::setprecision(1)<<std::fixed;
	for (size_t i = 0; i < T.size()-1; ++i) {
		cout<<(cst::L2D(Tnext(i))<10?"    ":(cst::L2D(Tnext(i))<99?"   ":"  "))<<cst::L2D(Tnext(i));
	}
	cout<<endl;

	cout<<"  s:"<<std::setprecision(1)<<std::fixed;
	for (size_t i = 0; i < T.size(); ++i) {
		cout<<((s(i))<10?"     ":((s(i))<99?"   ":"  "))<<(s(i));
	}
	cout<<endl;
	cout<<"  S:"<<std::setprecision(2)<<std::fixed;
	for (size_t i = 0; i < T.size()-1; ++i) {
		auto slack=cst::L2D(min(b(i)-T[i],T[i+1]-(T[i]+Tnext(i)+s(i))));
		cout<<(slack<10?"   ":(slack<99?"  ":" "))<<slack;
	}
	cout<<endl;

	cout<<"  W:"<<std::setprecision(2)<<std::fixed;
	for (size_t i = 0; i < T.size()-1; ++i) {
		auto Wait=cst::L2D(T[i+1]-(T[i]+Tnext(i)+s(i)));
		cout<<(Wait<10?"   ":(Wait<99?"  ":" "))<<Wait;
	}
	cout<<endl;
	cout<<"  F:"<<std::setprecision(2)<<std::fixed;
	for (size_t i = 0; i < T.size()-1; ++i) {
		auto ftsij=cst::L2D(FTS[i]);
		cout<<(ftsij<10?"   ":(ftsij<99?"  ":" "))<<ftsij;

	}
	cout<<endl;

	cout<<endl;
}




