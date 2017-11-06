'use strict';
/**************************************************************************************************
 * This sample demonstrates features of Light-Esb-Node module,
 **************************************************************************************************/

// Set the DEBUG environment variable to enable debug output of Light-Esb-Node

// show components initialization
//process.env.DEBUG = 'esb:core, esb:component';

// show components processing messages
//process.env.DEBUG = 'esb:messages';

// show details of remote calls of components
//process.env.DEBUG = 'esb:calls';

// show all
process.env.DEBUG = 'esb:*';

var ESB = require('../');

// this will be invoked either when there is an error during component processing or when the ResultComponent is reached
function esbCallback(error,message){
  if(error){
    console.log("ERROR received:", error, message);
  }else{
    console.log("RESULT received:", message);
  }
  
}

// create different types of components, some having callback for eventuall error handling, some no
var c1 = ESB.createLoggerComponent(esbCallback);
var c2 = ESB.createLoggerComponent(esbCallback);
// this component will hold message processing for 5 seconds (it does not stop node js processing - other components can operate during the sleep time)
var c3 = ESB.createSleepComponent(5000);
var c4 = ESB.createLoggerComponent(esbCallback);
// the message object from now on will be enhanced with the new entry in the vars section of the ESBMessage
var c9 = ESB.createVarComponent("customerData",'SET');
// the message that reaches this component will be altered by mapping provided - see object-mapper npm module documentation for details how to build maps
var c5 = ESB.createMapperComponent({"hello":["XYZ.hello","ZZZ.hello"]});
var c6 = ESB.createLoggerComponent(esbCallback);
var c7 = ESB.createVarComponent("customerInfo",'SET');
var c8 = ESB.createLoggerComponent(esbCallback);
// from now on, the payload of the ESBMessage that will be processed will be replaced with contents of the vars.customerData object
var c10 = ESB.createVarComponent("customerData",'GET');
var c11 = ESB.createLoggerComponent(esbCallback);
// now some merging of messages, contents of vars.customerInfo will be merged into processed message contents 
var c12 = ESB.createCombineComponent("customerInfo");
var c13 = ESB.createLoggerComponent(esbCallback);
// now it is time for some third party calls, call external REST service
var c14 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/users", "get");
var c15 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/posts", "post");
// at the end of the flow return resulting message 
var c16 = ESB.createResultComponent(esbCallback);  

// wire up processing flow
c1.connect(c2);
c2.connect(c3);  
c2.connect(c4); 
c3.connect(c9);
c9.connect(c5);
c5.connect(c6);
c6.connect(c7);
c7.connect(c8);
c8.connect(c10);
c10.connect(c11);
c11.connect(c12);  
c12.connect(c14);
c14.connect(c15);
c15.connect(c13);
c13.connect(c16);


// prepare input message and start processing 
var message = ESB.createMessage({hello: "world"},"john@doe.com","CRM","x92938XA");
c1.send(message);
