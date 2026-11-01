const PROVINCE_LABELS: Record<string, string> = {
  DAEGU: '대구',
  GYEONGBUK: '경북',
}

export function regionLabel(region: { name: string; province: string }) {
  return `${PROVINCE_LABELS[region.province] ?? ''} ${region.name}`.trim()
}

export function minutesLabel(minutes: number) {
  return minutes < 60 ? `${minutes}분` : `${minutes / 60}시간`
}
