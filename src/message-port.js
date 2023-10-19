// Test Example, include three files: main.html, worker1.js, worker2.js
// We are going to post a message to worker2 through worker1

const w1 = new Worker('/workers/message-port1.js');
const w2 = new Worker('/workers/message-port2.js');

// creat a channel, give the ports to the workers
const channel = new MessageChannel();
w1.postMessage('here is your port', [channel.port1]);
w2.postMessage('here is your port', [channel.port2]);

// listen on w2
// there is a global onmessage, but it's not for workers, it's for communicate between iframes/documents
w2.onmessage = function (e) {
  alert(e.data);
};

// post the message to w1
// let w1 pass the message to w2
w1.postMessage('this message is for worker2');

// worker1.js
var port;

// listen on main.html who created this worker
onmessage = function (e) {
  if (e.data == 'here is your port') {
    port = e.ports[0];
  } else {
    // i am just a messenger, so pass it to w2
    // this port is used to talk to who eles get the other port of the MessageChannel
    port.postMessage('boss wants me(worker1) to tell you: ' + e.data);
  }
};

// worker2.js
var port;

// listen on creator of this worker
onmessage = function (e) {
  if (e.data == 'here is your port') {
    port = e.ports[0];
    // listen on this port, message comming from worker1 will get here
    port.onmessage = function (e) {
      // tell boss that I have got the message from him through worker1
      postMessage('I have got you message, boss. You said: ' + e.data);
    };
  }
};
