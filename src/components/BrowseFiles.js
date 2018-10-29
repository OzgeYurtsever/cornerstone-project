import React from 'react';
import Modal from 'react-modal';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneTools from 'cornerstone-tools';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import AnnotationPopUp from './AnnotationPopUp';

Modal.setAppElement('div');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

function getBlobUrl(url) {
  const baseUrl = window.URL || window.webkitURL;
  const blob = new Blob([`importScripts('${url}')`], {
    type: 'application/javascript'
  });

  return baseUrl.createObjectURL(blob);
}

let webWorkerUrl = getBlobUrl(
  'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js'
);
let codecsUrl = getBlobUrl(
  'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js'
);

var config = {
  startWebWorkersOnDemand: true,
  webWorkerPath: webWorkerUrl,
  taskConfiguration: {
    decodeTask: {
      loadCodecsOnStartup: true,
      initializeCodecsOnStartup: false,
      codecsPath: codecsUrl,
      usePDFJS: false
    }
  }
};

const configTools = {
  mouseEnabled: true,
  touchEnabled: true,
  globalToolSyncEnabled: false
};

class BrowseFile extends React.Component {
  constructor(props) {
    super(props);
    this.dicomImg = null;
    this.state = {
      clickCounter: 0,
      fileName: '',
      coordinateStart: { x: 0, y: 0 },
      coordinateEnd: { x: 0, y: 0 },
      areCoordinatesReady: false,
      annotation: ''
    };
  }
  handleDocumentUploadChange = event => {
    const fileInput = document.querySelector('#input-file');
    const element = this.dicomImg;
    if (fileInput.files) {
      var file = fileInput.files[0];
      console.log(file);
      var imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      const filePath = document.getElementById('input-file').value + '';
      let fileName = filePath.replace(/.*[\/\\]/, '');
      this.setState({ fileName });
      cornerstone.loadImage(imageId).then(function(image) {
        var viewport = cornerstone.getDefaultViewport(
          element.children[0],
          image
        );

        cornerstone.displayImage(element, image, viewport);
      });
    }
  };

  handleClick = e => {
    var element = this.dicomImg;
    console.log('===========');
    console.log(element);
    // cornerstone.enable(element);
    console.log(e);
    let pixelCoordsStart;
    let pixelCoordsEnd;
    const ctx = element.children[0].getContext('2d');

    if (this.state.fileName.length > 0) {
      if (this.state.clickCounter === 0) {
        const start = this.getMousePos(element, e);
        console.log(start);
        pixelCoordsStart = cornerstone.pageToPixel(element, start.x, start.y);
        console.log('----------------');
        console.log(pixelCoordsStart);
        console.log('----------------');

        this.setState({
          clickCounter: this.state.clickCounter + 1,
          coordinateStart: start
        });
      } else if (this.state.clickCounter === 1) {
        const end = this.getMousePos(this.dicomImg, e);
        pixelCoordsEnd = cornerstone.pageToPixel(element, end.x, end.y);

        this.setState({
          coordinateEnd: end,
          areCoordinatesReady: true
        });
        console.log(cornerstoneTools);
        //TODO: draw a line using cornerstonetools
        // cornerstoneTools.drawLine(
        //   ctx,
        //   element,
        //   pixelCoordsStart,
        //   pixelCoordsEnd
        // );
      }
      let canvas = this.dicomImg.children[0];
      // cornerstone.enable(canvas);
      // console.log(
      //   'method here',
      //   cornerstone.pageToPixel(
      //     canvas,
      //     this.state.coordinateStart.x,
      //     this.state.coordinateStart.y
      //   )
      // );
    }
  };

  getMousePos = (canvas, evt) => {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  componentDidMount() {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    var element = this.dicomImg;
    cornerstone.enable(element);
    // cornerstoneTools.mouseInput.enable(element);
    // console.log('element', element.children[0]);
  }

  getAnnotationName = e => {
    e.preventDefault();
    this.setState({ annotation: e.target.value });
  };

  closeModal = () => {
    //isim kaydet butonuna basıldığında http post requesti çağır
    //post username, filename, x, y, annotation name
    this.setState({
      areCoordinatesReady: false,
      clickCounter: 0
      // annotation: this.annotation.value
    });
  };

  postAnnotationDetails = () => {};

  render() {
    console.log('state after annotation', this.state);
    console.log(this.props);

    return (
      <div>
        <input
          id="input-file"
          multi
          type="file"
          onChange={this.handleDocumentUploadChange}
        />

        <div
          id="dicomImage"
          style={{ width: '512px', height: '512px' }}
          ref={node => (this.dicomImg = node)}
          onClick={this.handleClick}
        />
        {this.state.areCoordinatesReady ? (
          <Modal
            isOpen={this.state.areCoordinatesReady}
            onRequestClose={this.closeModal}
            style={customStyles}
          >
            <form>
              <div>
                <label>
                  Annotation:
                  <input
                    ref={node => (this.annotation = node)}
                    onChange={this.getAnnotationName}
                  />
                </label>
                <button
                  type="button"
                  className="annotation-save"
                  onClick={this.closeModal}
                >
                  Save
                </button>
              </div>
            </form>
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default BrowseFile;
