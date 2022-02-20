const RX = require('rxjs');
const O = require('rxjs/operators');
const { appendFile } = require('fs/promises');
const {
  fromXmlStreamEvent,
  getXMLReaderInstance,
  mapXmlStreamBuffer,
} = require('./xml-stream-helpers');

/*
  Just some test business logic here
*/
const convertCDInfoToCSVLine = (xmlCdInfo = {}) =>
  `${Object.values(xmlCdInfo).join(';')};\n`;

const updateCSVFile = (fileName, line = '') =>
  appendFile(fileName, line, { encoding: 'utf-8' });

const storeParsedItems =
  (fileName) =>
  (inputItems = []) => {
    const items = Array.isArray(inputItems) ? inputItems : [inputItems];

    return Promise.allSettled(
      items.flatMap((cdInfo) =>
        updateCSVFile(fileName, convertCDInfoToCSVLine(cdInfo)).then(
          () => cdInfo
        )
      )
    )
      .then((promises) =>
        promises.flatMap((promiseInfo) => ({
          error: promiseInfo.status === 'rejected',
          value:
            promiseInfo.status === 'rejected'
              ? promiseInfo.reason
              : promiseInfo.value,
        }))
      )
      .then((promises) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(promises), 500);
        });
      });
  };

const countResultsPredicate = (prev, result) => {
  const ok = result.reduce((prev, curr) => (curr.error ? prev : prev + 1), 0);
  const fails = result.length - ok;
  return {
    ok: ok + prev.ok,
    fails: fails + prev.fails,
  };
};

async function parseCDToFile(from, to) {
  const xml = getXMLReaderInstance(from);

  const stream$ = fromXmlStreamEvent(xml, 'endElement: CD').pipe(
    O.bufferCount(10),
    mapXmlStreamBuffer(xml, storeParsedItems(to)),
    O.scan(countResultsPredicate, { ok: 0, fails: 0 })
  );

  return await RX.lastValueFrom(stream$);
}

module.exports = {
  parseCDToFile,
  countResultsPredicate,
};
