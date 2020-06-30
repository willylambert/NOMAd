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

#include "constant.h"
#include "Darp.h"
#include "instance/Instance.h"
#include "neighborhood/NeighbourShaw.h"
#include "solution/Solution.h"
#include "solve/solve.h"
#include <ctime>
#include <fstream>
#include <iomanip>
#include <sstream>
#include "lib/lib_tools.h"

using namespace std;
using namespace darp;

Darp::Darp(const std::string& instJson, const std::string& paramJson) {
	try{
		cst::fromJson(paramJson);
		deleteAll=true;
		loadProblemJson(new Instance(instJson), new LNS_SCP_Parameters(paramJson));
	}catch (json::exception& msg_error){ // json format
		std::cerr<<messageJson("error", msg_error.what()) << std::endl;
	}catch(const std::exception& msg_error){
		std::cerr<<msg_error.what()<<std::endl;
	}
}

Darp::Darp(const Instance * inst, LNS_SCP_Parameters * param, const string& paramJson){
	try{
		cst::fromJson(paramJson);
		loadProblemJson(inst, param);
	}catch (json::exception& msg_error){ // json format
		std::cerr<<messageJson("error", msg_error.what()) << std::endl;
	}catch(const std::exception& msg_error){
		std::cerr<<msg_error.what()<<std::endl;
	}
}


void Darp::loadSolutionJson(const std::string & solJson){
	sol->from_json(solJson);
}

std::string Darp::solve(){
	try{
		return solveSol()->to_json();
	}
    catch (json::exception& msg_error){
        std::cerr<<messageJson("error", msg_error.what()) << std::endl;
    }catch(const std::exception& msg_error){
		std::cerr<<msg_error.what()<<std::endl;
	}
    return "{\"feasible\":false}";
}

void Darp::setCoefObj(double coefCost,double coefIreg){
	sol->setCoefObj(coefCost, coefIreg);
	sol->recomputePerfs();
}

void Darp::loadProblemJson(const Instance * _instance, LNS_SCP_Parameters * _alnsParam){

	alnsParam=_alnsParam;
	if(cst::verbosite>1) cout<<"parameters loaded :"<<endl<<alnsParam->toString()<<endl;

	instance=_instance;
	if(cst::verbosite>1) cout<<"instance loaded :"<<endl<<instance->serialize(10, false)<<endl;
	PPK_ASSERT(instance!=nullptr, "Invalid instance type in input args");

	name=instance->getName();
	if(cst::checkAll && cst::tightenTW) instance->check();  //  this second check make sense only the instance data was modified after tighten tw

	if(sol!=nullptr) delete sol;
	sol=new Solution(name, instance);
	if(cst::checkAll) sol->check(false);

	int nb_reqSol=(int) sol->getNodesSizes();

	RandomRemoval * Rand_Removal = new RandomRemoval("Random_Removal", 0.1, 0.45);
	HistoryReqRemoval * History_removal = new HistoryReqRemoval("History_Removal", 0.1, 0.45, nb_reqSol);

	Insert_KRegret * k1regret = new Insert_KRegret("1_regret", 1 );
	Insert_KRegret * k2regret = new Insert_KRegret("2_regret", 2 );
	Insert_KRegret * k3regret = new Insert_KRegret("3_regret", 3 );
	Insert_KRegret * k4regret = new Insert_KRegret("4_regret", 4 );

	OperatorManager * opMan = new OperatorManager(*alnsParam);
	opMan->addDestroyOperator(dynamic_cast<ADestroyOperator*>(Rand_Removal));
	opMan->addDestroyOperator(dynamic_cast<ADestroyOperator*>(History_removal));
	opMan->addRepairOperator(dynamic_cast<ARepairOperator*>(k1regret));
	opMan->addRepairOperator(dynamic_cast<ARepairOperator*>(k2regret));
	opMan->addRepairOperator(dynamic_cast<ARepairOperator*>(k3regret));
	opMan->addRepairOperator(dynamic_cast<ARepairOperator*>(k4regret));

	opMan->setFirstOperator(k1regret);

	if(cst::allOperators){
		NeighbourShaw * nshaw = new NeighbourShaw (instance);
		nshaw->init();
		DistanceRemoval * distanceRemoval = new DistanceRemoval("Distance_Removal", 0.1, 0.40, nshaw);
		WorseRemoval * Worse_Removal = new WorseRemoval("Worse_Removal", 0.1, 0.40);
		opMan->addDestroyOperator(dynamic_cast<ADestroyOperator*>(Worse_Removal));
		opMan->addDestroyOperator(dynamic_cast<ADestroyOperator*>(distanceRemoval));
	}

	stats = new Statistics(name,alnsParam->getPath());

	std::stringstream file_path_gen;

	SetCovering* SC =new SetCovering(sol);

	lnsscp = new LNS_SCP(sol, alnsParam, opMan, stats, instance, SC);
}

Solution * Darp::solveSol() {
	if(lnsscp==nullptr) throw std::invalid_argument(messageJson("error", "The instance could not be created"));
	lnsscp->solve();
	return sol;
}

Darp::~Darp() {
	delete lnsscp;
	delete stats;
	if(sol!=nullptr) {
		sol->deleteAllNodes();
		delete sol;
	}
	if (deleteAll) {
		delete instance;
		delete alnsParam;
	}
}

string formatTitle(string title){
	stringstream ss;
	ss<<setfill('*')<<setw(80)<<"*"<<endl;
	ss<<"*"<<setfill(' ')<<setw(40-(int)title.size()/2)<<" "+title+" " ;
	ss<<setfill(' ')<<setw(40-(int)title.size()/2)<<"*"<<endl;
	ss<<setfill('*')<<setw(80)<<"*"<<endl;
	return ss.str();
}

std::string Darp::displayProblem(bool out) const{
	stringstream ss;
	ss<<formatTitle("Instance")  << this->instance->serialize(10, false);
	ss<<formatTitle("Parameters")<< this->alnsParam->toString();
	ss<<formatTitle("Constant")  << cst::toString() ;
	if (out) cout<<ss.str();
	return ss.str();
}

std::string Darp::displaySolution(bool out) const{
	stringstream ss;
	if (sol!=nullptr)
		ss<<formatTitle("Solution")  << *this->sol ;
	if (out) cout<<ss.str();
	return ss.str();
}

std::string Darp::to_string() const{
	stringstream ss;
	ss << displayProblem(false);
	ss << displaySolution(false);
	return ss.str();
}

std::ostream& operator<<(std::ostream& out, const Darp& f){
	out << f.to_string();
	return out;
}

std::string Darp::eval(std::string str_json_route) {
	return sol->eval(str_json_route);
}

int Darp::getNodePosition(std::vector<Node*>& nodes, size_t idn){
	for (size_t i = nodes.size()-1; i >0; --i) {
		if (idn==nodes[i]->getId()){
			return (int)i;
		}
	}
	return -1;
}


