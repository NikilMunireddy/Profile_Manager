import React , {Fragment} from 'react';
import NavBar from './components/layout/NavBar'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Alert from './components/layout/Alert'
import Register from './components/auth/Register'
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './store'
import './App.css';


const App = () => (
  <Provider store={store}>
    <Router>
      <Fragment>
      <NavBar/>
        <Route exact path='/' component={Landing} />
        <section className='container'>
        <Alert />
      <Switch>
        <Route exact path='/register' component={Register} />
        <Route exact path='/login' component={Login} />
      </Switch>
    </section>
    </Fragment>
    </Router>
  </Provider>
);

export default App;
