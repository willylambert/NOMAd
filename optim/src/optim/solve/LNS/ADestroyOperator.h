/*
 * This code is based on the ALNS_Framework library by Renaud Masson
 */
#ifndef ADESTROYOPERATOR_H_
#define ADESTROYOPERATOR_H_

#include "AOperator.h"
#include "cmath"

class Solution;

/*!
 * \class ADestroyOperator.
 * \brief This is an abstract class used to represent Destroy Operators.
 *
 * Any destroy operator should inherit from this class and implement the
 * destroySolution function.
 */
#include <limits.h>

class ADestroyOperator : public AOperator {

public:
	//! The minimum destroy size used. doit etre >0 !!!
	double minimunDestroyFrac;
	//! The maximum destroy size used.
	double maximumDestroyFrac;

public:
	//! Constructor.
	//! \param mini_percent the minimum percentage destroy size.
	//! \param maxi_percent the maximum percentage destroy size.
	//! \param s the name of the destroy operator.
	ADestroyOperator(std::string s, double mini_percent=0, double maxi_percent=UINT_MAX) : AOperator(s)
	{
		minimunDestroyFrac = mini_percent;
		maximumDestroyFrac = maxi_percent;
	}

	//! Destructor.
	virtual ~ADestroyOperator(){};

	//! This function is the one called to destroy a solution.
	//! \param sol the solution to be destroyed.
	virtual void destroySolution(Solution& sol)=0;


	double getMaximumDestroyFrac() const {
		return maximumDestroyFrac;
	}

	void setMaximumDestroyFrac(double maximumDestroy_percent) {
		this->maximumDestroyFrac = maximumDestroy_percent;
	}

	double getMinimunDestroyFrac() const {
		return minimunDestroyFrac;
	}

	void setMinimunDestroyFrac(double minimunDestroy_percent) {
		this->minimunDestroyFrac = minimunDestroy_percent;
	}

	int getNbRemoval(const int & nbRequest){
		if(nbRequest==0) return 0;
		int mini=(int) std::max(1.0,nbRequest*minimunDestroyFrac);
		int maxi=(int) std::max(1.0,nbRequest*maximumDestroyFrac);
		return ( mini+rand()%(1+std::min(maxi - mini, nbRequest)) );	 // max number of request to destroy
	}

};

#endif /* DESTROYOPERATOR_H_ */
