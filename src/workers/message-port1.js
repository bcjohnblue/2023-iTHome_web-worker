let port1;

const init = (port) => {
  port1 = port;
  port1.onmessage = (e) => {
    console.log('port1 onmessage', e.data);
  };
  port1.postMessage('port1');
};

const sendMessage = (payload) => {
  port1.postMessage(payload);
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
