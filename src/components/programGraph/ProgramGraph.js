import React, { useEffect, useRef, useState } from 'react'
import '../graph.css'
import {
  extractDataset,
  NEO4J_PASSWORD,
  NEO4J_URI,
  NEO4J_USER,
} from '../../utils'
import { useDispatch, useSelector } from 'react-redux'
import { CircularProgress } from '@material-ui/core'
import cytoscape from 'cytoscape'
import klay from 'cytoscape-klay'
import { toggleCourse } from '../../selections'

cytoscape.use(klay)

const neo4j = require('neo4j-driver')
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
)

const CYPHER_QUERY =
  'MATCH p=(:Program {id: $program_id})-[r:REQUIREMENT*1..]->() RETURN p'

const COLORMAP = {
  Program: '#5454FF',
  Specialisation: '#AA47FF',
  Requirement: '#FFBC47',
  Course: '#FF5454',
  Complete: '#54FF54',
}

const extractNode = (node) => {
  let extracted = {
    ...node.properties,
    tag: node.labels[0],
  }

  if (extracted.tag === 'Requirement' && node.properties.units) {
    extracted.label = node.properties.units.low
  } else if (extracted.tag === 'Program') {
    extracted.label = node.properties.name
  } else if (extracted.tag === 'Specialisation') {
    extracted.label = node.properties.name
  } else if (extracted.tag === 'Course') {
    extracted.label = `${node.properties.id}`
  }
  return extracted
}

export default function ProgramGraph(props) {
  const { children } = props
  const programId = useSelector((state) =>
    state.selections.programId ? state.selections.programId : ''
  )
  const dispatch = useDispatch()
  const cyRef = useRef()
  const selectedCourses = useSelector((state) =>
    state.selections.selectedCourses ? state.selections.selectedCourses : []
  )
  const [dataset, setDataset] = useState({
    nodes: [],
    edges: [],
    tags: [],
  })
  const [cytoscapeDataset, setCytoscapeDataset] = useState([])
  const [style, setStyle] = useState([])
  const [layout, setLayout] = useState({
    name: 'klay',
    nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
    fit: true, // Whether to fit
    padding: 20, // Padding on fit
    animate: false, // Whether to transition the node positions
    animateFilter: function (node, i) {
      return true
    }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // Duration of animation in ms if enabled
    animationEasing: undefined, // Easing of animation if enabled
    transform: function (node, pos) {
      return pos
    }, // A function that applies a transform to the final node position
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    klay: {
      // direction: 'horizontal', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
      direction: 'DOWN', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
      edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
      // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
      addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
      aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
      borderSpacing: 20, // Minimal amount of space to be left to the border
      compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
      crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
      /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
      INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
      /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
      INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
      /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
      edgeRouting: 'POLYLINE', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
      feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
      fixedAlignment: 'BALANCED', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
      /* NONE Chooses the smallest layout from the four possible candidates.
      LEFTUP Chooses the left-up candidate from the four possible candidates.
      RIGHTUP Chooses the right-up candidate from the four possible candidates.
      LEFTDOWN Chooses the left-down candidate from the four possible candidates.
      RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
      BALANCED Creates a balanced layout from the four possible candidates. */
      inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
      layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
      linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
      mergeEdges: true, // Edges that have no ports are merged so they touch the connected nodes at the same points.
      mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
      nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
      /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
      LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
      INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
      /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
      LINEAR_SEGMENTS Computes a balanced placement.
      INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
      SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
      randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
      routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
      separateConnectedComponents: true, // Whether each connected component should be processed separately
      spacing: 50, // Overall setting for the minimal amount of space to be left between objects
      thoroughness: 7, // How much effort should be spent to produce a nice layout..
    },
    priority: function (edge) {
      return null
    }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
  })

  useEffect(() => {
    if (programId !== '') {
      const session = driver.session({ defaultAccessMode: neo4j.session.READ })
      session
        .run(CYPHER_QUERY, { program_id: programId })
        .then((result) => {
          const dataset = extractDataset(result.records, extractNode)
          setDataset(dataset)
        })
        .catch((error) => {
          console.log(error)
        })
        .then(() => session.close())
    }
  }, [programId])

  useEffect(() => {
    console.log(dataset)
    const { nodes, edges, tags } = dataset
    let newDataset = []

    // TODO: use stylesheet instead of using style parameter to style nodes
    // TODO: use selector
    if (nodes) {
      try {
        nodes.forEach((node) => {
          let data = { ...node }
          if (!data.label && data.description) {
            data.label = data.description
          }
          newDataset.push({
            data: data,
            classes: [node.tag],
            // style: {'background-color': node.color},
          })
        })
        console.log(nodes[0].key)
        // setLayout({ ...layout, roots: [nodes[0].key] })
      } catch (e) {
        // console.log(e)
      }
    }
    if (edges) {
      edges.forEach((edge) => {
        newDataset.push({
          data: {
            source: edge.from,
            target: edge.to,
            label: edge.label,
          },
        })
      })
    }

    console.log(newDataset)
    setCytoscapeDataset(newDataset)
  }, [dataset])

  useEffect(() => {
    console.log(cytoscapeDataset)
    console.log(selectedCourses)

    const style = [
      {
        selector: 'node',
        style: {
          'background-color': (el) =>
            selectedCourses.includes(el.attr('id'))
              ? COLORMAP.Complete
              : COLORMAP[el.attr('tag')],
          'background-height': '40%',
          'background-width': '40%',
          'border-color': '#fff',
          'border-width': '5%',
          'overlay-opacity': 0,
          label: 'data(label)',
          width: 30,
          height: 30,
          shape: 'ellipse',
          'font-family': 'Helvetica',
          'font-size': 14,
          'min-zoomed-font-size': 10,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 1,
          // 'curve-style': 'bezier',
          'line-color': '#B3B3B3',
          'target-arrow-color': '#3A52E2',
          'target-arrow-shape': 'triangle',
          'overlay-opacity': 0,
        },
      },
    ]
    setStyle(style)
    if (cyRef.current) cyRef.current.style(style).update()
  }, [cytoscapeDataset, selectedCourses])

  useEffect(() => {
    let cy = cytoscape({
      container: document.getElementById('cy'), // container to render in
      elements: cytoscapeDataset,
      style: style,
      layout: layout,
    })
    cyRef.current = cy

    const handleNodeClick = (node) => {
      if (node._private.data.tag && node._private.data.tag === 'Course') {
        console.log(node)
        // NOTE: this is on hold because currently there is no way to change the checkbox of the table
        // dispatch(toggleCourse(node.id()))
      }
    }
    // cy.on('tapstart', 'node', (evt) => handleNodeClick(evt.target))
  }, [cytoscapeDataset])

  if (!(cytoscapeDataset && style && layout)) return <CircularProgress />

  return (
    <>
      {/*<CytoscapeComponent*/}
      {/*  elements={cytoscapeDataset}*/}
      {/*  stylesheet={style}*/}
      {/*  layout={layout}*/}
      {/*  style={{ width: '100%', height: '50vh' }}*/}
      {/*/>*/}
      <div id={'cy'} />
    </>
  )
}
