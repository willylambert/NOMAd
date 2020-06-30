/*
 * This code is based on the ALNS_Framework library by Renaud Masson
 */
#ifndef PRE_REPAIR_OP_H_
#define PRE_REPAIR_OP_H_

#include <iostream>
#include "AOperator.h"
#include <limits.h>
#include "../../solution/Solution.h"


/*!
 * \class APreRepairOperator.
 * \brief This abstract class represent a Pre Repair Operator, all pre repair operator implementations
 * should inherit from this class.
 * Pre Repair Operators define which itineraries are available for repair
 */
class APreRepairOperator : public AOperator {

public:

	APreRepairOperator(std::string s) : AOperator(s) {}

	virtual ~APreRepairOperator(){}

	virtual void precompute(Solution& sol)=0;

	void reset(Solution& sol){
		for (auto &route: sol.getRoutes()){
			for (auto &r: route->nodes){
				r->available_itineraries=r->getUser()->getItineraries();
			}
		}
	}

};

#endif
