import React, { useEffect, useMemo, useState } from 'react'
import { useSigma } from 'react-sigma-v2'
import { MdCategory } from 'react-icons/md'
import { keyBy, mapValues, sortBy, values } from 'lodash'
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai'

import Panel from './Panel'
import PropTypes from 'prop-types'

const TagsPanel = (props) => {
  const { tags, toggleTag, setFilters, filters } = props
  const [nodesPerTag, setNodesPerTag] = useState({})
  const [visibleNodesPerTag, setVisibleNodesPerTag] = useState(nodesPerTag)

  const sigma = useSigma()
  const graph = sigma.getGraph()

  useEffect(() => {
    let index = {}
    graph.forEachNode((node, { tag }) => {
      index[tag] = (index[tag] || 0) + 1
    })
    setNodesPerTag(index)
  }, [tags])

  const maxNodesPerTag = useMemo(
    () => Math.max(...values(nodesPerTag)),
    [nodesPerTag]
  )
  const visibleTagsCount = useMemo(
    () => Object.keys(filters.tags).length,
    [filters.tags]
  )

  useEffect(() => {
    // To ensure the graphology instance has up to data "hidden" values for
    // nodes, we wait for next frame before reindexing. This won't matter in the
    // UX, because of the visible nodes bar width transition.
    requestAnimationFrame(() => {
      const index /*: Record<string, number>*/ = {}
      graph.forEachNode(
        (_, { tag, hidden }) => !hidden && (index[tag] = (index[tag] || 0) + 1)
      )
      setVisibleNodesPerTag(index)
    })
  }, [filters])

  const sortedTags = useMemo(
    () =>
      sortBy(tags, (tag) =>
        tag.key === 'unknown' ? Infinity : -nodesPerTag[tag.key]
      ),
    [tags, nodesPerTag]
  )

  return (
    <Panel
      title={
        <>
          <MdCategory className="text-muted" /> Categories
          {visibleTagsCount < tags.length ? (
            <span className="text-muted text-small">
              {' '}
              ({visibleTagsCount} / {tags.length})
            </span>
          ) : (
            ''
          )}
        </>
      }
    >
      <p>
        <i className="text-muted">
          Click a category to show/hide related pages from the network.
        </i>
      </p>
      <p className="buttons">
        <button
          className="btn"
          onClick={() => setFilters(mapValues(keyBy(tags, 'key'), () => true))}
        >
          <AiOutlineCheckCircle /> Check all
        </button>{' '}
        <button className="btn" onClick={() => setFilters({})}>
          <AiOutlineCloseCircle /> Uncheck all
        </button>
      </p>
      <ul>
        {sortedTags.map((tag) => {
          const nodesCount = nodesPerTag[tag.key]
          const visibleNodesCount = visibleNodesPerTag[tag.key] || 0
          return (
            <li
              className="caption-row"
              key={tag.key}
              title={`${nodesCount} page${nodesCount > 1 ? 's' : ''}${
                visibleNodesCount !== nodesCount
                  ? ` (only ${visibleNodesCount} visible)`
                  : ''
              }`}
            >
              <input
                type="checkbox"
                checked={filters.tags[tag.key] || false}
                onChange={() => toggleTag(tag.key)}
                id={`tag-${tag.key}`}
              />
              <label htmlFor={`tag-${tag.key}`}>
                <span
                  className="circle"
                  style={{
                    backgroundColor: tag.color,
                  }}
                />{' '}
                <div className="node-label">
                  <span>{tag.key}</span>
                  <div
                    className="bar"
                    style={{ width: (100 * nodesCount) / maxNodesPerTag + '%' }}
                  >
                    <div
                      className="inside-bar"
                      style={{
                        width: (100 * visibleNodesCount) / nodesCount + '%',
                      }}
                    />
                  </div>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

TagsPanel.propTypes = {
  tags: PropTypes.array, // List<{key: string, color: string}>
  filters: PropTypes.object, // { tags: { subject: boolean }}
  toggleTag: PropTypes.func, // (tag: string) => void
  setFilters: PropTypes.func,
}

export default TagsPanel
