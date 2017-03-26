'use babel';

import FileHelper from '../lib/file-helper';

describe('File Helper', () =>
{
  it('should load the contents of a file', () =>
  {
    let fileLoadPromise, fileContent, fileLoaded;

    runs(() =>
    {
      fileLoaded = false;

      fileLoadPromise = FileHelper.getFileLoadPromise('file://' + __dirname + '/dummy-file.txt');
      fileLoadPromise.then((result) =>
      {
        fileContent = result;
        fileLoaded = true;
      });
    });

    // Waits until file is loaded
    waitsFor(() =>
    {
      return fileLoaded;
    });

    runs(() =>
    {
      expect(fileContent).toContain('Lorem ipsum');
    });
  });
});
