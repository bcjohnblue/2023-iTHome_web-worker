self.onmessage = (e) => {
  console.log('self', self.fetch); 
  self.postMessage(e.data);
};
