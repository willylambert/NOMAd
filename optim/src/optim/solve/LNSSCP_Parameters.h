/*
The Original Code is the ALNS_Framework library.
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
**/


#ifndef ALNS_PARAMETERS_H_
#define ALNS_PARAMETERS_H_

#include <assert.h>
#include <cstring>
#include <iostream>
#include <vector>

/*!
 * \class ALNS_Parameters.
 * \brief This class contains parameters to be used by the ALNS.
 *
 */

class LNS_SCP_Parameters
{

public:

	//! Constructor.
	LNS_SCP_Parameters(const std::string & paramJson);

	//! Destructor.
	~LNS_SCP_Parameters();

	//! This method transform the object into string
	std::string toString(); //std::string path);


    int getLogFrequency() const
    {
        return displayLogFrequency;
    }

    size_t getMaxNbIterations() const
    {
        return maxNbIterations;
    }

    double getMaxRunningTime() const
    {
        return maxRunningTime;
    }

	const std::string& getPath() const {
		return PATH;
	}

	size_t getMaxNbIterationSetCovering() const {
		return maxNbIterationSetCovering;
	}

	void setMaxNbIterationSetCovering(size_t maxNbIterationSetCovering) {
		this->maxNbIterationSetCovering = maxNbIterationSetCovering;
	}

	double getAcceptanceProbability() const {
		return probabilityAcceptance;
	}

	double getTimeLimitSCP() const {
		return timeLimitSCP;
	}

	double getFrecRateScp() const {
		return frecRateSCP;
	}

	double getToleranceRegularity() const {
		return toleranceRegularity;
	}


private:
	//! Maximum number of iterations performed by the ALNS.
	size_t maxNbIterations;

	//! Maximum running time of the ALNS.
	double maxRunningTime;

	size_t maxNbIterationSetCovering;

	//! Acceptance probability record to record criterion
	double probabilityAcceptance;

	//! Resoluton time limit for the solver
	double timeLimitSCP;

	//! Frequency rate used to reduce the nbIteratios required the call the SCP
	double frecRateSCP;

	//! regularity tolerance value
	double toleranceRegularity;

protected:

	//! Indicate every each iteration logging is done.
	int displayLogFrequency;

	//! The minimum percentage of the solution destroyed by the destroy operators.
	int minDestroyPerc;

	//! The maximum percentage of the solution destroyed by the destroy operators.
	int maxDestroyPerc;

	// Path
	std::string PATH;

};


#endif /* ALNS_PARAMETERS_H_ */
