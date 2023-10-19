const res = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
// const [s1, s2] = res.body.tee();
await res.body.json();

await res.json();
// const reader = res.body.getReader();
// const json = await toBuffer(res.body);
// const reader1 = res.body.pipeThrough(new TextDecoderStream()).getReader();
// const rawJson = await toBuffer(reader);
// const json = JSON.parse(rawJson.join(''));
// const json = await toJSON2(reader);

// console.log('json', json);

async function toBuffer(reader) {
  // const reader = body.getReader();

  const chunk = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    chunk.push(value);
  }

  console.log('Response fully received', chunk);
  return chunk;
}

// let bytesReceived = 0;

// const processData = (result) => {
//   if (result.done) {
//     console.log(`complete, total size: ${bytesReceived}`);
//     return;
//   }
//   const value = result.value; // Uint8Array
//   const length = value.length;
//   console.log(`got ${length} bytes data:`, value);
//   bytesReceived += length;
//   // 读取下一个文件片段，重复处理步骤
//   return reader.read().then(processData);
// };

// reader.read().then(processData);

async function toJSON(reader) {
  const decoder = new TextDecoder();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    chunks.push(chunk);
  }

  return JSON.parse(chunks.join(''));
}

async function toJSON2() {
  return toBuffer(reader);
}
