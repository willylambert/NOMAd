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

#ifndef MPDARP_H_
#define MPDARP_H_

#include <limits>
#include <string>
#include <vector>
#include "Darp.h"
#include "lib/ppk_assert.h"

namespace darp {

/**
 * \class Multi-period Dial a Ride Problem MPDARP
 * \brief class to manage and solve Multi-period Dial a Ride Problem
 */
class MPdarp {
public:
	/**
	 * constructor for solving DARP with modifications
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * @param instJson Instance
	 * @param paramJson Parameters
	 */
	MPdarp(const std::string & instJson, const std::string & paramJson);

	/**
	 * constructor for solving DARP with modifications
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * @param instJson Instance
	 * @param paramJson Parameters
	 * @param refSolution Reference solution for regularity objective
	 */
	MPdarp(const std::string & instJson, const std::string & paramJson, const std::string& refSolution);

	/**
	 * constructor
	 * read a problem well formulated in json
	 * (see "./instance/unitTest/X.json" for the format of the json)
	 * @param instJson Instance
	 * @param paramJson Parameters
	 * @param paramJson string with parameters in json format (this is needed to update global parameters)
	 */
	MPdarp(const Instance * inst, LNS_SCP_Parameters * param, const std::string& paramJson);

	/**
	 * destructor
	 */
	virtual ~MPdarp();

	/**
	 * Read a given solution in json format
	 */
	void readSolution(int period, std::string path);

	/**
	 * Find a perfectly consistent solution
	 */
	void solve();


	Darp* getDARP(size_t period){
		PPK_ASSERT(period<=darps.size()-1);
		return darps[period];}

	void setDeleteAll(bool deleteAll = false) {
		this->deleteAll = deleteAll;
	}

private:
	void loadProblemJson(const Instance * _instance, LNS_SCP_Parameters * _alnsParam,const  std::string& paramJson);

	const Instance* instance = nullptr;         /**< instance of the DARP */
	LNS_SCP_Parameters* alnsParam = nullptr;   /**< parameters for the resolution */
	std::vector<Darp *> darps;
	double step=0;
	double alpha=0;
	double phi=0;
	/**
	 * delete instance and alnsPAram at the end
	 */
	bool deleteAll=false;
};

} /* namespace darp */

#endif /* MPDARP_H_ */
