/*
 * The Original Code is the ALNS_Framework library.
 */

#include "../LNS_Iteration_Status.h"
#include "../LNSSCP_Parameters.h"
#include "../Statistics.h"
#include "ADestroyOperator.h"
#include "AOperator.h"
#include "APreRepairOperator.h"
#include "ARepairOperator.h"
#include "OperatorManager.h"
#include <iostream>
#include <set>
#include <stdlib.h>
#include <time.h>

OperatorManager::OperatorManager(const LNS_SCP_Parameters& param) {
	parameters = &param;
	firstOperator=nullptr;
	stats=nullptr;
}

OperatorManager::~OperatorManager() {
	for(auto ope : destroyOperators) delete ope;
	for(auto ope : repairOperators) delete ope;
	for(auto ope : preRepairOperators) delete ope;
}


AOperator& OperatorManager::selectOperator(std::vector<AOperator*>& vecOp)
{
	int randomVal = rand() % (int) vecOp.size();
	return *(vecOp[randomVal]);
}

ADestroyOperator& OperatorManager::selectDestroyOperator()
{
	return dynamic_cast<ADestroyOperator&>(selectOperator(destroyOperators));
}

ARepairOperator& OperatorManager::selectRepairOperator()
{
	return dynamic_cast<ARepairOperator&>(selectOperator(repairOperators));
}

APreRepairOperator& OperatorManager::selectPreRepairOperator()
{
	return dynamic_cast<APreRepairOperator&>(selectOperator(preRepairOperators));
}

void OperatorManager::addRepairOperator(ARepairOperator * repairOperator)
{
	repairOperators.push_back(repairOperator);
}

void OperatorManager::addPreRepairOperator(APreRepairOperator* preRepairOperator)
{
	preRepairOperators.push_back(preRepairOperator);
}

void OperatorManager::addDestroyOperator(ADestroyOperator* destroyOperator)
{
	destroyOperators.push_back(destroyOperator);
}

void OperatorManager::increaseDestroyArea(double percent_inc){
	for (auto Operator : destroyOperators) {
		ADestroyOperator* destroyOpe=dynamic_cast<ADestroyOperator*>(Operator);
		double prob=destroyOpe->getMaximumDestroyFrac();
		destroyOpe->setMaximumDestroyFrac(prob*(1+percent_inc));
	}
}


//ADestroyOperator& OperatorManager::getCorrespondingDestroyOperator(std::string repair_op){
//	if (repair_op=="NeighTour_Insertion") {
//		return getDestroyOperator("DT_Removal");
//	}
//	return selectDestroyOperator();
//}
//
//ADestroyOperator& OperatorManager::getDestroyOperator(std::string name){
//	for (auto destroy_opt: destroyOperators) {
//		//std::cout<<destroy_opt->getName()<<" "<<name<<std::endl;
//		if (destroy_opt->getName()==name) {
//			return dynamic_cast<ADestroyOperator&>(*destroy_opt);
//		}
//	}
//	std::cout<<"Operator "<< name<<" does not exist, please check its spelling"<<std::endl;
//	std::cout<<"A random operator is given instead! "<<std::endl;
//	return selectDestroyOperator();
//}
//
//ARepairOperator& OperatorManager::getRepairOperator(std::string name){
//	for (auto& repair_opt: repairOperators) {
//		//std::cout<<repair_opt->getName()<<" "<<name<<std::endl;
//		if (repair_opt->getName()==name) {
//			return dynamic_cast<ARepairOperator&>(*repair_opt);
//		}
//		std::cout<<"Operator "<< name<<" does not exist, please check its spelling"<<std::endl;
//		std::cout<<"A random operator is given instead! "<<std::endl;
//		return selectRepairOperator();
//	}
//}

//void OperatorManager::startSignal()
//{
//	std::vector<std::string>* names = new std::vector<std::string>();
//	for(size_t i = 0; i < repairOperators.size(); i++)
//	{
//		names->push_back(repairOperators[i]->getName());
//	}
//	for(size_t i = 0; i < destroyOperators.size(); i++)
//	{
//		names->push_back(destroyOperators[i]->getName());
//	}
//	stats->addOperatorsNames(names);
//}

void OperatorManager::update(Solution& newSolution) {
	for(size_t i = 0; i < destroyOperators.size(); i++)
	{
		destroyOperators[i]->update(newSolution);
	}
}
