/*
 * This code is based on the ALNS_Framework library by Renaud Masson
 */
#ifndef OPERATORMANAGER_H_
#define OPERATORMANAGER_H_

#include <vector>

class LNS_SCP_Parameters;
class APreRepairOperator;
class ARepairOperator;
class ADestroyOperator;
class AOperator;
class Statistics;
class Solution;

/*!
 * \class OperatorManager.
 * \brief A simple implementation of an operator manager, that does not allow
 * to simply couple the destroy and repair operators.
 */
class OperatorManager {
private:
	//! The set of repair operators.
	std::vector<AOperator*> repairOperators;

	//! The set of destroy operators.
	std::vector<AOperator*> destroyOperators;

	//! The set of pre repair operators.
	std::vector<AOperator*> preRepairOperators;

	//! The paramaters to be used by the ALNS.
	const LNS_SCP_Parameters* parameters;

	//! Use a roulette wheel to select an operator in a vector of operators.
	//! \return the selected operator.
	AOperator& selectOperator(std::vector<AOperator*>& vecOp);

	//! A pointer to the instance of the statistics module.
	Statistics* stats;

	//! First operator for the first solution
	ARepairOperator * firstOperator;

public:
	//! Constructor
	//! \param param the parameters to be used.
	OperatorManager(const LNS_SCP_Parameters& param);

	//! Destructor.
	virtual ~OperatorManager();

	//! This function recompute the weights of every operator managed by this
	//! manager.
	//void recomputeWeights();

	//! This method selects a destroy operator.
	//! \return a destroy operator.
	ADestroyOperator& selectDestroyOperator();

	//! This method selects a repair operator.
	//! \return a repair operator.
	ARepairOperator& selectRepairOperator();

	//! This method selects a pre repair operator.
	//! \return a pre repair operator.
	APreRepairOperator& selectPreRepairOperator();

	//! This method adds a repair operator to the list
	//! of repair operator managed by this manager.
	//! \param repairOperator the repair operator to be added.
	void addRepairOperator(ARepairOperator * repairOperator);

	//! This method adds a repair operator to the list
	//! of pre repair operator managed by this manager.
	//! \param prerepairOperator the repair operator to be added.
	void addPreRepairOperator(APreRepairOperator * preRepairOperator);

	//! This method adds a destroy operator to the list
	//! of destroy operator managed by this manager.
	//! \param destroyOperator the destroy operator to be added.
	void addDestroyOperator(ADestroyOperator * destroyOperator);

	//! This method allows to increase the area to be destroy
	void increaseDestroyArea(double percent_inc);

	//! update a new solution
	void update(Solution & newSolution);

    //! Simple setter.
	void setStatistics(Statistics* statistics) {
		stats = statistics;
	}

	//! Simple setter.
	void setFirstOperator(ARepairOperator * firstOperator) {
		this->firstOperator = firstOperator;
	}

	ARepairOperator* getFirstOperator() {
		return firstOperator;
	}


};

#endif /* OPERATORMANAGER_H_ */
