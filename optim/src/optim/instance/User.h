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
 
#ifndef INSTANCE_USER_H_
#define INSTANCE_USER_H_

#include <string>
#include "Itinerary.h"

/**
 * \class User
 * \brief This class models one user to be transported
 */
class User {

public:
    User(){};

    /*
     * Constructeur from json
     */
    User(const std::string & str_json, const size_t & id);

	/**
	 * read a solution from a well formulated json string
	 * @param str_json well formulated json solution string
	 */
	void from_json(const std::string & str_json, const size_t & id);

	/**
	 * serialize the current object to json
	 */
	std::string to_json();

	/**
	 * destructeur
	 */
	~User();

	/**
	 * getters and setters
	 */

	size_t getId() const {
		return id;
	}

	size_t getIdJson() const {
		return id_json;
	}

	Itinerary* it(const size_t & pos) const {
		return itineraries[pos];
	}

	int l(const size_t & pos) const {
		return load[pos];
	}

	int getSumLoad() const{
		int i=0;
		for(int lo : load)
			i+=lo;
		return i;
	}

	const std::string& getName() const {
		return name;
	}

	const std::vector<Itinerary*>& getItineraries() const {
		return itineraries;
	}

	const std::vector<int>& getLoad() const {
		return load;
	}

	friend std::ostream& operator<<(std::ostream&, const User&); //permet d'utiliser cout

	const std::vector<int>& getDemands() const {
		return demands;
	}

	bool hasDemand(int & periodId) const{
		if(demands[periodId]!=0) return true;
		return false;
	}

protected:

	size_t id=0;							//< identifiant
	size_t id_json=0;
    std::string name=""; 					//< name
	std::vector<Itinerary *> itineraries;   //< itineraries available for request
    std::vector<int> load;					//< loading in or out (size: nb_user_type) ; should be positive values

	/**
	 * vector of demands
	 */
	std::vector<int> demands;


};

#endif /* INSTANCE_USER_H_ */
