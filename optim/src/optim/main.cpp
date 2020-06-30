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

#include "unitTests/Test.h"
#include "MPdarp.h"
#include "string"
#include "stdlib.h"
#include "lib/lib_tools.h"
#include "lib/json.hpp"
using json = nlohmann::json;
using namespace darp;



/**
 * Format text strings into json format
 */
const char * msgJson(std::string type, std::string message)  {
	type ="\n<json> {\n \"type\" :\"" + type + "\",\n \"message\" : \"" + message +"\""+ "\n} </json>";
	return type.c_str();
}

/**
 * This method solves a DARP with the following arguments
 * @pathInst  path of the instance file
 * @pathParam path of the parameters file
 * @pathInitialSol (optional) path of a warmstart solution
 * @pathOutput (optional)  path where the final solution is writen
 */
void compute_simple_instance(std::string pathInst, std::string pathParam, std::string pathInitialSol="", std::string pathOutput=""){
	try {

		//srand(0);
		auto instJson=path_to_string(pathInst);
		auto paramJson=path_to_string(pathParam);
		darp::Darp darp(instJson,paramJson);
		if(cst::verbosite>1) darp.displayProblem();

		// initial solution
		if (pathInitialSol!="")
			darp.loadSolutionJson(path_to_string(pathInitialSol));

		//solve
		std::string solCalc = darp.solve(); //std::cout <<

		// odovia
		if(pathOutput!=""){
			std::ofstream myfile;
			myfile.open(pathOutput);
			if(!myfile.is_open())
				throw std::invalid_argument(msgJson("error","file not found in path: " + pathOutput ));
			myfile << solCalc;
			myfile.close();
		}
	}
    catch (json::exception& msg_error){
        std::cerr<<msgJson("error", msg_error.what()) << std::endl;
    }catch(const std::exception& msg_error){
		std::cerr<<msg_error.what()<<std::endl;
	}
}

/**
 * This method solves a DARP with modifications using the following arguments
 * @pathInst  path of the instance file
 * @pathParam path of the parameters file
 * @pathReferenceSol path of the reference solution needed to obtain the service times
 */
void compute_MPDARP_instance(std::string pathInst, std::string pathParam, std::string pathReferenceSol){
	try{
		//srand(0);
		auto instJson=path_to_string(pathInst);
		auto paramJson=path_to_string(pathParam);
		auto refSolJson=path_to_string(pathReferenceSol);
		MPdarp mpdarp(instJson,paramJson,refSolJson);

		//solve
		mpdarp.solve();
	}
    catch (json::exception& msg_error){
        std::cerr<<msgJson("error", msg_error.what()) << std::endl;
    }catch(const std::exception& msg_error){
		std::cerr<<msg_error.what()<<std::endl;
	}
}


/**
 * unit Test for testing messages of wrong file paths
 */
void testExceptionPaths(){
	std::string pathInst="./instance/unitTest/unknown.json";
	std::string pathParam="./instance/unitTest/unknown_param.json";
	std::string pathSolIn="./instance/unitTest/solve/unknownInitialSol.json";
	std::string pathSolOut="";
	compute_simple_instance(pathInst,pathParam,pathSolIn,pathSolOut);
	std::cout<<"[test] OK wrong paths "<<std::endl;
}

/**
 * unit Test for testing messages of corrupted json files
 */
void testExceptionJsonFormat(){
	std::string pathInst="./instance/unitTest/badJson.json";
	std::string pathParam="./instance/unitTest/badJson_param.json";
	std::string pathSolIn="./instance/unitTest/solve/unknown_in.json";
	std::string pathSolOut="";
	compute_simple_instance(pathInst,pathParam,pathSolIn,pathSolOut);
	std::cout<<"[test] OK corrupted json "<<std::endl;
}

/**
 * Create file logs file
 */
void initLogsFile(){
	// save in file
	std::ofstream myfile;
	myfile.open ("logs.json",std::ios_base::trunc);
	myfile << "";
	myfile.close();
}



static double codeVersion=3.2;

int main(int argc, char *argv[]) {
	std::cout<<"Code version :  "<<codeVersion<<std::endl;
	initLogsFile();
	if(argc>1)
	{   // Solve DARP or DARP under variable demand
		std::string pathInstance=argv[1];
		std::string pathParameters=argv[2];
		std::string pathRefSolution=""; // or path initial solution
		if(argc > 3) pathRefSolution=argv[3];
		std::cout<<" Instances:"<<pathInstance<<" \nParameters:"<<pathParameters<<" \nInitialSol:"<<pathRefSolution<<std::endl;
		json param = json::parse(path_to_string(pathParameters));
		if (param.find("MPDARP")!=param.end()){
			std::cout<<"regularity optimization "<<std::endl;
			cst::MPDARP=param.at("MPDARP").get<bool>();
			compute_MPDARP_instance(pathInstance,pathParameters,pathRefSolution);
		}else{
			std::cout<<"cost optimization "<<std::endl;
			compute_simple_instance(pathInstance,pathParameters);
		}
	}
	else
	{    // Exceptions
		testExceptionJsonFormat();
		testExceptionPaths(); // I could not include this test into class Test due to scope problems
	}
	return 0;
}
