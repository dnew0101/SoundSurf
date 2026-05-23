// components/Targets/Targets.js
import useStore from '@/shared/store'
import TargetInstance from './TargetInstances'

const Targets = () => {
  // Pull the actual parsed targets from your audio analyzer
  const targets = useStore((state) => state.trackTargets)

  if (!targets || targets.length === 0) return null

  return (
    <>
      {targets.map((target, index) => (
        <TargetInstance
          key={`target-${index}`}
          lane={target.lane}
          z={target.z}
          color={target.color}
        />
      ))}
    </>
  )
}

export default Targets