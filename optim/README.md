# README #

## Nomad project

This code has been written for Nomad project 
https://nomad.disp-lab.fr

The Nomad project is founded by European Union with the 
European Regional Development Fund (ERDF) 
in Auvergne-Rhône-Alpes (France) 


## What is this repository for? ##

* Quick summary

Solve the Fleet Size and Mix Dial a Ride Problem (FSM-DARP) 

* Version 0.1

* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

## How do I run make files ? ##

### Compile

cd ~/Documents/nomadworkspace/odovia/src/optim 
./build.sh 

## Run

cd ~/Documents/nomadworkspace/odovia
./src/optim/taxi_share_algo

### Configuration ###

a lot a cofee...

This is a full flag configuration to work with Cplex and Python-MIP interfaces

Compiler:

* g++ -std=c++0x -DIL_STD -DPYTHON -I/usr/include -I/home/**user**/anaconda3/include/python3.7m -I/opt/ibm/ILOG/CPLEX_Studio128/concert/include -I/opt/ibm/ILOG/CPLEX_Studio128/cplex/include -I/usr/include/coin -O3 -g -pedantic -Wall -Wconversion -c -fmessage-length=0

Linker:

* g++ -L/home/**user**/anaconda3/lib -L/home/**user**/anaconda3/lib/python3.7/config-3.7m-x86_64-linux-gnu -L/usr/include -L/opt/ibm/ILOG/CPLEX_Studio1263/concert/lib/x86-64_linux/static_pic -L/usr/lib/x86_64-linux-gnu -L/opt/ibm/ILOG/CPLEX_Studio1263/cplex/lib/x86-64_linux/static_pic -lpython3.7m -lpthread -ldl  -lutil -lrt -lm  -Xlinker -export-dynamic  -Wl,-R/home/**user**/anaconda3/lib/



### Dependencies ### 

**Option 1**: LNS
- C++

**Option 2**: LNS + Cplex solver
- C++
- Cplex solver
- Flags for compiler and linker
- Preprocessing :  -DIL_STD

**Option 3**: LNS + CBC solver
- Python 3.5 or newer
- Python package [MIP](https://github.com/coin-or/python-mip), inside this package you normally find CBC too
- Flags for compiler and linker
- Preprocessing :  -DPYTHON

**Documentation** 
- doxygen : https://www.stack.nl/~dimitri/doxygen/


## How to run tests ##

TODO

## How to generate documentation ##

> doxygen doxygen.Doxyfile

## Bibliography

https://hal.archives-ouvertes.fr/hal-01619103/
