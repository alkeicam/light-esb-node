A simple and lightweight ESB message processing engine for Node
=======

## Why?
Because complex processing logic including call to third party systems in Node SHOULD be easy

## Installation
```
npm install light-esb-node
```


## Usage
To use, simply create components, wire them up and start sending messages to be processed.

#### Core concepts
Message - Javascript object that is being processed by Components
Component - atomic service that takes Message as input, processes the Message and returns resulting (usually modified) message as result
Flow - chain of Components fulfilling processing of some integration/orchestration logic (transform data, call third party services)


#### Create a component
```js
var ESB = require('light-esb-node');

// this will be invoked either when there is an error during component processing or when the ResultComponent is reached
function esbCallback(error,message){
  if(error){
    console.log("ERROR received:", error, message);
  }else{
    console.log("RESULT received:", message);
  }
  
}

var component = ESB.createLoggerComponent(esbCallback);
```

#### Wire up components (component might wire more then one destination)
```js
var component = ESB.createLoggerComponent(esbCallback);
var receiver1 = ESB.createLoggerComponent(esbCallback);
var receiver2 = ESB.createLoggerComponent(esbCallback);

// when component finishes processing the message the result will be passed by to the receiver1 component and receiver2 component for further processing
component.connect(receiver1);
component.connect(receiver2);
```

#### Initiate processing - sending input message to the flow
```js
var component = ESB.createLoggerComponent(esbCallback);

// prepare input message and start processing 
var ESBMessage = ESB.createMessage({hello: "world"},"john@doe.com","CRM","x92938XA");
component.send(ESBMessage);
```

#### Store message payload for further processing
```js
// the message object from now on will be enhanced with the new entry in the vars section (vars.customerData) of the ESBMessage
var component = ESB.createVarComponent("customerData",'SET');
```

#### Restore message payload for processing
```js
// from now on, the payload of the ESBMessage that will be processed by next component in the flow will be replaced with contents of the vars.customerData object
var component = ESB.createVarComponent("customerData",'GET');
```

#### Merge data from vars storage with payload of the currently processed message
```js
// now some merging of messages, contents of vars.customerInfo will be merged into processed message payload 
var component = ESB.createCombineComponent("customerInfo");
```

#### Call external HTTP services (POST, GET)
```js
// now it is time for some third party calls, call external REST service
var component1 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/users", "get");
var component2 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/posts", "post");
```

#### Return results - at the end of the processing flow
```js
// at the end of the flow return resulting message - esbCallback function will receive the resulting message object 
var component = ESB.createResultComponent(esbCallback);  
```
## Sample
For a sample flow check samples folder.

## Debugging/Console Out

#### Using Node environment variables (plays nicely with the hugely popular [debug](https://www.npmjs.com/package/debug) module)
```
// Set the DEBUG environment variable to enable debug output of Light-Esb-Node

// show components initialization
//process.env.DEBUG = 'esb:core, esb:component';

// show components processing messages
//process.env.DEBUG = 'esb:messages';

// show details of remote calls of components
//process.env.DEBUG = 'esb:calls';

// show all
process.env.DEBUG = 'esb:*';
```

### Changelog
- **v1.0.0** - initial version