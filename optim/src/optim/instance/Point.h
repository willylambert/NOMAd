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
#ifndef INSTANCE_POINT_H_
#define INSTANCE_POINT_H_

#include <string>

/**
 * \class Point
 * \brief This class models a geographic point which can be associated to several nodes
 */
class Point {
public:
	/**
	 * constructor from json
	 */
	Point(const std::string & str_json, const size_t & _id);

	/**
	 * destructor
	 */
	virtual ~Point(){};


	/**
	 * getters and setters
	 */

	size_t getId() const {
		return id;
	}

	size_t getIdJson() const {
		return id_json;
	}

	const std::string& getName() const {
		return name;
	}

	long getStimeFixe() const {
		return stimeFixe;
	}

	int getCapaUser() const {
		return capa_user;
	}

	int getCapaVehi() const {
		return capa_vehi;
	}

private:
	/**
	 * id of the point ; must correspond to the matrix (time and distance) coordinate
	 */
	size_t id=0;

	/**
	 * id in the json instance
	 */
	size_t id_json=0;

	/**
	 * name
	 */
	std::string name="";

	/**
	 * fixed service time
	 * service time common to all nodes using this point
	 * should be added to the time matrix directly
	 */
	long stimeFixe=0;

	/**
	 * capacity of user for the point
	 * pickuped or delivered
	 */
	int capa_user=0;

	/**
	 * capacity of vehicle for the point (starting from the point)
	 */
	int capa_vehi=0;

};

#endif /* INSTANCE_POINT_H_ */
