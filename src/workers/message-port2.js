let port2;

const init = (port) => {
  port2 = port;
  port2.onmessage = (e) => {
    console.log('port2 onmessage', e.data);
  };
  port2.postMessage('port2');
};

const sendMessage = (payload) => {
  port2.postMessage(payload);
};

self.onmessage = (e) => {
  const { type, payload } = e.data;
  const port = e.ports[0];

  switch (type) {
    case 'INIT':
      init(port);
      break;
    default:
      sendMessage(payload);
      break;
  }
};
