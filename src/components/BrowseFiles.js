import React from 'react';
import cornerstone from '../../public/cornerstone/cornerstone2.js';
import DcmLoader from '../../public/cornerstone/DcmLoader.js';

export default class BrowseFile extends React.Component {
  handleDocumentUploadChange = event => {
    var fileInput = document.querySelector('#input-file');
    var element = document.getElementById('dicomImage');
    if (fileInput.files) {
      var file = fileInput.files[0];
      var imageId = DcmLoader.wadouri.fileManager.add(file);
      const filePath = document.getElementById('input-file').value + '';
      let fileName = filePath.replace(/.*[\/\\]/, '');
      cornerstone.loadImage(imageId).then(function(image) {
        var viewport = cornerstone.getDefaultViewport(
          element.children[0],
          image
        );

        cornerstone.displayImage(element, image, viewport);
      });
      this.props.getFileName(fileName);
    }
  };

  componentDidMount() {
    var element = document.getElementById('dicomImage');
    cornerstone.enable(element);
  }

  render() {
    return (
      <div>
        <input
          id="input-file"
          multi
          type="file"
          onChange={this.handleDocumentUploadChange}
        />
        <div id="dicomImage" style={{ width: '512px', height: '512px' }} />
      </div>
    );
  }
}
