import React, { useState } from 'react'

import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import GitHubButton from 'react-github-btn'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Link as MUILink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@material-ui/core'
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@material-ui/icons'
import SchoolIcon from '@material-ui/icons/School'
import DashboardPrograms from './components/DashboardPrograms'
import dotenv from 'dotenv'
import UserContext from './UserContext'
import GitHubIcon from '@mui/icons-material/GitHub'
import HomeIcon from '@mui/icons-material/Home'
import GolfCourseIcon from '@material-ui/icons/GolfCourse'
import DashboardCourses from './components/DashboardCourses'

// set environment variables from .env
dotenv.config()

function Footer() {
  return (
    <>
      <Typography variant="body2" color="textSecondary" align="center">
        {'This is an attempt to create an improved catalogue of programs and '}
        {'courses, here at the Australian National University.'}
        <br />
        {
          'This project is currently actively being developed and improved as of January 2022.'
        }
      </Typography>
      <Divider />
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ marginTop: 20 }}
      >
        {'Made with'}
        {' \u{2764}'}
      </Typography>
      <Box
        component="span"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <MUILink
          color="inherit"
          href="https://khirota.co/"
          target="_blank"
          rel="noreferrer"
        >
          <HomeIcon fontSize="small" />
        </MUILink>
        <GitHubButton
          href="https://github.com/from81/ANU-Programs-and-Courses-Graph-Explorer"
          data-show-count="true"
          aria-label="Star from81/ANU-Programs-and-Courses-Graph-Explorer on GitHub"
          sx={{ marginLeft: '1em' }}
        >
          Star
        </GitHubButton>
      </Box>
    </>
  )
}

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  navLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  appBarImage: {
    maxHeight: '75px',
    paddingRight: '20px',
  },
}))

export default function App() {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)

  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

  const saveUserContext = (values) => {
    setUserContext(values)
  }
  const [userContext, setUserContext] = useState({
    program: '',
    coursesTaken: [],
    saveUserContext: saveUserContext,
  })

  return (
    <Router>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={clsx(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              ANU Programs and Courses Graph Explorer
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <Link to="/" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <GolfCourseIcon />
                </ListItemIcon>
                <ListItemText primary="Programs" />
              </ListItem>
            </Link>
            <Link to="/courses" className={classes.navLink}>
              <ListItem button>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Courses" />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <UserContext.Provider value={userContext}>
              <Switch>
                <Route exact path="/" component={DashboardPrograms} />
                <Route exact path="/courses" component={DashboardCourses} />
              </Switch>
            </UserContext.Provider>
            <Box pt={4}>
              <Footer />
            </Box>
          </Container>
        </main>
      </div>
    </Router>
  )
}
