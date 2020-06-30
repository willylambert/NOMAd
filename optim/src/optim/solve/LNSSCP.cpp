#include "LNSSCP.h"

/*
 * The Original Code is the ALNS_Framework library.
 */


#include "../constant.h"
#include "../instance/Instance.h"
#include "../solution/Solution.h"
#include "LNSSCP_Parameters.h"
#include "Statistics.h"
#include <assert.h>
#include <cmath>
#include <float.h>
#include <iostream>
#include <set>
#include <stdlib.h>
#include <time.h>
#include "LNS/ADestroyOperator.h"
#include "LNS/AOperator.h"
#include "LNS/ARepairOperator.h"
#include "LNS/APreRepairOperator.h"
#include "LNS/OperatorManager.h"
#include "../lib/lib_tools.h"

using namespace std;

LNS_SCP::LNS_SCP(Solution * initialSolution,
		LNS_SCP_Parameters* parameters,
		OperatorManager* opMan,
		Statistics * statistics,
		const Instance* inst,
		SetCovering* SC){

	instance=inst;
	bestsolution = initialSolution;
	stats=statistics;
	param = parameters;
	nbIterations = 0;
	opManager = opMan;
	timeLimit=param->getMaxRunningTime()*(CLOCKS_PER_SEC);
	timeLimitScp=param->getTimeLimitSCP();
	SCP=SC;

	//ASCP2
	baseNbIterScp=0;
	prevSolOptimal=false;

	nbNewBestSolSCP=0;
	nbNewCurrSolSCP=0;
	nbOptSolSCP=0;
	nbReconfigurations=0;
	nbRoutesRec=0;

	acceptanceRecorToRecord=1+param->getAcceptanceProbability();

	nbIterWithoutImprove = 0;
	//lsManager = &lsMan;
	opManager->setStatistics(statistics);
	// We add the initial solution in the best solution manager.
	nbIterWithoutImproveCurrent = 0;

	newSolution=nullptr;
	currentSolution=nullptr;
	TimeToReachBestSol=0;
	startingTime=0;
	destroy=nullptr;
	repair=nullptr;
	prerepair=nullptr;
}

LNS_SCP::~LNS_SCP(){
	//delete currentSolution;
	//delete newSolution;
	delete SCP;
	delete opManager;
}


bool LNS_SCP::solve()
{
	nbIterations=0;
	startingTime = clock();
	stats->setStart();
	if(cst::checkAll){bestsolution->check(false);}
	newSolution = bestsolution->getCopy();
	newSolution->setName("newSolution");
	currentSolution = bestsolution->getCopy();
	currentSolution->setName("currentSolution");
	if(cst::checkAll){newSolution->check(false);}

	while(!isStoppingCriterionMet()){
		performOneIteration();
	}

	bestsolution->computeIdConfigParameters();
	nbReconfigurations=bestsolution->computeNbReconfigurations(&nbRoutesRec);
	bestsolution->setExecNbIteration((int) nbIterations);
	bestsolution->setExecTime((double)((clock()-startingTime)/CLOCKS_PER_SEC));

	//if(cst::checkAll)
	bestsolution->check(true,true);

	if(cst::verbosite>0){
		if(cst::displaySol)
			cout<<"[BEST SOL]\n"<<*bestsolution<<endl;
		double percent=100.0*((double)param->getMaxNbIterationSetCovering()/(double)nbIterations);

		std::cout <<"[BEST SOL]\tObjV:" << bestsolution->getPenalizedObjectiveValue()
						   << "\tCost:" << bestsolution->getTotalCost()
						   << "\tIreg:" << bestsolution->getTotalIrreg()
						   << "\tFeasible:" << bestsolution->isFeasible()
						   << "\tNbRoutes:" << bestsolution->getNbRoutesUsed()
						   << "\tTime(sec):" <<bestsolution->getExecTime()
						   << std::endl;
	}
	newSolution->deleteAllNodes();
	currentSolution->deleteAllNodes();
	delete newSolution;
	delete currentSolution;
	return bestsolution->isFeasible();
}

