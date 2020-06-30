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



#ifndef CONSTANT_H_
#define CONSTANT_H_

#include <math.h>
#include "lib/ppk_assert.h"


/**
 * \class constant
 * \brief This class manage constant values of the algorithms
 */
class cst{
public:

	//method to transform double values into size_t
	static long D2L(double dist){
		return (long)ceil(dist*(double)cst::multiplier);
	}

	static double S2Dd(double dist){
		return (dist/(double)cst::multiplier);
	}

	static double L2D(long dist){
		return ((double)dist/(double)cst::multiplier);
	}

	/**
	 * read json string and set constants
	 * @param paramJson json string well formated, see folder unit_test for exemple
	 */
	static void fromJson(const std::string & paramJson);

	static long multiplier; 			/**< set the coeficient to convert and trunc float to long */

	//non constant

	static bool capacity_on_points;    /**< set whether or not the capacity is limited on points */

	static bool maxNbReconfigurations;  /**< Activates a constraint limiting the number of reconfigurations allowed in route */
	static double alpha;
	static bool pool;					/**< create a pool of routes and save it in the final solutions*/
	static bool python;					/**< solves the set covering problem using the python interface MIP*/
	static bool minConsistency;			/**< min consistency */

	static bool displayTitle;    		/**< write in console the name of the instance */

	//Temporal
	static bool allOperators;
	static bool allPreOperators;

	static std::string pathInst;   		/**<  useful to identify the instance used,  once it is solved*/
	static std::string pathVehicle;   	/**<  useful to identify the instance used,  once it is solved*/

	static bool checkAll;  				/**< Activates a solution checher for every iteration*/
	static int verbosite;  				/**< printout in console current results ; 0 : no output; 1 : standard output : 2 debug */
	static bool checkerAbort; 			/**< abort if the checker return false */
	static bool checkFinal; 			/**< check the final solution */

	const static bool tightenTW =false;  /**< agir sur l'instance pour reduire les timeWindows. */
	static bool GDARP_instance;			/**< true is the objective function should take into account the RT with coef alpha */
	static bool MPDARP;					/**< true : the period is considered */


	//constants MPDARP
	static long deltaIrreg; 			/**<  time consistency is respected within  [time +/- deltaIrreg]*/

	//constants
	const static int  maxNbUserType=5;			/**< maximum number of user type ; usefull to initialize depot loads to 0*/
	const static bool checkInstance=true;  		/**< verifies instance coherence and tringular inequality*/
	const static bool displaySol= false; 		/**< prints out routes and cost in console */
	const static bool fullStats= true;  		/**< This option collect information aboutoperators and solutions in every iteration, the it save it in ouput file*/

	static bool clusterRemoval; 		/**< true : recompute the performance after removing all the requests*/

	static std::string path_stop_file;			/**< if the file exists the algorithm is stopped.
													 if the path is "" this criteria is disabled */
	const static bool remove_stopping_file=true; /**< the file is deleted automatically after stopping */

	static std::string path_export_best_sol;	/**< the path to export each best known solution founded */
	static std::string path_final_results;
	static std::string path_refSol;
	const static int timeMinWithoutExport = 0; /**< number of seconds without export of the best solution */

	static double round(double x)
	{
		double f, xi, xf;
		xf = modf(x,&xi); // @suppress("Invalid arguments")
		f = floor(xf*100+0.5)/100.0; // @suppress("Invalid arguments")
		return xi + f;
	}

	static std::string toString();
};


#endif /* CONSTANT_H_ */
