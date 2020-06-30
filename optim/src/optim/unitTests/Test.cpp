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

#include "../constant.h"
#include "../Darp.h"
#include "../MPdarp.h"
#include "../instance/Instance.h"
#include "../lib/json.hpp"
#include "../lib/lib_tools.h"
#include "Test.h"
#include <fstream>
#include <stdlib.h>
#include <sstream>
#include "../solve/LNSSCP_Parameters.h"
using namespace std;
using namespace darp;
using json = nlohmann::json;



Test::Test(bool extensive){
	testJsonLib();
	testEvalSolution();
	testEval();
	testSolve(false);
	if(extensive)
		testSolveLong();
	std::cerr<<"[Test] >>>>>>>>>>>>>>>>>>>>>>> END unit test <<<<<<<<<<<<<<<<<<<<<<< "<<std::endl;
}

class TestEval{
public:
	std::string nameInst;
	std::string folder;
	int id;
	bool feasible;
	TestEval(std::string _nameInst,std::string _folder, int _id,bool _feasible){
		nameInst=_nameInst,folder=_folder;id=_id;feasible=_feasible;
	}
	virtual ~TestEval(){}

	friend std::ostream& operator<<(std::ostream& out, const TestEval& f){ //permet d'utiliser cout
		out<<f.id<<"\t"<<f.nameInst<<"\t"<<f.folder<<"\t"<<f.feasible;
		return out;
	}
};

class TestSolve{
public:
	std::string nameInst;
	double cost;
	bool readSolInit;
	TestSolve(std::string _nameInst, bool _readSolInit, double _cost){
		nameInst=_nameInst;readSolInit=_readSolInit;cost=_cost;
	}
	virtual ~TestSolve(){}
};

void Test::testSolve(bool writeFileSol){
	try{
		vector<TestSolve> allSolve={
			TestSolve("INJS_limitedFleet", false, 1030.54),
			TestSolve("IMEAquarelle", false,1363.01),
			TestSolve("M00_80_OT", false, 2053.85),
		};

		for(auto s : allSolve)
		{
			string pathInst="./instance/unitTest/"+s.nameInst+".json";
			string pathParam="./instance/unitTest/"+ s.nameInst+"_param.json";
			string pathSolIn="./instance/unitTest/solve/"+s.nameInst+"_sol_in.json";
			string pathSolOut="./instance/unitTest/solve/"+s.nameInst+"_sol_out.json";

			srand(0);

			Darp darp(path_to_string(pathInst),path_to_string(pathParam));

			if(cst::verbosite>1) darp.displayProblem();

			// load initial solution or not
			if(s.readSolInit){
				darp.loadSolutionJson(path_to_string(pathSolIn));
			}
			else{
				// pathSolOut=pathSolIn; // what is the reason of this line? I comment it meanwhile to make tests run
			}

			//solve and parse
			string solCalc = darp.solve();
			if(cst::verbosite>1) darp.displaySolution();
			json solution = json::parse(solCalc);
			double newPerf=solution.at("cost").get<double>(); // @suppress("Symbol is not resolved") // @suppress("Invalid arguments")
			PPK_ASSERT(newPerf==s.cost, "newPerf %f is diff to reference perf %f", newPerf, s.cost);

			//write solution in file
			if(writeFileSol){
				ofstream myfile;
				myfile.open (pathSolOut);
				myfile << solCalc;
				myfile.close();

				cout<<solution.at("cost").get<double>()<<endl;
			}

			// read known solution
			string solOut=path_to_string(pathSolOut);
			json knownSolution = json::parse(solOut);

			//compares solutions
			double perfKnw=knownSolution.at("cost").get<double>(); // @suppress("Symbol is not resolved") // @suppress("Invalid arguments")
			PPK_ASSERT(newPerf==perfKnw, "newPerf %f is diff to  perfKnow %f", newPerf, perfKnw);

			//		knownSolution["execTime"]=solution["execTime"];
			//
			//		json patch=json::diff(knownSolution,solution);
			//		if(patch.dump()!="[]"){
			//			cout<<solution.dump()<<endl;
			//			cout<<knownSolution.dump()<<endl;
			//			PPK_ASSERT(patch.dump()=="[]",patch.dump(2).c_str());
			//		}
			cout<<"[Test] Ok: Instance " << pathInst<<endl;
		}
	}
	catch (json::exception& msg_error){
		std::cerr<<messageJson("error", msg_error.what()) << std::endl;
		PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
	}catch(const std::exception& msg_error){
		std::cerr<<messageJson("error", msg_error.what()) << std::endl;
		PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
	}
}

void Test::testSolveLong(){
	string nameInst="M00_80";
	string pathInst="./instance/unitTest/"+nameInst+".json";
	string pathParam="./instance/unitTest/"+ nameInst+"_param_long.json";

	Darp darp(path_to_string(pathInst),path_to_string(pathParam));
	srand(0);
	//solve and parse
	string solCalc = darp.solve();
	PPK_ASSERT(darp.getSol()->getPenalizedObjectiveValue()<1765);
}


void Test::testJsonLib(){
	string read=path_to_string("./instance/unitTest/jsonLib.json");
	json jsonRead = json::parse(read);

	json jsonTest;
	jsonTest["test"]="the json library is working";
	json patch=json::diff(jsonRead,jsonTest);
	//cout<<patch.dump()<<endl;
	if(patch.dump()=="[]")
		std::cout<<"[Test] OK : JSON Lib working!"<<std::endl;
	else
		std::cout<<"[Test] FAIL : JSON Lib NOT working!"<<std::endl;

	PPK_ASSERT(patch.dump()=="[]",patch.dump().c_str());
}



