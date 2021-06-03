import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import CircularProgress from '@material-ui/core/CircularProgress'
import useInterval from './hooks/useInterval'
import { API_URL, FETCH_INTERVAL } from './constants/app.constants'
import boopSfx from './sounds/alert.wav'
import { Divider } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'

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

function Alert(props) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const useStyles = makeStyles((theme) => ({
  table: {
    maxWidth: 700,
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
}))

export default function GetAlert(props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  let sound = new Audio(boopSfx) // Due to browser's security unable to auto play the sound

  useInterval(() => {
    setLoading(true)
    getVaccineAvailability()
  }, 300000) // 5 Min

  useEffect(() => {
    setLoading(true)
    getVaccineAvailability()
  }, [])

  const handleClick = () => {
    sound.play()
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    // There's no 'this.sound.stop()' function.
    sound.pause()
    sound.currentTime = 0
    setOpen(false)
  }

  const isMatched = (arr, doseObj) => {
    for (let i = 0; i < arr.length; i++) {
      if (doseObj[arr[i]] > 0) {
        return true
      }
    }
    return false
  }

  const filterSlots = (slot, age, dose, vaccine, fee) => {
    const filteredSlot = {}
    let doseObj = {}
    doseObj.firstDose = slot.firstDose
    doseObj.secondDose = slot.secondDose
    if (
      age.includes(slot.age) &&
      vaccine.includes(slot.vaccine.toLowerCase()) &&
      fee.includes(slot.fee.toLowerCase()) &&
      isMatched(dose, doseObj)
    ) {
      return true
    } else {
      return false
    }
  }

  const getVaccineAvailability = () => {
    const settings = JSON.parse(
      window.localStorage.getItem('covidVaccineAlertSettings')
    )
    const { districtId, age, dose, vaccine, fee } = settings
    const baseUrl =
      'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/'

    const today = format(new Date(), 'dd-MM-yyyy')
    let url = `${baseUrl}calendarByDistrict?district_id=${districtId}&date=${today}`

    axios
      .get(url)
      .then((result) => {
        const { centers } = result.data
        let isSlotAvailable = false
        const slotList = []

        let appointmentsAvailableCount = 0
        if (centers.length) {
          centers.forEach((center) => {
            let centerName = center.name
            let feeType = center.fee_type
            center.sessions.forEach((session) => {
              const slotDetails = {}
              if (session.available_capacity > 0) {
                slotDetails.id = session.session_id
                slotDetails.date = session.date
                slotDetails.slot = session.slots
                slotDetails.age = session.min_age_limit
                slotDetails.total = session.available_capacity
                slotDetails.firstDose = session.available_capacity_dose1
                slotDetails.secondDose = session.available_capacity_dose2
                slotDetails.vaccine = session.vaccine
                slotDetails.fee = feeType
                slotDetails.name = centerName
                if (filterSlots(slotDetails, age, dose, vaccine, fee)) {
                  slotList.push(slotDetails)
                }
              }
            })
          })
          setData(slotList)
          setLastUpdated(new Date())
          document.title = 'Available now'
          if (slotList.length > 0) setOpen(true)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.log('Error: ' + err.message)
      })
  }
  const lastUpdatedAt = isToday(lastUpdated)
    ? format(lastUpdated, 'h:mm bb')
    : format(lastUpdated, 'M/d/yy')
  return (
    <React.Fragment>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='h6' className={classes.title}>
                Vaccine Alerts
              </Typography>
            </Toolbar>
          </AppBar>
          {loading ? (
            <CircularProgress color='secondary' />
          ) : data.length > 0 ? (
            <TableContainer component={Paper}>
              <Table
                className={classes.table}
                size='small'
                aria-label='vaccine table'
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Center Name</TableCell>
                    <TableCell align='right'>Vaccine</TableCell>
                    <TableCell align='right'>Fee</TableCell>
                    <TableCell align='right'>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell component='th' scope='row'>
                        {row.name}
                      </TableCell>
                      <TableCell align='right'>{row.vaccine}</TableCell>
                      <TableCell align='right'>{row.fee}</TableCell>
                      <TableCell align='right'>{row.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography
              inline='true'
              variant='body1'
              className={classes.centreText}
            >
              No vaccine available!
            </Typography>
          )}
          <Divider variant='middle' />
          <Typography
            variant='caption'
            color='textPrimary'
            display='block'
            gutterBottom
            alignRight
          >
            {'Last Updated At: '}
            {lastUpdatedAt}
          </Typography>
          <Button
            variant='contained'
            color='primary'
            onClick={getVaccineAvailability}
          >
            Pull Now
          </Button>{' '}
          <NavLink to='/set-alert'>
            <Button variant='outlined' color='primary'>
              Reset
            </Button>{' '}
          </NavLink>
          <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity='success'>
              Vaccine available!!
            </Alert>
          </Snackbar>
          <Box mt={5}>
            <Copyright />
          </Box>
        </Paper>
      </main>
    </React.Fragment>
  )
}
