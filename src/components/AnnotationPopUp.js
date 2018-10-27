import React from 'react';

const AnnotationPopUp = props => {
  let input;
  return (
    <form
      className="annotation"
      onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        console.log(input.value);
        props.onAnnotation(input.value);
      }}
    >
      <div>
        <label htmlFor="name-field">
          Annotation:
          <input ref={node => (input = node)} className="name-field" />
        </label>
        <button type="submit" className="save-button">
          Save
        </button>
      </div>
    </form>
  );
};

export default AnnotationPopUp;
