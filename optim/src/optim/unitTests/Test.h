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

#ifndef TEST_H_
#define TEST_H_

#include "../solution/Solution.h"
#include <iostream>
#include <string>
#include <vector>

/**
 * \class Test
 * \brief This class unit test
 */
class Test {
public:

	Test(bool extensive=false);

	virtual ~Test(){};

	/**
	 * unit test
	 * compute problem
	 * @param nameInst file ./instance/unitTest/[nameInst].json
	 * @return true if the test is ok
	 */
	void testSolve(bool writeFileSol=false);

	/**
	 * solve the M80 with 3000 iterations
	 */
	void testSolveLong();

	/**
	 * test the routes
	 */
	void testEval(bool writeFileSol=false);
	void testEvalSolution();

	/**
	 * Print a simple "OK it works!" to test the shared library
	 */
	void testSharedLib(){std::cout<<"[Test] Ok : Shared library "<<std::endl;}


	/**
	 * Json library is worling
	 */
	void testJsonLib();


private:
	int verbosite=3;
};

#endif /* TEST_H_ */
