import { Message } from './messaging';

const getDownloadedPath = async (filename: string) =>
  new Promise(resolve =>
    chrome.downloads.search(
      { filenameRegex: `${filename}$`, limit: 1 },
      ([{ filename }]) => resolve(filename)),
    );

chrome.runtime.onMessageExternal.addListener((message: Message, _, respond) => {
  switch (message.type) {
    case 'FETCH_DOWNLOAD_PATHS':
      Promise.all(message.filenames.map(getDownloadedPath)).then(paths => respond(paths));
      return true;
  }
});