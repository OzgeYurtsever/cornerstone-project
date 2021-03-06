import React from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import 'babel-polyfill';
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

const webWorkerUrl = getBlobUrl(
  'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js'
);
const codecsUrl = getBlobUrl(
  'https://unpkg.com/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js'
);

const config = {
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
    this.api = 'http://localhost:8080/restApi/webapp/lib';
    this.state = {
      clickCounter: 0,
      fileName: '',
      coordinateStart: { x: 0, y: 0 },
      coordinateEnd: { x: 0, y: 0 },
      areCoordinatesReady: false,
      annotation: '',
      annotationList: []
    };
  }

  componentDidMount() {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    const element = this.dicomImg;
    cornerstone.enable(element);
  }

  componentDidUpdate(prevProps, prevState) {
    const { annotationList } = this.state;
    if (annotationList.length !== prevState.annotationList.length) {
      this.displayLines(annotationList);
    }
  }

  handleDocumentUploadChange = event => {
    const fileInput = document.querySelector('#input-file');
    let fileName;
    if (fileInput.files) {
      const file = fileInput.files[0];
      if (file) {
        const filePath = document.getElementById('input-file').value + '';
        fileName = filePath.replace(/.*[\/\\]/, '');
        this.setState({ fileName });
        this.loadMedicalImage(file, fileName);
      }
    }
  };

  loadMedicalImage = async (file, fileName) => {
    const element = this.dicomImg;
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    const image = await cornerstone.loadImage(imageId);
    const viewport = cornerstone.getDefaultViewport(element.children[0], image);
    cornerstone.displayImage(element, image, viewport);
    this.getAnnotationList(this.props.userName, fileName);
  };

  handleClick = e => {
    const element = this.dicomImg;
    let start;
    let end;
    if (this.state.fileName.length > 0) {
      if (this.state.clickCounter === 0) {
        start = this.getMousePos(element, e);
        this.setState({
          clickCounter: this.state.clickCounter + 1,
          coordinateStart: start
        });
      } else if (this.state.clickCounter === 1) {
        end = this.getMousePos(this.dicomImg, e);
        this.setState({
          coordinateEnd: end,
          areCoordinatesReady: true
        });
        const coorStart = this.state.coordinateStart;
      }
    }
  };

  displayLines = list => {
    list.forEach(annotation =>
      this.drawLine(annotation.coordinates[0], annotation.coordinates[1])
    );
  };

  drawLine = (
    start = this.state.coordinateStart,
    end = this.state.coordinateEnd
  ) => {
    const element = this.dicomImg;
    const canvas = this.dicomImg.children[0];
    if (canvas.getContext) {
      const ctx = element.children[0].getContext('2d');
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  };

  postData = () => {
    const self = this;
    const postData = {
      startX: this.state.coordinateStart.x,
      startY: this.state.coordinateStart.y,
      endX: this.state.coordinateEnd.x,
      endY: this.state.coordinateEnd.y
    };

    const username = this.props.userName;
    const filename = this.state.fileName;
    const aimname = this.state.annotation;

    axios
      .post(
        `${
          this.api
        }/images/${filename}/users/${username}/annotations/${aimname}`,
        postData
      )
      .then(res => console.log(res))
      .then(() => {
        self.getAnnotationList(username, filename);
      })
      .catch(err => console.log(err));

    this.setState({ annotation: '' });
  };

  getAnnotationList = (username, filename) => {
    const self = this;
    axios
      .get(`${this.api}/images/${filename}/users/${username}`)
      .then(function(response) {
        self.setState({ annotationList: response.data.annotationList });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  getAnnotationName = e => {
    e.preventDefault();
    const annotationName = e.target.value;
    if (annotationName.trim().length > 0) {
      this.setState({ annotation: e.target.value });
    }
  };

  closeModal = () => {
    this.setState({
      areCoordinatesReady: false,
      clickCounter: 0
    });
    if (this.state.annotation.length > 0) {
      this.postData();
      this.drawLine();
    }
  };

  render() {
    return (
      <div>
        <input
          id="input-file"
          type="file"
          onChange={this.handleDocumentUploadChange}
        />

        <div id="display">
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
          {this.state.annotationList.length > 0 ? (
            <AnnotationList
              data={this.state.annotationList}
              file={this.state.fileName}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default BrowseFile;
