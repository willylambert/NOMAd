/**
 *
The Original Code is the ALNS_Framework library by Renaud Masson

This code is delivered as Part of the NOMAd Projet

This software is free: you can redistribute it and/or modify
it under the terms of the GNU General Public License V3 as published by
the Free Software Foundation <www.gnu.org>. It is distributed in the hope
that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

For detailed information about this code please contact major contributors :
Oscar A. Tellez S. oscar.tellez@nomad-opt.com
Samuel Vercraene  samuel.vercraene@insa-lyon.fr
*
**/

#ifndef STATISTICS_H_
#define STATISTICS_H_

#include <vector>
#include <time.h>
#include <sstream>
#include <iostream>
#include <fstream>

/**
 * \class Statistics
 * \brief This class manage the solver statistics
 */


class StatEntry {

public:
	double timeStamp;
	size_t iteration;
	std::string destroyName;
	std::string recreateName;
	double newCost;
	double newIreg;
	double newObjV;
	double currentObjV;
	double bestObjV;
	int cumulativeKnownSolution;
	bool acceptedAsCurrentSolution;
	bool newBestSolution;
	bool alreadyKnownSolution;
	size_t nbNewBestSolSCP;
	size_t nbNewCurrSolSCP;
	size_t nbSizePool;
	size_t nbOptSolSCP;

	/**
	 * constructor / destructor
	 */
	StatEntry(double _timeStamp,
				size_t _iteration,
				std::string _destroyName,
				std::string _recreateName,
				double _newCost,
				double _newIreg,
				double _nexObjV,
				double _currentObjV,
				double _bestObjV,
				int _cumulativeKnownSolution,
				bool _acceptedAsCurrentSolution,
				bool _newBestSolution,
				bool _alreadyKnownSolution,
				size_t _nbNewBestSolSCP,
				size_t _nbNewCurrSolSCP,
				size_t _nbSizePool,
				size_t _nbOptSolSCP){
		timeStamp=_timeStamp;
		iteration=_iteration;
		destroyName=_destroyName;
		recreateName=_recreateName;
		newCost=_newCost;
		newIreg= _newIreg;
		newObjV= _nexObjV;
		currentObjV= _currentObjV;
		bestObjV= _bestObjV;
		cumulativeKnownSolution=_cumulativeKnownSolution;
		acceptedAsCurrentSolution=_acceptedAsCurrentSolution;
		newBestSolution=_newBestSolution;
		alreadyKnownSolution=_alreadyKnownSolution;
		nbNewBestSolSCP=_nbNewBestSolSCP;
		nbNewCurrSolSCP=_nbNewCurrSolSCP;
		nbSizePool=_nbSizePool;
		nbOptSolSCP=_nbOptSolSCP;
	}

	virtual ~StatEntry(){}

	/**
	 * toString to be printed
	 */
	std::string toString(){
		std::stringstream ss;
		ss << iteration << "\t"
			<< timeStamp << "\t"
			<< destroyName << "\t"
			<< recreateName << "\t"
			<< newCost << "\t"
			<< newIreg << "\t"
			<< newObjV << "\t"
			<< currentObjV << "\t"
			<< bestObjV << "\t"
			<< cumulativeKnownSolution<<"\t"
			<< acceptedAsCurrentSolution<<"\t"
			<< newBestSolution<<"\t"
			<< nbNewBestSolSCP<<"\t"
			<< nbNewCurrSolSCP<<"\t"
			<< nbSizePool<<"\t"
			<< nbOptSolSCP<<"\t";
		return ss.str();
	}

	std::string shortToString(bool feasible=true){
			std::stringstream ss;
			ss << "it:"<< iteration << "\t"
				<<"cost:"<< newCost << "\t"
				<<"ireg:"<< newIreg << "\t"
				<<"objV:"<< newObjV << "\t"
				<<"BobjV:"<< bestObjV << "\t"
				<<"Time:"<< timeStamp << "\t"
				<<"Feasible:"<< feasible << "\t";
			return ss.str();
	}

	/**
	 * get title
	 */
	std::string getTitle(){
		return "iters\t"
				"timeStamps\t"
				"Destroy\t"
				"Repair\t"
				"NewCost\t"
				"newIreg\t"
				"nexObjV\t"
				"currentObjV\t"
				"bestObjV\t"
				"CumKnownSols\t"
				"NB_CurrSol\t"
				"NB_NewSol\t"
				"cnbNewBestSCP\t"
				"CnbNewCurrSCP\t"
				"CnbsizePool\t"
				"CnbOptSolSCP";
	}
};


class Statistics {
public:
	//! Constructor.
	Statistics(std::string _name,std::string _path){
		name=_name;
		path=_path;
		start = clock();
		end = clock();
	}

	//! Destructor.
	virtual ~Statistics(){
		for(auto * entr : statEntries) delete entr;
	}

	//! This method adds an entry to the data
	void addEntry(StatEntry * statEntry, std::string _path=""){
		statEntries.push_back(statEntry);
		end = clock();
		if(_path!="") writeLast();
	}

	//!this files hold general information for different instances
	void writeLast(std::string _path=""){
		std::ofstream ofs;
		ofs.open((_path).c_str(), std::ofstream::out | std::ofstream::app);
		ofs <<name<<"\t"<<statEntries.back()->toString()<<std::endl;
		ofs.close();
	}

	//! this is the start
	void setStart(){start = clock();};

	StatEntry * getLastEntry(){
		return statEntries.back();
	}

private:

	/**
	 * name
	 */
	std::string name;

	/**
	 * begining and end times
	 */
	clock_t start;
	clock_t end;

	/**
	 * path to write the detail of the resolution
	 */
	std::string path;

	/**
	 * list of logs
	 */
	std::vector<StatEntry*> statEntries;

};

#endif /* STATISTICS_H_ */