void LNS_SCP::performOneIteration(){
	if(nbIterations==0){
		repair = opManager->getFirstOperator();
	} else{
		//prerepair = &opManager->selectPreRepairOperator();
		repair = &opManager->selectRepairOperator();
		destroy = &opManager->selectDestroyOperator();
		destroy->destroySolution(*newSolution);
		if(cst::verbosite>1)
			cout<<"[Destroy] it:"<<nbIterations<< "\toperator:"
				<<destroy->getName()<<"\tlist users:"
				<<FormatString().vector(newSolution->getNonInserted())<<endl;
		status.setAlreadyDestroyed(LNS_Iteration_Status::TRUE);
		//prerepair->precompute(*newSolution);
	}


	status.setAlreadyRepaired(LNS_Iteration_Status::FALSE);

	repair->repairSolution(*newSolution);

	if(cst::verbosite>1) cout<<"[Repair] it:"<<nbIterations<< "\toperator:"<<repair->getName()<<endl;
	status.setAlreadyRepaired(LNS_Iteration_Status::TRUE);

	if(cst::checkAll)
		newSolution->check();

	if(cst::fullStats)
		addStatEntry();

	if(checkAgainstKnownSolution(*newSolution))
		opManager->update(*newSolution); //-> update scores for the historical removal operator

	if(isNewBest(newSolution) && cst::checkAll) //-> update the best Solution
		bestsolution->check();

	recordToRecord(newSolution);

	// Printout in console
	if(cst::verbosite>0 && (nbIterations % param->getLogFrequency() ==  0) ){
		std::cout<<"[ALNS] "<< stats->getLastEntry()->shortToString(newSolution->isFeasible())<<endl;
	}

	nbIterations++;
}

void LNS_SCP::solveSetCoveringProblem()
{

	if ((nbIterations-baseNbIterScp)%param->getMaxNbIterationSetCovering()==0 && nbIterations >0)
	{
		if(bestsolution->getSizeRequestBank()==0)
		{
			bool isOptimal=false;

			auto SCPsol =SCP->solveSetCoveringProblem(timeLimitScp, isOptimal);

			if (SCPsol->isFeasible()){

				// is new best known solution
				if(isNewBest(SCPsol)){
					nbNewBestSolSCP++;
					if(cst::verbosite>1) cout <<"SCP NEW BEST SOLUTION, COST : " << cst::D2L(bestsolution->getPenalizedObjectiveValue())<< endl;
				}

				//adaptative SCP
				if(!isOptimal && !prevSolOptimal) {
					baseNbIterScp=nbIterations;
					double new_nbMaxIter_dbl=double(param->getMaxNbIterationSetCovering())*param->getFrecRateScp();
					if(new_nbMaxIter_dbl<1) new_nbMaxIter_dbl=1;
					param->setMaxNbIterationSetCovering(size_t(new_nbMaxIter_dbl));
					if(cst::verbosite>1) cout<<"Reducing..  Frec:"<<param->getMaxNbIterationSetCovering()<<" TimeL: "<< timeLimitScp<<endl;
				}

				if(isOptimal){
					prevSolOptimal=true;
				}
			}
			SCPsol->deleteAllNodes();
			delete SCPsol;
		}
		else
		{
			if(cst::verbosite>0)
				messageJson("warning","[SCP] no feasible solutions yet found in the LNS :(");
		}
	}
}

bool LNS_SCP::recordToRecord(Solution* newSol) {
	// improve current solution
	if((*newSol)<(*currentSolution)){
		nbIterWithoutImproveCurrent = 0;
		status.setImproveCurrentSolution(LNS_Iteration_Status::TRUE);
	}else{
		nbIterWithoutImproveCurrent++;
		status.setImproveCurrentSolution(LNS_Iteration_Status::FALSE);
	}
	status.setNbIterationWithoutImprovementCurrent(nbIterWithoutImproveCurrent);

	// update current solution
	if (newSol->getPenalizedObjectiveValue() < acceptanceRecorToRecord*bestsolution->getPenalizedObjectiveValue()){
		currentSolution->replicateSolution(newSol);
		status.setAcceptedAsCurrentSolution(LNS_Iteration_Status::TRUE);
		return true;
	}else{
		newSol->replicateSolution(currentSolution);	//comming back to previos state
		status.setAcceptedAsCurrentSolution(LNS_Iteration_Status::FALSE);
		return false;
	}
}

