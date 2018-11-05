import React from 'react';

const NameForm = props => {
  let input;
  return (
    <form
      className="name-entry"
      onSubmit={e => {
        e.preventDefault();
        if (!input.value.trim()) {
          return;
        }
        props.onUserName(input.value);
      }}
    >
      <div>
        <label htmlFor="name-field">
          User Name:
          <input ref={node => (input = node)} className="name-field" />
        </label>
        <button type="submit" className="save-button">
          Save
        </button>
      </div>
    </form>
  );
};

export default NameForm;
