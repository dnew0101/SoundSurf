import { useMemo } from 'react'
import { TRACK_LENGTH } from '@/shared/constants'
import { TARGET_COLORS } from '@/shared/road'

import TargetInstance from './TargetInstances'

const Targets = () => {
  return (
    useMemo(() => Array.from({ length: 20 }, (_, index) => ({
      lane: Math.floor(Math.random() * 3),
      z: -(index * (TRACK_LENGTH / 20)),
      color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
    })).map((target, index) => (
      <TargetInstance
        key={`target-${index}`}
        lane={target.lane}
        z={target.z}
        color={target.color}
      />
    )), [])
  )
}

export default Targets