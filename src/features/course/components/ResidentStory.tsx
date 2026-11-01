function ResidentStory({
  label,
  residentIntro,
  reason,
  howToEnjoy,
}: {
  label: string
  residentIntro: string
  reason: string
  howToEnjoy: string
}) {
  return (
    <div className="local-story">
      <span className="small-label">{label}</span>
      <blockquote>“{reason}”</blockquote>
      <p>{howToEnjoy}</p>
      <p className="resident">{residentIntro}</p>
    </div>
  )
}

export default ResidentStory
