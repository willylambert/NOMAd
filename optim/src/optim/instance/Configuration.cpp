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
 
#include "../instance/Configuration.h"

/*
 * Configuration.cpp
 */
Configuration::Configuration() {
	id=0;
	nb_user_type=1;
	v_capacity.resize(1);
}

/*
 * Constructor
 * !i 	id
 * !nb_user_type	number of user types
 */
Configuration::Configuration(size_t _id, size_t _nb_user_type) {
	id=_id;
	nb_user_type=_nb_user_type;
	v_capacity.resize(nb_user_type);
}


Configuration::~Configuration() {
	v_capacity.clear();
}

/*
 * Affichage avec cout<<
 */
std::ostream& operator<<(std::ostream& out, const Configuration& f){
   out <<"cf"<< f.getId()<<"[";
   for (size_t i = 0; i < f.getCapacity().size(); ++i) {
	   out << f.getCapacity()[i];
	   if (i < f.getCapacity().size()-1) out<<",";
   }
   out <<"]";
   return out;
}
