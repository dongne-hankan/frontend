import type { Neighborhood } from '../api/myApi'

function NeighborhoodGrid({ grid }: { grid: Neighborhood['grid'] }) {
  const cellOf = (regionId: number, tagId: number) =>
    grid.cells.find((cell) => cell.regionId === regionId && cell.tagId === tagId)

  return (
    <table className="cell-grid">
      <caption className="sr-only">지역과 경험별로 채운 칸</caption>
      <thead>
        <tr>
          <th aria-hidden="true" />
          {grid.tags.map((tag) => (
            <th key={tag.tagId} scope="col">
              {tag.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.regions.map((region) => (
          <tr key={region.regionId}>
            <th scope="row">{region.name}</th>
            {grid.tags.map((tag) => {
              const cell = cellOf(region.regionId, tag.tagId)
              return (
                <td key={tag.tagId} className={cell?.filled ? 'filled' : undefined}>
                  {cell?.filled ? `${cell.recordCount}회` : <span className="sr-only">빈 칸</span>}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default NeighborhoodGrid
