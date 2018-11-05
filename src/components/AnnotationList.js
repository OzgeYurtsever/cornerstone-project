import React from 'react';

const AnnotationList = props => {
  const anatotionList = props.data.map((annotation, index) => (
    <li key={annotation.id}>
      Annotation {index + 1}: {annotation.annotationName}
    </li>
  ));
  return (
    <div>
      <h3>File Name: {props.file}</h3>
      <ul>{anatotionList}</ul>
    </div>
  );
};

export default AnnotationList;
