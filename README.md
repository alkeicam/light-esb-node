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
* Message - Javascript object that is being processed by Components
* Component - atomic service that takes Message as input, processes the Message and returns resulting (usually modified) message as result
* Flow - chain of Components fulfilling processing of some integration/orchestration logic (transform data, call third party services)


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

#### ESBMessage structure
```js
/**
 * Represents a ESB Message being processed by components.
 *
 * @param   {object}    payload  - The payload of the message
 * @param   {string}    callerUser  - the entity that originated the message
 * @param   {string}    callerSystem  - the system that originated the message
 * @param   {string}    callerCorrelationId  - the correlationId in case that this message is a result of some other message processing (correlation chain)
 * @type {function}
 */
var ESBMessage = function(payload, callerUser, callerSystem, callerCorrelationId){
    this.payload = payload;
    this.context = {
        createdTimestamp: Date.now(),
        correlationId: uuidGenerator.v4(),
        caller: {
            user: callerUser,
            system: callerSystem,
            correlationId: callerCorrelationId
        }
    };
    this.originalPayload = clone(payload);
    this.vars = {};
}
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

#### Set payload to a custom object
```js
// message payload will be replaced with the provided object, one may use reference to the original message fields using '$' notion
var c21 = ESB.createPayloadComponent(esbCallback, {
  "f1":"f1val",
  "f2obj": {
    "f3":"$message.context.correlationId",
    "f4":"f4val"
  }
});
```

#### Merge data from vars storage with payload of the currently processed message
```js
// now some merging of messages, contents of vars.customerInfo will be merged into processed message payload
var component = ESB.createCombineComponent("customerInfo");
```

#### Transform payload
```js
// the message that reaches this component will be altered by mapping provided - see object-mapper npm module documentation for details how to build maps
var component = ESB.createMapperComponent({"hello":["XYZ.hello","ZZZ.hello"]});
```

#### Call external HTTP services (POST, GET)
```js
// now it is time for some third party calls, call external REST service
var component1 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/users", "get");
var component2 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/posts", "post");
// DELETE call example
var c22 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/post/${postId}", "delete", {"postId":120});

// full call using path parameter (${postId}), dynamic query params (?param1=) - using '$' reference to message contents and basic auth
var c20 = ESB.createCallComponent(esbCallback, "https://jsonplaceholder.typicode.com/post/${postId}", "post",{"postId":120},{"param1":"$message.context.correlationId"},"username","pass");
```

#### Content based routing - redirect messages to the appropriate channel based on message contents
```js
// route component - based on ESBMessage.context field values the message will be routed to the appropriate named channel
var c17 = ESB.createRouteComponent(esbCallback, {
	routeItems: [
		{
			routeFunction: function(esbMessage){
				if(esbMessage.context.caller.user=="john@doe.com")
					return true;
				return false;
			},
			channel: "john"
		},
		{
			routeFunction: function(esbMessage){
				if(esbMessage.context.caller.user=="marry@doe.com")
					return true;
				return false;
			},
			channel: "marry"
		}
	]
});  


// for router component connected components MUST be connected using channel names
c17.connect("john",c19);
c17.connect("marry",c18);
```

#### Freestyle - component that accepts any custom processing script
```js
// script component with custom processing function
var c19 = ESB.createScriptComponent(esbCallback, function(esbMessage, callback){
	if(esbMessage.context.caller.user=="john@doe.com"){
		esbMessage.payload[0].additionalField = true;
		esbMessage.context.caller.user = "johnthegreat@doe.com"
	}
});
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
- **v1.2.4** - fixed Basic Auth problem
- **v1.2.3** - added DELETE support in CallComponent
- **v1.2.2** - added PayloadComponent and support for dynamic parameters in CallComponent
- **v1.0.2** - added Route and Script components
- **v1.0.0** - initial version
