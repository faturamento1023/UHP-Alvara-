/* Download the unchanged Godot binaries as independently cached gzip parts. */
window.ValeDownloads = (() => {
  'use strict';
  const manifest = {"index.wasm":{"size":39514754,"sha256":"fc74679e3b97f76878947fcd4fbe1268cbfa6188182a2e33bbc3f5dc9bfa57d0","type":"application/wasm","parts":[{"url":"part-d092f3c7fd5f1ad8e091.gz","size":4194304,"downloadSize":1295458,"downloadSha256":"d092f3c7fd5f1ad8e0919268189a8ae0136126f5d8cd9f04119f7d493f3f5b47"},{"url":"part-4b52dc52010f2f74f73e.gz","size":4194304,"downloadSize":1174190,"downloadSha256":"4b52dc52010f2f74f73e99ca84e89cf4a9f62f23db252e72fdda69d67b54e18b"},{"url":"part-59d5be5911f54ac2b880.gz","size":4194304,"downloadSize":1082541,"downloadSha256":"59d5be5911f54ac2b880107188b78a9e1592df1ae1a91018ef78137f1389b980"},{"url":"part-84b0e42b6e7ddc14e9fd.gz","size":4194304,"downloadSize":850771,"downloadSha256":"84b0e42b6e7ddc14e9fd45a4bc2347c8de648d26f999a695fae177154fd7625a"},{"url":"part-d4c7e8ec86615a82b15d.gz","size":4194304,"downloadSize":784848,"downloadSha256":"d4c7e8ec86615a82b15dcec195cf8cf8fe80f0ec283205902db2d722b6169520"},{"url":"part-390e8e76a0a4e289c71d.gz","size":4194304,"downloadSize":951358,"downloadSha256":"390e8e76a0a4e289c71d76a4737d7aa1da210dbac7b9ba1f5e70b3b2e961e0fa"},{"url":"part-d26013dc8add94334c82.gz","size":4194304,"downloadSize":771302,"downloadSha256":"d26013dc8add94334c827ec5a63af871e32076be376437d01d2a44753f6891db"},{"url":"part-efe44a841737c5a0a153.gz","size":4194304,"downloadSize":1042226,"downloadSha256":"efe44a841737c5a0a15315bfa8e9399a3175f1dc8666913da02b8906ff7869a6"},{"url":"part-f53474e94dbb654271a4.gz","size":4194304,"downloadSize":1379241,"downloadSha256":"f53474e94dbb654271a43488cb745f48cae30238bda2c23134c9a5e0ab8521f0"},{"url":"part-ffae672954d839a0bb27.gz","size":1766018,"downloadSize":729146,"downloadSha256":"ffae672954d839a0bb27d897661c248038f76d0263aabeea36351f806f5a3ee3"}]},"the-free-game-f908cbc2c86e.pck":{"size":45000192,"sha256":"f908cbc2c86e6c900516eecc1601ba9db382e4acd5a68e4a7a3c5beac58324fe","type":"application/octet-stream","parts":[{"url":"part-9373556100a3fa85ca25.gz","size":4194304,"downloadSize":3843758,"downloadSha256":"9373556100a3fa85ca2502eaa5dec5ab19b2215900b60f761216c2112b6d5f42"},{"url":"part-df2cf17de5e853182984.gz","size":4194304,"downloadSize":3469219,"downloadSha256":"df2cf17de5e853182984316064cf3945dba380bb936ee8882753080257b49a80"},{"url":"part-e344f7ac00cb0b7b266d.gz","size":4194304,"downloadSize":2902506,"downloadSha256":"e344f7ac00cb0b7b266d23f9c48ab5ec41a4df3e1c1e8e75a7e989696be23a5c"},{"url":"part-758595d00b65fb19815d.gz","size":4194304,"downloadSize":1827236,"downloadSha256":"758595d00b65fb19815df5af2ab3c23cddf0417f1f418a7c57bd30c8d9487f0e"},{"url":"part-06487c6a56baa1ddf9cf.gz","size":4194304,"downloadSize":3411877,"downloadSha256":"06487c6a56baa1ddf9cf857fd1d60b2027800e8374686d216a3435c2295672d8"},{"url":"part-4ab91e4e2ae7553500ea.gz","size":4194304,"downloadSize":1748908,"downloadSha256":"4ab91e4e2ae7553500ea242c641f269dd97d1fa3154c63edcfd0c99096191ae3"},{"url":"part-a7dd36c022300bcbbde5.gz","size":4194304,"downloadSize":3199296,"downloadSha256":"a7dd36c022300bcbbde503a5de6dda67cfc34c915efd821df5d0a2291a092776"},{"url":"part-defd88ab28d89257fd21.gz","size":4194304,"downloadSize":2441776,"downloadSha256":"defd88ab28d89257fd21f4060e58c2b042b783b3f439737eb283398077380a24"},{"url":"part-b2d1bc6dbd91a27bc4cd.gz","size":4194304,"downloadSize":2394033,"downloadSha256":"b2d1bc6dbd91a27bc4cd83062b05ccfa71a0b8f1674c3c295af3a3914c7a49e0"},{"url":"part-ecdcbf1bb9c2724c2325.gz","size":4194304,"downloadSize":2181996,"downloadSha256":"ecdcbf1bb9c2724c232519e84d7085249f9da26bb965f0f1407f7c9ae07e5232"},{"url":"part-d2b4f18134e7fe56a080.gz","size":3057152,"downloadSize":1824227,"downloadSha256":"d2b4f18134e7fe56a080e5efe654817a87fc6f9e83a3dac715bd7b26d27c23aa"}]}};
  const nativeFetch = window.fetch.bind(window);
  const hex = bytes => Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
  async function verify(bytes, expected) {
    if (hex(await crypto.subtle.digest('SHA-256', bytes)) !== expected) {
      throw new Error('Um arquivo do jogo chegou incompleto. Tente novamente.');
    }
  }
  async function start(engine, onProgress) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('Atualize seu navegador para abrir esta versão do jogo.');
    }
    const progress = new Map();
    const total = Object.values(manifest).flatMap(file => file.parts).reduce((sum, part) => sum + part.downloadSize, 0);
    const report = () => onProgress(Array.from(progress.values()).reduce((sum, size) => sum + size, 0), total);
    const files = new Map(Object.entries(manifest).map(([name, file]) => [new URL(name, document.baseURI).href, file]));
    const pending = new Map();
    const aborter = new AbortController();
    async function download(file) {
      const output = new Uint8Array(file.size);
      let offset = 0;
      for (const part of file.parts) {
        const response = await nativeFetch(new URL(part.url, document.baseURI), {signal:aborter.signal});
        if (!response.ok || !response.body) throw new Error('Não foi possível baixar os arquivos do jogo. Confira sua conexão e tente novamente.');
        const zipped = new Uint8Array(part.downloadSize);
        const reader = response.body.getReader();
        let received = 0;
        while (true) {
          const {value, done} = await reader.read();
          if (done) break;
          if (received + value.length > zipped.length) {await reader.cancel();throw new Error('Arquivo de jogo inválido.');}
          zipped.set(value, received);
          received += value.length;
          progress.set(part.url, received);
          report();
        }
        if (received !== zipped.length) throw new Error('Download interrompido. Tente novamente.');
        await verify(zipped, part.downloadSha256);
        const decoded = new Uint8Array(await new Response(new Blob([zipped]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
        if (decoded.length !== part.size) throw new Error('Tamanho do arquivo de jogo inválido.');
        output.set(decoded, offset);
        offset += decoded.length;
      }
      await verify(output, file.sha256);
      return output;
    }
    const wrappedFetch = async (input, options) => {
      const href = new URL(input instanceof Request ? input.url : input, document.baseURI).href;
      const file = files.get(href);
      if (!file) return nativeFetch(input, options);
      if (!pending.has(href)) pending.set(href, download(file));
      const bytes = await pending.get(href);
      return new Response(bytes, {headers:{'Content-Type':file.type,'Content-Length':String(file.size)}});
    };
    window.fetch = wrappedFetch;
    report();
    try {
      await engine.startGame();
    } finally {
      if (window.fetch === wrappedFetch) window.fetch = nativeFetch;
      aborter.abort();
      pending.clear();
    }
  }
  return {start};
})();
