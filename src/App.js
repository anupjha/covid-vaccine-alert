import React from 'react'
import SetAlert from './SetAlert'
import GetAlert from './GetAlert'
import { BrowserRouter as Router, Route } from 'react-router-dom'

const SettingContext = React.createContext()

export default function App() {
  const token = window.localStorage.getItem('covidVaccineAlertSettings')

  return (
    <Router>
      <Route
        exact
        path='/'
        component={token ? () => <GetAlert /> : () => <SetAlert />}
      />
      <Route path='/set-alert' component={SetAlert} />
      <Route path='/get-alert' component={GetAlert} />
    </Router>
  )
}
