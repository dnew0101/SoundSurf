import Ship from './Ship'

const AnimatedShip = (props) => {
  return (
    <>
      <Ship
        {...props}
        rotation={[0, 0, 0]}
      />
    </>
  )
}

export default AnimatedShip