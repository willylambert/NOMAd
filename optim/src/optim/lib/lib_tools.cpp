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


#include "lib_tools.h"
#include <fstream>
#include <sstream>
#include <stdlib.h>
#include <iostream>
#include "../lib/json.hpp"
#include "ppk_assert.h"

// for convenience
using json = nlohmann::json;

std::string path_to_string(std::string path){
	std::ifstream ifs(path);
	if(!ifs.is_open())
		throw std::invalid_argument(messageJson("error", "file not found in path: " + path));
	std::stringstream buffer;
	buffer << ifs.rdbuf();
	ifs.close();
	return buffer.str();
}

std::string FormatString::vector(const std::vector<int> & vec) const {
	std::stringstream ss;
	ss<<"[";
	for(int val : vec )
		ss<<val<<",";
	ss<<"]";
	return ss.str();
}

std::string FormatString::vector(const std::vector<size_t> & vec) const {
	std::stringstream ss;
	std::string sep="";
	ss<<"[";
	for(size_t val : vec ){
		ss<<sep<<val;
		sep=",";
	}
	ss<<"]";
	return ss.str();
}

std::string FormatString::vector(const std::vector<double> & vec) const {
	std::stringstream ss;
	ss<<"[";
	std::string sep="";
	for(double val : vec ){
		ss<<sep<<val;
		sep=",";
	}
	ss<<"]";
	return ss.str();
}

const char * messageJson(std::string type, std::string message)  {
	// error v2
	std::string msg =  "{ \"message\" : \"" + message +"\"}";
	json jmsg =  json::parse(msg);

	// error v1
	message ="\n<json> {\n \"type\" :\"" + type + "\",\n \"message\" : \"" + message +"\""+ "\n} </json>";

	// open parse
	std::ifstream ifs("logs.json");
	std::stringstream buffer;
	buffer << ifs.rdbuf();
	std::string s = buffer.str();
	ifs.close();

	// append errors
	nlohmann::json j;
	if(s!="")
		j = nlohmann::json::parse(s);
	j[type].push_back(jmsg);

	// save in file
	std::ofstream myfile;
	myfile.open ("logs.json",std::ios_base::trunc);
	myfile << j.dump(2);
	myfile.close();
	return message.c_str();
}