void Test::testEval(bool writeFileSol) {
try{
	vector<TestEval> allRoutes={
			TestEval("M00_80","feasible",0,true),
			TestEval("M00_80","feasible",1,true),
			TestEval("M00_80","feasible",2,true),
			TestEval("M00_80","feasible",3,true),
			TestEval("M00_80","infeasible/depot",1,false),
			TestEval("M00_80","infeasible/depot",2,false),
			TestEval("M00_80","infeasible/depot",3,false),
			TestEval("M00_80","infeasible/depot",4,false),
			TestEval("M00_80","infeasible/depot",5,false),
			TestEval("M00_80","infeasible/depot",6,false),
			TestEval("M00_80","infeasible/nodes",7,false),
			TestEval("M00_80","infeasible/nodes",8,false),
			TestEval("M00_80","infeasible/nodes",9,false),
			TestEval("M00_80","infeasible/nodes",10,false),
			TestEval("M00_80","infeasible/nodes",11,false),
			TestEval("M00_80","infeasible/vehicle",12,false),
			TestEval("M00_80","infeasible/scheduling",13,false),
			TestEval("M00_80","infeasible/capacity",14,false),
	};

	string oldInstName="";
	Darp * darp=nullptr;
	for(auto r : allRoutes){
		cout<<r<<endl;
		//read all
		string pathInst="./instance/unitTest/"+ r.nameInst+".json";
		string pathParam="./instance/unitTest/"+ r.nameInst+"_param.json";
		stringstream pathRoutes;
		pathRoutes<<"instance/unitTest/eval/"<<r.folder<<"/"<<r.nameInst<<"_"<<r.id<<".json";
		string str_json_route=path_to_string(pathRoutes.str());
		stringstream pathSolOut;
		pathSolOut<<"instance/unitTest/eval/"<<r.folder<<"/"<<r.nameInst<<"_"<<r.id<<"_sol"<<".json";

		if(r.nameInst!=oldInstName){
			if(darp!=nullptr)delete darp;
			darp=new Darp(path_to_string(pathInst),path_to_string(pathParam));
		}
		//srand(0);
		if(cst::verbosite>1) darp->displayProblem();

		//eval and parse
		string solCalc = darp->eval(str_json_route);
		//cout<<solCalc<<endl;

		if(cst::verbosite>1) darp->displaySolution();
		json solution = json::parse(solCalc);
		bool feasible=solution.at("feasible").get<bool>(); // @suppress("Symbol is not resolved") // @suppress("Invalid arguments")
		PPK_ASSERT(feasible==r.feasible);

		//write solution in file
		if(writeFileSol){
			ofstream myfile;
			myfile.open (pathSolOut.str());
			myfile << solCalc;
			myfile.close();
		}

		// read known solution
		string solOut=path_to_string(pathSolOut.str());
		json knownSolution = json::parse(solOut);

		//compares solutions
		//cout<<solution.dump(2)<<endl;
		double perfKnw=knownSolution.at("cost").get<double>();
		double perfCal=     solution.at("cost").get<double>();
		PPK_ASSERT(perfCal==perfKnw);
		//		json patch=json::diff(knownSolution,solution);
		//		cout<<patch.dump()<<endl;
		//		PPK_ASSERT(patch.dump()=="[]",patch.dump().c_str());


		cout<<"[Test] OK: Route " << pathRoutes.str()<<endl;

		//save the name if the instance
		oldInstName=r.nameInst;

	}
	delete darp;
}
catch (json::exception& msg_error){
	std::cerr<<msg_error.what()<< std::endl;
	PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
}catch(const std::exception& msg_error){
	std::cerr<<msg_error.what() << std::endl;
	PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
}
}


void Test::testEvalSolution() {
try{
	vector<TestEval> allSolve={
			TestEval("M00_80_unfeasibleRideTime","infeasible/scheduling/", -1,false),
			TestEval("M00_80_unfeasibleTW","infeasible/scheduling/", -1, false),
			TestEval("unfeasibleDepotTW","infeasible/depot/", -1, false),
			TestEval("IMEAquarelleUnfeasibleVehicles","infeasible/vehicle/", -1, false)
	};

	for(auto s : allSolve)
	{
		string pathInst="./instance/unitTest/eval/"+s.folder +s.nameInst+".json";
		string pathParam="./instance/unitTest/eval/"+s.folder + s.nameInst+"_param.json";
		string pathSolIn="./instance/unitTest/eval/"+s.nameInst+"_sol_in.json";
		string pathSolOut="./instance/unitTest/eval/"+s.nameInst+"_sol_out.json";

		srand(0);

		Darp darp(path_to_string(pathInst),path_to_string(pathParam));

		if(cst::verbosite>1) darp.displayProblem();


		//solve and parse
		string solCalc = darp.solve();
		if(cst::verbosite>1) darp.displaySolution();
		json solution = json::parse(solCalc);
		auto isFeasible =solution.at("feasible").get<bool>(); // @suppress("Symbol is not resolved") // @suppress("Invalid arguments")
		PPK_ASSERT(isFeasible==s.feasible);

		cout<<"[Test] Ok: eval infeasible instances " << pathInst<<endl;
	}
}
catch (json::exception& msg_error){
	std::cerr<<msg_error.what()<< std::endl;
	PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
}catch(const std::exception& msg_error){
	std::cerr<<msg_error.what() << std::endl;
	PPK_ASSERT(false,messageJson("error","[ERROR] unitary test are not working!"));
}
}



