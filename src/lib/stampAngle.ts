/**
 * 도장마다 미세하게 다른 기울기.
 * 판이 자동 생성된 것이 아니라 손으로 눌러 관리된 것처럼 보이게 하는 장치다.
 * 멤버 id에서 결정론적으로 뽑으므로 리렌더에도 각도가 흔들리지 않는다.
 */
export function angleFor(memberId: string, assignmentId = ''): number {
  const key = `${memberId}:${assignmentId}`
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0
  }
  // -3 … 3 도, 0.5도 단위
  const steps = Math.abs(h) % 13
  return (steps - 6) / 2
}
