import React from 'react';
import Form from './Form';
import BrowseFiles from './BrowseFiles';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasNameProvided: false,
      userName: '',
      fileName: ''
    };
  }

  addName = name => {
    this.setState({
      hasNameProvided: true,
      userName: name
    });
  };

  getFileName = file => {
    this.setState({ fileName: file });
  };

  render = () => {
    return (
      <div>
        {!this.state.hasNameProvided ? (
          <Form onUserName={this.addName} />
        ) : (
          <div>
            <p className="user-greeting">
              {`Welcome ${this.state.userName}!`}{' '}
            </p>
            <BrowseFiles
              //   getFileName={this.getFileName}
              userName={this.state.userName}
            />
          </div>
        )}
      </div>
    );
  };
}

export default App;
