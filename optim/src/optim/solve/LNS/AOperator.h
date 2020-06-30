/*
 * This code is based on the ALNS_Framework library by Renaud Masson
 */
#ifndef AOPERATOR_H_
#define AOPERATOR_H_

#include <iostream>

class Solution;

/*!
 * \class AOperator.
 * \brief This abstract class represent an operator, Destroy and Repair Operators inherit
 * from this class.
 *
 *
 */
class AOperator
{
private:

	//! designation of the operator.
	std::string operatorName;

public:

	//! Constructor.
	AOperator(std::string name){
		operatorName = name;
	}

	//! Update parameters of the operator after each iteration
	virtual void update(Solution &){};

	//! Destructor.
	virtual ~AOperator(){};

    //! Simple getter.
    std::string getName(){return operatorName;};

};


#endif /* AOPERATOR_H_ */
