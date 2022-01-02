import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { gql, useLazyQuery } from '@apollo/client'
import UserContext from '../UserContext'
import { Box, Collapse, IconButton } from '@material-ui/core'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

function Row(props) {
  const { row } = props
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <a
            href={'https://programsandcourses.anu.edu.au/course/' + row.id}
            target="_blank"
            rel="noreferrer"
          >
            {row.id}
          </a>
        </TableCell>
        <TableCell align="right">{row.name}</TableCell>
        <TableCell align="right">{row.units}</TableCell>
        <TableCell align="right">{row.academic_career}</TableCell>
        <TableCell align="right">{row.college}</TableCell>
        <TableCell align="right">{row.course_convener}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>{row.description}</Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

Row.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    units: PropTypes.number,
    academic_career: PropTypes.string,
    college: PropTypes.string,
    course_convener: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
}

export default function CourseTable() {
  const user = useContext(UserContext)
  const QUERY_PROGRAM_CLASSES = gql`
    query programs($id: ID!) {
      programs(where: { id: $id }) {
        classes {
          id
          name
          units
          academic_career
          college
          course_convener
          description
        }
      }
    }
  `

  const [getClasses, { data, error, loading }] = useLazyQuery(
    QUERY_PROGRAM_CLASSES
  )

  useEffect(async () => {
    await getClasses({ variables: { id: user.program } })
  }, [user])

  return (
    <React.Fragment>
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>ID</TableCell>
                <TableCell align="right">Name</TableCell>
                <TableCell align="right">Units</TableCell>
                <TableCell align="right">Academic Career</TableCell>
                <TableCell align="right">College</TableCell>
                <TableCell align="right">Convener</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data &&
                data.programs.length > 0 &&
                data.programs[0].classes.map((row) => (
                  <Row key={row.id} row={row} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </React.Fragment>
  )
}
