const fs = require('fs');
const XmlStream = require('xml-stream');
const RX = require('rxjs');
const O = require('rxjs/operators');

/*
  So, we need stream creator
  xml-stream is implemented in very strange manner
  It's an instance of EventEmitter, which means it supports node style
  But it's main public listener binder is custom `on` function
  So, using default RXJS fromEvent will try to use wrong methods
*/
const fromXmlStreamEvent = (xml, event) =>
  RX.fromEventPattern((handler) => xml.on(event, (item) => handler(item))).pipe(
    O.distinct(),
    O.takeUntil(
      RX.fromEventPattern((handler) => xml.on('end', () => handler()))
    )
  );

/*
  Hacky solution to pause producer while we are doing
  some work with buffered items
*/
const mapXmlStreamBuffer = (xml, processCallback) => {
  return O.mergeMap(async (project) => {
    // xml._suspended is a dirty hack because there is no other way to check
    !xml._suspended && xml.pause();
    const result = await processCallback(project);
    xml._suspended && xml.resume();
    return result;
  });
};

const getXMLReaderInstance = (path) => {
  const xmlFileStream = fs.createReadStream(path);
  const xml = new XmlStream(xmlFileStream);

  xml.on('end', () => {
    xmlFileStream.close();
  });

  return xml;
};

module.exports = {
  fromXmlStreamEvent,
  mapXmlStreamBuffer,
  getXMLReaderInstance,
};
