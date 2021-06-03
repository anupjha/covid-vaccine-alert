import React from 'react'
import SetAlert from './SetAlert'
import GetAlert from './GetAlert'
import { BrowserRouter as Router, Route } from 'react-router-dom'

const SettingContext = React.createContext()

export default function App() {
  const token = window.localStorage.getItem('covidVaccineAlertSettings')
  // if (token) return <Redirect to='/get-alert' />
  const loading = true
  return (
    <Router>
      <Route
        exact
        path='/'
        component={loading ? () => <GetAlert /> : () => <SetAlert />}
      />
      <Route path='/set-alert' component={SetAlert} />
    </Router>
  )
}
