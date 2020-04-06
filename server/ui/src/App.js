import React , { Fragment, useEffect } from 'react';
import NavBar from './components/layout/NavBar'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Alert from './components/layout/Alert'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './components/routing/PrivateRoute'
import CreateProfile from './components/profile-form/CreateProfile'
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store'
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken'
import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token)
}

// component did mount , [] is passed so that it runs only once 
const App = () => {
useEffect(()=>{
  store.dispatch(loadUser())
}, [])

  return (
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
          <PrivateRoute exact path='/dashboard' component={Dashboard} />
          <PrivateRoute exact path='/create-profile' component={CreateProfile} />
        </Switch>
      </section>
      </Fragment>
      </Router>
    </Provider>
  )};

export default App;
