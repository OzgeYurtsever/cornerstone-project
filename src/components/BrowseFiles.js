import React from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneTools from 'cornerstone-tools';
import Hammer from 'hammerjs';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import AnnotationList from './AnnotationList';

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
      annotation: '',
      annotationList: {
        filename: 'file',
        annotations: [
          {
            name: 'name',
            user: 'user',
            coordinates: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
          },
          {
            name: 'name2',
            user: 'user2',
            coordinates: [{ x: 15, y: 25 }, { x: 35, y: 45 }]
          }
        ]
      }
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
    if (this.state.fileName.length > 0) {
      if (this.state.clickCounter === 0) {
        const start = this.getMousePos(element, e);
        this.setState({
          clickCounter: this.state.clickCounter + 1,
          coordinateStart: start
        });
      } else if (this.state.clickCounter === 1) {
        const end = this.getMousePos(this.dicomImg, e);
        this.setState({
          coordinateEnd: end,
          areCoordinatesReady: true
        });
        const canvas = this.dicomImg.children[0];
        if (canvas.getContext) {
          const ctx = element.children[0].getContext('2d');
          ctx.beginPath();
          ctx.moveTo(
            this.state.coordinateStart.x,
            this.state.coordinateStart.y
          );
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
    }
  };

  postData = () => {
    const data = {
      startX: this.state.coordinateStart.x,
      startY: this.state.coordinateStart.y,
      endX: this.state.coordinateEnd.x,
      endY: this.state.coordinateEnd.y
    };

    const username = this.state.userName;
    const filename = this.state.fileName;
    const aimname = this.state.annotation;

    console.log('data', data);
    axios
      .post(
        `http://localhost:8080/lib/images/${filename}/users/${username}/annotations/${aimname}`,
        data
      )
      .then(res => console.log(res))
      .catch(err => console.log(err));
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
  }

  getAnnotationName = e => {
    e.preventDefault();
    this.setState({ annotation: e.target.value });
  };

  closeModal = () => {
    this.setState({
      areCoordinatesReady: false,
      clickCounter: 0
    });
    this.postData();
  };

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
        <AnnotationList data={this.state.annotationList} />
      </div>
    );
  }
}

export default BrowseFile;
