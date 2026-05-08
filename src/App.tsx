import { motion } from 'framer-motion'
import { WishFlow } from './components/WishFlow'
import { useWishes } from './hooks/useWishes'

function App() {
  const { addWish } = useWishes()

  return (
    <div className="app-root">
      <motion.div
        key="flow"
        className="view-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <WishFlow onClose={() => {}} onOpenWall={() => {}} addWish={addWish} />
      </motion.div>
    </div>
  )
}

export default App
