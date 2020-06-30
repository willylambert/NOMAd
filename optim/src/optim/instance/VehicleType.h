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
 
#ifndef VEHICLETYPE_H_
#define VEHICLETYPE_H_

#include <ostream>
#include <vector>
#include <bitset>
#include "../instance/Configuration.h"
#include "../lib/json.hpp"
using json = nlohmann::json;


/**
 * \class VehicleType
 * \brief this class corresponds to a vehicle type
 */
class VehicleType {
public:
	VehicleType(nlohmann::json jObj, const size_t & _id){
		from_json(jObj, _id);
	}
	virtual ~VehicleType();

private:
	/**
	 * This methods add a new configurations to the vehicle
	 * @configuration vector with the capacity foreach user type [u_1, u_2,...]
	 */
	void addConfiguration(const std::vector<int>& configuration);

public:

	double getDistanceCost() const {
		return distance_cost;
	}

	double getFixedCost() const {
		return fixed_cost;
	}

	size_t getId() const {
		return id;
	}

	const std::string& getName() const {
		return name;
	}

	double getTimeCost() const {
		return time_cost;
	}

	const Configuration * getConfiguration(const size_t & id) const {
		return v_configuration[id];
	}

	size_t getNbConfigurations() const{
		return v_configuration.size();
	}

	const std::vector<Configuration*>& getConfigurations() const {
		return v_configuration;
	}

	Configuration*& configuration(int i){
		return v_configuration[i];
	}

	std::bitset<64> getBitSet(const std::vector<int>& l) const;
	void generateBitSet();
	void printBitSet();

	/**
	 * @param a load to test
	 * @return -1 when the required position is out of range
	 */
	int getBitSetPosition(const std::vector<int>& a) const;
	bool isDominated (const std::vector<int>& a, const std::vector<int>& b);
	void computeCapacityBounds();

	/**
	 * update vehicle information from json file
	 */
	void from_json(json jvehicle, const size_t & id);

	/**
	 * returns the vehicle information in json format
	 */
	std::string to_json() const{
		return jvehicle;
	}

	size_t getIdJson() const {
		return id_json;
	}

	const std::string& getNbVehicles() const {
		return nbVehicles;
	}

	int getNbVehiclesInt() const {
		return stoi(nbVehicles);
	}

	void setNbVehicles(const std::string& nbVehicles) {
		this->nbVehicles = nbVehicles;
	}

	int getDepotId() const {
		return idDepot;
	}

private:
	//parametres
	size_t id=0;
	size_t id_json=0;

	std::vector<Configuration*> v_configuration;
	double fixed_cost=0;							/*< fixed cost for a vehicle */
	double time_cost=0;
	double distance_cost=0;
	std::string nbVehicles;  							/*< number of vehicles available of *this type */
	int idDepot;  										/*< Each vehicle belongs to a depot with this id. By default idDepot=-1 meaning that it can be use with any depot*/

	std::vector<std::bitset<64> > cap_set;
	std::vector<int> cap_bounds;
	int dim=0; // max(cap_bounds)
	std::string name="";
	std::string jvehicle;

};

std::ostream& operator<<(std::ostream&, const VehicleType&); //permet d'utiliser cout

#endif /* VEHICLETYPE_H_ */