void LNS_SCP::addStatEntry(){
	string destroy_name="";
	if(nbIterations>0) destroy_name=destroy->getName();
	stats->addEntry(new StatEntry(static_cast<double>(clock()-startingTime)/CLOCKS_PER_SEC,
								nbIterations,
								destroy_name,
								repair->getName(),
								newSolution->getTotalCost(),
								newSolution->getTotalIrreg(),
								newSolution->getPenalizedObjectiveValue(),
								currentSolution->getPenalizedObjectiveValue(),
								bestsolution->getPenalizedObjectiveValue(),
								(int)knownKeys.size(),
								status.getAcceptedAsCurrentSolution()==LNS_Iteration_Status::TRUE,
								status.getNewBestSolution()==LNS_Iteration_Status::TRUE,
								status.getAlreadyKnownSolution()==LNS_Iteration_Status::TRUE,
								nbNewBestSolSCP,
								nbNewCurrSolSCP,
								0,
								nbOptSolSCP)
	);
}

bool LNS_SCP::isNewBest(Solution* newSol ){
	if ((newSol->getPenalizedObjectiveValue() < bestsolution->getPenalizedObjectiveValue())
	|| ((newSol->getPenalizedObjectiveValue()==bestsolution->getPenalizedObjectiveValue()) &&
	(newSol->getTotalIrreg()<bestsolution->getTotalIrreg()))
	|| ((newSol->getPenalizedObjectiveValue()==bestsolution->getPenalizedObjectiveValue())&&
			(newSol->getTotalCost()<bestsolution->getTotalCost()))
	){
		nbIterWithoutImprove = 1;
		status.setNewBestSolution(LNS_Iteration_Status::TRUE);
		status.setNbIterationWithoutImprovement(nbIterWithoutImprove);
		status.setNbIterationWithoutImprovementSinceLastReload(0);
		//count_succes++;
 		bestsolution->replicateSolution(newSol);
 		bestsolution->setExecNbIteration((int)nbIterations);
 		bestsolution->setExecTime((double)((clock()-startingTime)/CLOCKS_PER_SEC));
		TimeToReachBestSol = double(clock()-this->startingTime)/CLOCKS_PER_SEC;
		if(TimeToReachBestSol >= cst::timeMinWithoutExport
				&& cst::path_export_best_sol!=""){ //export the new solution
			bestsolution->to_json(true,cst::path_export_best_sol);
		}
		return true;
	}else {
		status.setNewBestSolution(LNS_Iteration_Status::FALSE);
		nbIterWithoutImprove++;
		status.setNbIterationWithoutImprovement(nbIterWithoutImprove);
		status.setNbIterationWithoutImprovementSinceLastReload(status.getNbIterationWithoutImprovementSinceLastReload()+1);
		return false;
	}
}

bool LNS_SCP::nonEqual( Solution* newSol, Solution* curSol){
	if (newSol->getHash()!= curSol->getHash()) {
		return true;
	} else {
		return false;
	}
}
// validate weather it should stop or not
bool LNS_SCP::isStoppingCriterionMet()
{
	//regarde si le fichier d'arret existe
	if(cst::path_stop_file!=""
			&& exists_test_file(cst::path_stop_file) ){
		if(cst::verbosite>0)
			cout<< "stopping file founded"<<endl;
		if(cst::remove_stopping_file)
			remove( cst::path_stop_file.c_str() );
		return true;
	}

	//critere classique de temps et nombre d'itteration
	time=(double) (clock()-startingTime);
	if( nbIterations< param->getMaxNbIterations() && time < timeLimit )
	{
		return false;
	}
	return true;
}


bool LNS_SCP::checkAgainstKnownSolution(Solution& sol)
{
	bool notKnownSolution = false;
	long long keySol = sol.getHash();
	if(knownKeys.find(keySol) == knownKeys.end())
	{
		notKnownSolution = true;
		knownKeys.insert(keySol);
	}
	if(!notKnownSolution)
	{
		status.setAlreadyKnownSolution(LNS_Iteration_Status::TRUE);
	}
	else
	{
		status.setAlreadyKnownSolution(LNS_Iteration_Status::FALSE);
	}
	return notKnownSolution;
}



