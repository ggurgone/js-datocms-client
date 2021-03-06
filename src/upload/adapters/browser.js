function uploadToS3(id, url, file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(id);
        } else {
          reject();
        }
      }
    };

    xhr.open('PUT', url);
    xhr.send(file);
  });
}

export default function browser(client, file) {
  return client.uploadRequest
    .create({ filename: file.name })
    .then(({ id, url }) => {
      return uploadToS3(id, url, file).then(() => id);
    });
}
