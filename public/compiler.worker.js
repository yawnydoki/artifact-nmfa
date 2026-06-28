import 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image.prod.js';

self.onmessage = async (e) => {
  const { images } = e.data; 

  try {
    if (typeof window === 'undefined' && typeof self.MINDAR === 'undefined') {
      throw new Error("MindAR compiler failed to load from ESM CDN context.");
    }

    const compiler = new self.MINDAR.IMAGE.Compiler();
    
    await compiler.compileImageTargets(images, (progress) => {
      self.postMessage({ status: 'progress', progress: Math.round(progress) });
    });

    const exportedBuffer = await compiler.exportData();
    self.postMessage({ status: 'done', buffer: exportedBuffer });
    
  } catch (err) {
    self.postMessage({ status: 'error', message: err.message });
  }
};