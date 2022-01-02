import React, { useContext } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@material-ui/core'
import clsx from 'clsx'

import ProgramGraphs from './ProgramGraphs'
import CourseTable from './CourseTable'
import { gql, useQuery } from '@apollo/client'
import Title from './Title'
import UserContext from '../UserContext'
import { set } from 'husky'
import { Autocomplete } from '@mui/material'

const QUERY_GET_PROGRAMS = gql`
  {
    programs(options: { limit: 50, skip: 80 }) {
      id
      name
    }
  }
`

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
}))

export default function Dashboard() {
  const theme = useTheme()
  const classes = useStyles(theme)
  const fixedHeightPaper = clsx(classes.paper)
  const user = useContext(UserContext)
  const { loading, error, data } = useQuery(QUERY_GET_PROGRAMS)
  if (error) return <p>Error</p>
  if (loading) return <p>Loading</p>

  const handleChange = (e) => {
    const programId = data.programs.find((p) => p.name === e.target.textContent)
    if (programId && programId !== '') {
      user.saveUserContext({
        program: programId,
        saveUserContext: user.saveUserContext,
      })
    }
  }

  return (
    <React.Fragment>
      <Container>
        <Paper className={fixedHeightPaper}>
          <Autocomplete
            disablePortal
            options={data.programs.filter(
              (program) => program.name !== '' && program.id !== ''
            )}
            getOptionLabel={(option) => option.name}
            sx={{ width: 400 }}
            renderInput={(params) => <TextField {...params} label="Program" />}
            onChange={handleChange}
          />
          <Title>Program Graph</Title>
          <ProgramGraphs />
          <Title>Courses</Title>
          <CourseTable programs={data.programs} />
        </Paper>
      </Container>
    </React.Fragment>
  )
}
