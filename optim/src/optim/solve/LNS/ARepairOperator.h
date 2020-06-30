/*
 * This code is based on the ALNS_Framework library by Renaud Masson
 */
#ifndef AREPAIROPERATOR_H_
#define AREPAIROPERATOR_H_
#include <iostream>
#include "AOperator.h"
#include <limits.h>

class Solution;

/*!
 * \class ARepairOperator.
 * \brief This abstract class represent a Repair Operator, all repair operator implementations
 * should inherit from this class.
 */


class ARepairOperator : public AOperator {

public:
	ARepairOperator(std::string s) : AOperator(s) {}

	virtual ~ARepairOperator(){};

	virtual void repairSolution(Solution& sol)=0;

};

#endif /* AREPAIROPERATOR_H_ */
