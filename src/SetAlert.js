import React from 'react'
import { format } from 'date-fns'
import { states } from './constants/states'
import { districts } from './constants/districts'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'
import { useHistory } from 'react-router-dom'

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      PRs welcome &#x2764;&#xfe0f;{' '}
      <Link
        color='inherit'
        href='https://github.com/anupjha/covid-vaccine-alert'
      >
        Github
      </Link>
    </Typography>
  )
}

const covidVaccineAlertSettings = {
  district: '',
  age: [],
  doese: [],
  vaccine: [],
  fee: [],
}

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: 768,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}))

export default function SetAlert(props) {
  const classes = useStyles()
  const [districtList, setDistrictList] = React.useState([])

  const [state, setState] = React.useState({
    selectedState: '',
    selectedSDistrict: '',
    age18Above: true,
    age45Above: true,
    firstDose: true,
    secondDose: true,
    covishield: true,
    covaxin: true,
    sputnikV: true,
    paid: true,
    free: true,
  })
  let history = useHistory()
  const getDistrictsList = (sortedArray, key) => {
    let start = 0
    let end = sortedArray.length - 1
    while (start <= end) {
      let middle = Math.floor((start + end) / 2)
      if (sortedArray[middle].state_id === key) {
        return sortedArray[middle].districts
      } else if (sortedArray[middle].state_id < key) {
        start = middle + 1
      } else {
        end = middle - 1
      }
    }
    return 'Not such state found!'
  }

  const setAlerts = () => {
    const district = state.selectedSDistrict
    // set age group
    const age = []
    if (state.age18Above) age.push(18)
    if (state.age45Above) age.push(45)
    //set dose required
    const dose = []
    if (state.firstDose) dose.push('firstDose')
    if (state.secondDose) dose.push('secondDose')
    //set vaccine required
    const vaccine = []
    if (state.covishield) vaccine.push('covishield')
    if (state.covaxin) vaccine.push('covaxin')
    if (state.sputnikV) vaccine.push('sputnickv')
    //set free or paid
    const fee = []
    if (state.free) fee.push('free')
    if (state.paid) fee.push('paid')
    const localData = {
      districtId: district,
      age: age,
      dose: dose,
      vaccine: vaccine,
      fee: fee,
    }
    window.localStorage.setItem(
      'covidVaccineAlertSettings',
      JSON.stringify(localData)
    )
    history.push('/get-alert')
  }

  const handleDistrictChange = (event) => {
    console.log('DD', event.target.value)
    setState({ ...state, selectedSDistrict: event.target.value })
  }

  const handleStateChange = (event) => {
    setState({ ...state, selectedState: event.target.value })
    const districtList = getDistrictsList(districts, event.target.value)
    setDistrictList(districtList)
  }
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }
  const stateListOptions = states.map((s) => (
    <MenuItem value={s.state_id}>{s.state_name}</MenuItem>
  ))
  const getDistrictOptions = () => {
    if (districtList.length === 0) {
      return <MenuItem value={'-1'}>First select State</MenuItem>
    } else {
      return districtList.map((d) => (
        <MenuItem value={d.district_id}>{d.district_name}</MenuItem>
      ))
    }
  }
  const today = format(new Date(), 'dd.MM.yyyy')

  return (
    <React.Fragment>
      <CssBaseline />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='h6' className={classes.title}>
                Set Vaccine Alerts
              </Typography>
            </Toolbar>
          </AppBar>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl
                style={{ minWidth: 320 }}
                className={classes.formControl}
              >
                <InputLabel id='selectedState-label'>State / UT</InputLabel>
                <Select
                  labelId='state-select-label'
                  id='selectedState'
                  value={state.selectedState}
                  onChange={handleStateChange}
                >
                  {stateListOptions}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                style={{ minWidth: 320 }}
                className={classes.formControl}
              >
                <InputLabel id='selectedDistrict-label'>Districts</InputLabel>
                <Select
                  labelId='district-select-label'
                  id='selectedDistrict'
                  value={state.selectedDistrict}
                  onChange={handleDistrictChange}
                >
                  {getDistrictOptions()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.age18Above}
                    onChange={handleChange}
                    name='age18Above'
                    color='primary'
                  />
                }
                label='Age 18+'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.age45Above}
                    onChange={handleChange}
                    name='age45Above'
                    color='secondary'
                  />
                }
                label='Age 45+'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.firstDose}
                    onChange={handleChange}
                    name='firstDose'
                    color='primary'
                  />
                }
                label='First Dose'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.secondDose}
                    onChange={handleChange}
                    name='secondDose'
                    color='secondary'
                  />
                }
                label='Second Dose'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.covishield}
                    onChange={handleChange}
                    name='covishield'
                    color='primary'
                  />
                }
                label='Covishield'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.covaxin}
                    onChange={handleChange}
                    name='covaxin'
                    color='secondary'
                  />
                }
                label='Covaxin'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.sputnikV}
                    onChange={handleChange}
                    name='sputnikV'
                    color='default'
                  />
                }
                label='Sputnik V'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.free}
                    onChange={handleChange}
                    name='free'
                    color='primary'
                  />
                }
                label='Free'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.paid}
                    onChange={handleChange}
                    name='paid'
                    color='secondary'
                  />
                }
                label='Paid'
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant='contained' color='primary' onClick={setAlerts}>
                Set Alert
              </Button>
            </Grid>
          </Grid>
          <Box mt={5}>
            <Copyright />
          </Box>
        </Paper>
      </main>
    </React.Fragment>
  )
}
