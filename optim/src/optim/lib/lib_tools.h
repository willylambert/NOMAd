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



#ifndef LIB_TTOOLS_HPP_
#define LIB_TTOOLS_HPP_

#include <string>
#include <vector>
#include <sys/stat.h>



std::string path_to_string(std::string path);

inline bool exists_test_file (const std::string& name) {
  struct stat buffer;
  return (stat (name.c_str(), &buffer) == 0);
}

/**
 * @type  warning (i.e. violation triangular inequality) / error (i.e. wrong data) / internalError (programming error)
 * @message to be printout
 */
const char * messageJson(std::string type, std::string message);

class FormatString {
public:
	FormatString(){}
	virtual ~FormatString(){}

public:
	std::string vector(const std::vector<int> & vec) const ;

	std::string vector(const std::vector<size_t> & vec) const ;

	std::string vector(const std::vector<double> & vec) const ;

};

#endif /* LIB_LIBTTOOLS_HPP_ */
