let count = 0;
const ports = [];

const postMessageToAllPorts = (data) => {
  ports.forEach((port) => {
    port.postMessage(data);
  });
};

// onconnect = (e) => {
//   console.log(e.ports);

//   const port = e.ports[0];
//   ports.push(port);
//   postMessageToAllPorts(count);

//   port.onmessage = (e) => {
//     console.log('message', e.data);
//     count += e.data;
//     postMessageToAllPorts(count);
//   };

//   // port.addEventListener('message', (e) => {
//   //   console.log('message', e.data);
//   //   count += e.data;
//   //   postMessageToAllPorts(count);
//   // });

//   // port.start();
// };

self.addEventListener('connect', (e) => {
  console.log(e.ports);

  const port = e.ports[0];
  ports.push(port);
  postMessageToAllPorts(count);

  port.onmessage = (e) => {
    console.log('message', e.data);
    count += e.data;
    postMessageToAllPorts(count);
  };

  // port.addEventListener('message', (e) => {
  //   console.log('message', e.data);
  //   count += e.data;
  //   postMessageToAllPorts(count);
  // });
});
