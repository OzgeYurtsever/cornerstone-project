import React from 'react';

class AnnotationList extends React.Component {
  render = () => {
    const anatotionList = this.props.data.map((annotation, index) => (
      <li key={annotation.id}>
        Annotation {index + 1}: {annotation.annotationName}
      </li>
    ));
    return <ul>{anatotionList}</ul>;
  };
}

export default AnnotationList;
