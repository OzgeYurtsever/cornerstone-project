import React from 'react';

const AnnotationList = props => {
  const anatotionList = props.data.map((annotation, index) => (
    <li>
      Annotation {index + 1}: {annotation.annotationName}
    </li>
  ));
  return <ul>{anatotionList}</ul>;
};

export default AnnotationList;
