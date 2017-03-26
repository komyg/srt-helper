'use babel';

/*
 * Load a file using XMLHttpRequest.
 * Returns a promise that can be used for the loading.
 */
export default
{
  getFileLoadPromise(fileUrl)
  {
    let promise = new Promise((resolve, reject) =>
    {
      let request = new XMLHttpRequest();
      request.open('GET', fileUrl);

      request.onload = () =>
      {
        if (request.status === 200)
          resolve(request.responseText);

        else
          reject(Error(request.statusText));
      };

      request.onError = () =>
      {
        reject(Error('Network error.'))
      };

      request.send();
    });

    return promise;
  }
}
