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
 
#ifndef CONFIGURATION_H_
#define CONFIGURATION_H_

#include <vector>
#include <ostream>

/**
 * \class Configuration
 *  \brief manage vehicle configurations
 */
class Configuration {

public:
	Configuration();
	Configuration(size_t _id , size_t _nb_user_type);
	virtual ~Configuration();

private:
	size_t id;
	size_t nb_user_type;
	std::vector<int> v_capacity;		//size : nb_user_type

public:
	size_t getId() const {
		return id;
	}
	size_t getNbUserType() const {
		return nb_user_type;
	}
	const std::vector<int>& getCapacity() const {
		return v_capacity;
	}
	void setCapacity(int type, int capacity) {
		v_capacity[type] = capacity;
	}
	void setCapacity(const std::vector<int>& capacity) {
		v_capacity=capacity;
	}
	void setId(size_t id) {
		this->id = id;
	}

};
	std::ostream& operator<<(std::ostream&, const Configuration&); //permet d'utiliser cout

#endif /* CONFIGURATION_H_ */
