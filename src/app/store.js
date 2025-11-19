import { configureStore } from '@reduxjs/toolkit'
import scanReducer from '../features/scan/ScanResultCard' // placeholder reducer import to avoid missing import in minimal scaffold

const store = configureStore({
  reducer: {
    scan: (state = {}) => state
  }
})

export default store
