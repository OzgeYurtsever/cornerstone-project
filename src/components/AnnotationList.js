import React from 'react';

const AnnotationList = props => {
  const anatotionList = props.data.annotations.map((annotation, index) => (
    <li>
      Annotation {index + 1}: {annotation.name}
    </li>
  ));
  return <ul>{anatotionList}</ul>;
};

export default AnnotationList;
