import axios from 'axios';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

function uploadToS3(url, filePath, { onProgress }) {
  const cancelTokenSource = axios.CancelToken.source();
  const promise = axios({
    url,
    method: 'put',
    headers: {
      'content-type': mime.lookup(filePath),
    },
    data: fs.readFileSync(filePath),
    maxContentLength: 1000000000,
    cancelToken: cancelTokenSource.token,
    onUploadProgress: !onProgress
      ? undefined
      : event => {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress({ type: 'upload', payload: { percent } });
        },
  });
  return { promise, cancel: cancelTokenSource.cancel };
}

export default function nodeLocal(client, filePath, options) {
  let isCancelled = false;
  let cancel = () => {
    isCancelled = true;
  };
  const promise = client.uploadRequest
    .create({ filename: path.basename(filePath) })
    .then(({ id, url }) => {
      if (isCancelled) {
        return Promise.reject(new Error('upload aborted'));
      }
      if (options.onProgress) {
        options.onProgress({
          type: 'uploadRequestComplete',
          payload: {
            id,
            url,
          },
        });
      }
      const { promise: uploadPromise, cancel: cancelUpload } = uploadToS3(
        url,
        filePath,
        {
          onProgress: options.onProgress,
        },
      );
      cancel = cancelUpload;
      return uploadPromise.then(() => id);
    });

  return {
    promise,
    cancel: () => {
      cancel();
    },
  };
}
